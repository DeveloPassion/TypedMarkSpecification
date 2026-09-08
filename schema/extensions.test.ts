import { describe, expect, test } from "bun:test";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { buildValidators, validateGoldenVectors } from "./validate-fixtures";

const validators = buildValidators();
const lineTerminators = ["\n", "\r", "\r\n", "\u2028", "\u2029"];
const whitespaceVersions = [...lineTerminators, " ", "\t", "\v", "\f", "\u00a0"]
  .flatMap((ending) => [`1.2.0${ending}`, `1.2.0-rc.1+build.7${ending}`]);
const collection = {
  specification_version: "0.1.0",
  name: "example",
  description: "An extension-aware collection.",
};

function fixture(file: string, bucket = "valid"): Record<string, unknown> {
  const text = readFileSync(join(import.meta.dir, "fixtures", bucket, file), "utf8");
  return file.endsWith(".json") ? JSON.parse(text) : parseYaml(text.split("---")[1]!);
}

function set(document: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split(".");
  let target = document;
  for (const key of segments.slice(0, -1)) target = target[key] as Record<string, unknown>;
  target[segments.at(-1)!] = value;
}

describe("required extension declarations", () => {
  test.each([
    undefined, {}, { "example:review": "1.2.0" },
    { "org.example:review-notes": "1.2.0-rc.1+build.7", "typedmark:example": "0.0.1" },
  ].map((value) => [value]))("accepts an omitted, empty, or exact-version map: %j", (extensions) => {
    const document = extensions === undefined ? collection : { ...collection, extensions };
    expect(validators.typedmark!(document)).toBe(true);
  });

  test.each([
    null, [], ["example:review"], "example:review",
    { review: "1.2.0" }, { "Example:review": "1.2.0" },
    { "example:review_notes": "1.2.0" }, { "example:review.notes": "1.2.0" },
    { "example..org:review": "1.2.0" }, { ":review": "1.2.0" },
    { "example:": "1.2.0" }, { " example:review": "1.2.0" },
    ...lineTerminators.map((ending) => ({ [`example:review${ending}`]: "1.2.0" })),
    { "example:review": 1 }, { "example:review": null },
    { "example:review": { version: "1.2.0", optional: true } },
    { "example:review": "" }, { "example:review": "1.2" },
    { "example:review": "01.2.0" }, { "example:review": "1.2.0-01" },
    { "example:review": "^1.2.0" }, { "example:review": "~1.2.0" },
    { "example:review": ">=1.2.0" }, { "example:review": "*" },
    { "example:review": "1.2.x" }, { "example:review": "latest" },
  ].map((value) => [value]))("rejects invalid declarations: %j", (extensions) => {
    expect(validators.typedmark!({ ...collection, extensions })).toBe(false);
  });

  test.each(whitespaceVersions)("rejects a whitespace-suffixed extension version: %j", (version) => {
    expect(validators.typedmark!({
      ...collection, extensions: { "example:review": version },
    })).toBe(false);
  });

  test.each(["error", "warn", "info", "off"])("accepts extension severity %s", (severity) => {
    expect(validators.typedmark!({
      ...collection,
      validation_defaults: {
        invalid_extension_declaration: severity,
        unsupported_extension: severity,
      },
    })).toBe(true);
  });

  test("rejects an unknown severity for the new categories", () => {
    expect(validators.typedmark!({
      ...collection, validation_defaults: { unsupported_extension: "ignore" },
    })).toBe(false);
  });
});

const metadataArtifacts = [
  ["typedmark", "typedmark-core-shorthand.md", "validation_defaults", {}],
  ["note-type", "note-type-core-shorthand.md", "storage", undefined],
  ["property-set", "property-set-review-metadata.md", "headings", undefined],
  ["automation", "automation-daily-review.md", "trigger", undefined],
  ["dataset", "dataset-actions.md", "query", undefined],
  ["view", "view-actions-board.md", "presentation", undefined],
  ["history", "history.md", "history.0", undefined],
] as const;

