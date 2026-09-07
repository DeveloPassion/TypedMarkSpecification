import { describe, expect, test } from "bun:test";
import { lintSpecification, type RuleRegistry } from "./lint-rule-ids";

const registry: RuleRegistry = {
  prefixes: {
    CM: { page: "collection.md", last: 2 },
    QRY: { page: "queries.md", last: 0 },
  },
  relocations: {},
  retired: {},
};

function page(rules: string, prose = ""): string {
  return `---
audience: essentials
---
Audience: authors.
Authoritative for:
- this concern
See also:
- related concerns

${prose}

Rules:

${rules}
`;
}

function documents() {
  return {
    "collection.md": page("- `CM-1` A rule MUST hold.\n- `CM-2` Another rule MUST hold."),
    "queries.md": page(""),
  };
}

describe("historical rule identities", () => {
  test("accepts all allocated rules at their registered owners", () => {
    expect(lintSpecification(documents(), registry)).toEqual([]);
  });

  test("a mechanical move keeps its original identifier", () => {
    const docs = documents();
    docs["collection.md"] = page("- `CM-1` A rule MUST hold.");
    docs["queries.md"] = page("- `CM-2` Another rule MUST hold.");
    expect(lintSpecification(docs, {
      ...registry, relocations: { "CM-2": "queries.md" },
    })).toEqual([]);
  });

  test("rejects an unregistered move", () => {
    const docs = documents();
    docs["collection.md"] = page("- `CM-1` A rule MUST hold.");
    docs["queries.md"] = page("- `CM-2` Another rule MUST hold.");
    expect(lintSpecification(docs, registry).join("\n")).toContain("CM-2 belongs to collection.md");
  });

  test("a missing highest identifier is not silently forgotten", () => {
    const docs = documents();
    docs["collection.md"] = page("- `CM-1` A rule MUST hold.");
    expect(lintSpecification(docs, registry).join("\n")).toContain("CM-2 is missing");
  });

  test("retirement requires an explicit record and forbids reuse", () => {
    const retired = { ...registry, retired: { "CM-2": "Replaced by CM-1." } };
    const docs = documents();
    expect(lintSpecification(docs, retired).join("\n")).toContain("CM-2 is retired");
    docs["collection.md"] = page("- `CM-1` A rule MUST hold.");
    expect(lintSpecification(docs, retired)).toEqual([]);
  });

  test("rejects duplicate and unallocated identifiers", () => {
    const docs = documents();
    docs["collection.md"] = page(
      "- `CM-1` A rule MUST hold.\n- `CM-1` A duplicate MUST fail.\n- `CM-3` An unallocated rule MUST fail.",
    );
    const failures = lintSpecification(docs, registry).join("\n");
    expect(failures).toContain("duplicate identifier CM-1");
    expect(failures).toContain("CM-3 is not allocated");
  });

  test("new identifiers require increasing their prefix allocation", () => {
    const docs = documents();
    docs["queries.md"] = page("- `QRY-1` A new rule MUST hold.");
    expect(lintSpecification(docs, {
      ...registry,
      prefixes: { ...registry.prefixes, QRY: { page: "queries.md", last: 1 } },
    })).toEqual([]);
  });

  test("rejects stale relocation targets and unallocated retirements", () => {
    const failures = lintSpecification(documents(), {
      ...registry,
      relocations: { "CM-2": "missing.md" },
      retired: { "CM-3": "Never allocated." },
    }).join("\n");
    expect(failures).toContain("missing.md");
    expect(failures).toContain("CM-3 is not allocated");
  });
});

describe("rule references and existing lint rules", () => {
  test("rejects dangling references outside rule lists", () => {
    const docs = { ...documents(), "guide.md": "See `CM-99` and [the rule](collection.md#CM-98)." };
    const failures = lintSpecification(docs, registry).join("\n");
    expect(failures).toContain("unknown rule reference CM-99");
    expect(failures).toContain("unknown rule reference CM-98");
  });

  test("retired references must be replaced in live documentation", () => {
    const docs = documents();
    docs["collection.md"] = page("- `CM-1` A rule MUST hold.", "See `CM-2`.");
    expect(lintSpecification(docs, {
      ...registry, retired: { "CM-2": "Replaced by CM-1." },
    }).join("\n")).toContain("retired rule reference CM-2");
  });

  test("code examples are not interpreted as rule declarations or prose references", () => {
    const docs = documents();
    docs["collection.md"] += "\n```text\nRules:\n- `CM-99` MUST not be linted.\n```\n";
    expect(lintSpecification(docs, registry)).toEqual([]);
  });

  test("standard names in prose are not mistaken for rule references", () => {
    const docs = documents();
    docs["collection.md"] += "\nUse UTF-8 and SHA-256.\n";
    expect(lintSpecification(docs, registry)).toEqual([]);
  });

  test("unknown identifier chips still report a mistyped prefix", () => {
    const docs = documents();
    docs["collection.md"] += "\nSee `CX-1`.\n";
    expect(lintSpecification(docs, registry).join("\n")).toContain("unknown rule reference CX-1");
  });

  test("tilde and longer backtick fences hide examples without hiding later prose", () => {
    const docs = documents();
    docs["collection.md"] += "\n~~~text\nMUST ignore `CM-98`.\n~~~\n"
      + "````markdown\n```\nMUST ignore `CM-99`.\n```\n````\nSee `CM-77`.\n";
    const failures = lintSpecification(docs, registry).join("\n");
    expect(failures).not.toContain("CM-98");
    expect(failures).not.toContain("CM-99");
    expect(failures).toContain("unknown rule reference CM-77");
  });

  test("preserves missing chip, preamble, and misplaced keyword diagnostics", () => {
    const docs = documents();
    docs["collection.md"] = "Rules:\n\n- A rule MUST carry an identifier.\n\nMUST not appear in prose.\n";
    const failures = lintSpecification(docs, registry).join("\n");
    expect(failures).toContain("rule without identifier");
    expect(failures).toContain("missing required preamble element");
    expect(failures).toContain("normative keyword outside an identified rule");
  });
});