describe("inert top-level vendor metadata", () => {
  for (const [artifact, file, structuralPath, initial] of metadataArtifacts) {
    test(`${artifact} accepts arbitrary inert values without requiring extensions`, () => {
      const document = fixture(file);
      for (const value of [null, false, 7, "blue", ["a", 1], { nested: { any_key: true } }]) {
        document.x_editor = value;
        expect(validators[artifact]!(document)).toBe(true);
      }
    });

    test.each([
      "x_", "x_Editor", "x_2editor", "x_editor-name", "x_editor.color", "unknown",
      ...lineTerminators.map((ending) => `x_editor${ending}`),
    ])(
      `${artifact} rejects undeclared key %s`, (key) => {
        expect(validators[artifact]!({ ...fixture(file), [key]: true })).toBe(false);
      },
    );

    test(`${artifact} keeps structural blocks closed`, () => {
      const document = fixture(file);
      if (initial !== undefined) set(document, structuralPath, initial);
      set(document, `${structuralPath}.x_editor`, {});
      expect(validators[artifact]!(document)).toBe(false);
    });

    test(`${artifact} still validates known fields beside vendor metadata`, () => {
      expect(validators[artifact]!({
        ...fixture(file), x_editor: {}, specification_version: 42,
      })).toBe(false);
    });

    if (artifact !== "typedmark") {
      test(`${artifact} cannot declare required extensions`, () => {
        expect(validators[artifact]!({
          ...fixture(file), extensions: { "example:review": "1.2.0" },
        })).toBe(false);
      });
    }
  }

  test.each([
    ["note-type", "note-type-core-shorthand.md", "frontmatter.title"],
    ["property-set", "property-set-review-metadata.md", "frontmatter.rating"],
    ["dataset", "dataset-actions.md", "query.select.2.definition"],
  ])("does not open shared field definitions in %s", (artifact, file, path) => {
    const document = fixture(file);
    set(document, `${path}.x_editor`, {});
    expect(validators[artifact]!(document)).toBe(false);
  });

  test("an x-prefixed declared note field remains an ordinary typed field", () => {
    const document = fixture("note-type-core-shorthand.md");
    set(document, "frontmatter.x_notes", { type: "text", nullable: true });
    expect(validators["note-type"]!(document)).toBe(true);
    set(document, "frontmatter.x_notes", { arbitrary: "not a field definition" });
    expect(validators["note-type"]!(document)).toBe(false);
  });

  test.each([
    ["query", "query-project-dashboard.json"],
    ["expansion", "expansion-self-field.json"],
    ["template-region", "template-region.json"],
    ["template-tracking", "template-tracking-empty.json"],
    ["marketplace", "marketplace.json"],
    ["automation-event", "automation-event-note-updated.json"],
    ["automation-run-report", "automation-run-report-one-hop.json"],
  ])("%s has no vendor-metadata exception", (artifact, file) => {
    expect(validators[artifact]!({ ...fixture(file), x_editor: true })).toBe(false);
  });
});

const result = {
  code: "invalid_extension_declaration", severity: "error", path: "typedmark.md",
  rule_id: "EXT-14", message: "A required dependency is omitted.",
};
const report = {
  specification_version: "0.1.0", mode: "instantiated_collection",
  evaluation: "complete", required_extensions: {}, evaluated_extensions: {},
  valid: true, results: [],
};

describe("extension-aware validation reports", () => {
  test.each([
    ["complete", true, [], true],
    ["complete", true, [{ ...result, severity: "warn" }], true],
    ["complete", false, [result], true],
    ["incomplete", false, [], true],
    ["incomplete", false, [result], true],
    ["incomplete", false, [{ ...result, severity: "info" }], true],
    ["complete", true, [result], false],
    ["complete", false, [], false],
    ["complete", false, [{ ...result, severity: "warn" }], false],
    ["incomplete", true, [], false],
    ["incomplete", true, [result], false],
    ["unknown", false, [result], false],
  ])("checks %s / valid=%s / results=%j", (evaluation, valid, results, expected) => {
    expect(validators["validation-report"]!({ ...report, evaluation, valid, results }))
      .toBe(expected);
  });

  function checkGoldenReport(
    expected: Record<string, unknown>,
    extensions?: Record<string, string>,
  ): string[] {
    const root = join(import.meta.dir, `.extension-test-${crypto.randomUUID()}`);
    try {
      const vector = join(root, "example");
      cpSync(join(import.meta.dir, "fixtures", "golden", "core-valid"), vector, { recursive: true });
      writeFileSync(join(vector, "expected-validation-report.json"), JSON.stringify(expected));
      const typedmarkPath = join(vector, "collection", "typedmark.md");
      const text = readFileSync(typedmarkPath, "utf8");
      if (extensions !== undefined) {
        writeFileSync(typedmarkPath, text.replace("---", `---\nextensions: ${JSON.stringify(extensions)}`));
      }
      const failures: string[] = [];
      validateGoldenVectors(validators, failures, root);
      return failures;
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  describe("expected golden report extension coverage", () => {
    const required = { "example:review": "1.2.0-rc.1+build.7" };

    test("an omitted declaration matches empty report maps", () => {
      expect(checkGoldenReport(report)).toEqual([]);
    });

    test("complete interpreted contracts match regardless of map key order", () => {
      const declarations = { ...required, "example:labels": "2.0.0" };
      expect(checkGoldenReport({
        ...report, required_extensions: declarations,
        evaluated_extensions: { "example:labels": "2.0.0", ...required },
      }, declarations)).toEqual([]);
    });

    test("required report extensions must match the collection declaration", () => {
      expect(checkGoldenReport(report, required).join("\n"))
        .toContain("required_extensions must match the collection");
    });

    test.each(["1.2.0-rc.2+build.7", "1.2.0-rc.1+build.8"])(
      "evaluated versions must match exactly, not %s", (version) => {
        expect(checkGoldenReport({
          ...report, required_extensions: required,
          evaluated_extensions: { "example:review": version },
        }, required).join("\n")).toContain("evaluated_extensions must be an exact subset");
      },
    );

    test("evaluated entries cannot introduce undeclared extensions", () => {
      expect(checkGoldenReport({
        ...report, evaluated_extensions: required,
      }).join("\n")).toContain("evaluated_extensions must be an exact subset");
    });

    test("complete reports cover every required extension", () => {
      expect(checkGoldenReport({
        ...report, required_extensions: required,
      }, required).join("\n")).toContain("complete report must evaluate every required extension");
    });

    test("incomplete reports may cover only a subset with all diagnostics suppressed", () => {
      expect(checkGoldenReport({
        ...report, evaluation: "incomplete", valid: false, required_extensions: required,
      }, required)).toEqual([]);
    });

    test("incomplete core evaluation need not have missing extensions", () => {
      expect(checkGoldenReport({ ...report, evaluation: "incomplete", valid: false })).toEqual([]);
    });

    test("extension is the final canonical result ordering component", () => {
      const declarations = { "example:labels": "2.0.0", "example:review": "1.2.0" };
      const results = ["example:review", "example:labels"].map((extension) => ({
        ...result, code: "unsupported_extension", rule_id: "EXT-19", extension,
      }));
      const incomplete = {
        ...report, evaluation: "incomplete", valid: false,
        required_extensions: declarations, results,
      };
      expect(checkGoldenReport(incomplete, declarations).join("\n"))
        .toContain("expected report results to use canonical order");
      expect(checkGoldenReport({ ...incomplete, results: results.toReversed() }, declarations))
        .toEqual([]);
    });
  });

  test.each(["evaluation", "required_extensions", "evaluated_extensions"])(
    "requires %s", (key) => {
      const document: Record<string, unknown> = { ...report };
      delete document[key];
      expect(validators["validation-report"]!(document)).toBe(false);
    },
  );

  test.each(["required_extensions", "evaluated_extensions"])(
    "%s uses the reusable exact-version map", (key) => {
      expect(validators["validation-report"]!({
        ...report, [key]: { "org.example:review": "1.2.0-rc.1+build.7" },
      })).toBe(true);
      for (const value of [
        [], { review: "1.2.0" }, { "example:review": "^1.2.0" },
        ...whitespaceVersions.map((version) => ({ "example:review": version })),
      ]) {
        expect(validators["validation-report"]!({ ...report, [key]: value })).toBe(false);
      }
    },
  );

  test("requires valid extension context for unsupported_extension", () => {
    const unsupported = { ...result, code: "unsupported_extension", rule_id: "EXT-19" };
    const document = {
      ...report, evaluation: "incomplete", valid: false,
      required_extensions: { "example:review": "1.2.0" },
    };
    expect(validators["validation-report"]!({ ...document, results: [unsupported] })).toBe(false);
    expect(validators["validation-report"]!({
      ...document, results: [{ ...unsupported, extension: "example:review" }],
    })).toBe(true);
    expect(validators["validation-report"]!({
      ...document, results: [{ ...unsupported, extension: "review" }],
    })).toBe(false);
  });

  test("allows optional extension context on other results", () => {
    expect(validators["validation-report"]!({
      ...report, valid: false, results: [{ ...result, extension: "example:review" }],
    })).toBe(true);
  });

  test.each(lineTerminators)("rejects extension context ending in %j", (ending) => {
    expect(validators["validation-report"]!({
      ...report, valid: false, results: [{ ...result, extension: `example:review${ending}` }],
    })).toBe(false);
  });

  test("reports and results remain closed to vendor metadata", () => {
    expect(validators["validation-report"]!({ ...report, x_editor: {} })).toBe(false);
    expect(validators["validation-report"]!({
      ...report, valid: false, results: [{ ...result, x_editor: {} }],
    })).toBe(false);
  });

  test.each(["validation-report-invalid-without-error.json", "validation-report-off-result.json"])(
    "%s fails for its original reason, not missing template context", (file) => {
      const validate = validators["validation-report"]!;
      expect(validate(fixture(file, "invalid-shape"))).toBe(false);
      expect(validate.errors?.filter((error) => error.keyword === "required")).toEqual([]);
    },
  );
});
