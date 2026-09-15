import { describe, expect, test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildValidators, validateGoldenVectors } from "./validate-fixtures";

const validators = buildValidators();
const goldenRoot = join(import.meta.dir, "fixtures", "golden");
const configuration = "collection/typedmark.md";
const schema = "collection/.typedmark/schemas/meeting.md";
const template = "collection/.typedmark/templates/meeting.md";
const note = "collection/Meetings/2026-06-10 - Kickoff.md";
const report = "expected-validation-report.json";
const markdownPaths = [configuration, schema, template, note];
const optionalPaths = [["template", template], ["note", note]] as const;

function original(path: string, vector = "core-valid"): string {
  return readFileSync(join(goldenRoot, vector, path), "utf8");
}

function checkFiles(files: Record<string, string | Uint8Array>, source = "core-valid"): string[] {
  const root = mkdtempSync(join(tmpdir(), "typedmark-fixture-input-"));
  try {
    const vector = join(root, source);
    cpSync(join(goldenRoot, source), vector, { recursive: true });
    for (const [relativePath, contents] of Object.entries(files)) {
      const path = join(vector, relativePath);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, contents);
    }
    const failures: string[] = [];
    expect(validateGoldenVectors(validators, failures, root)).toBe(1);
    // Input checking preserves the original bytes, including bodies and BOMs.
    for (const [relativePath, contents] of Object.entries(files)) {
      expect(readFileSync(join(vector, relativePath))).toEqual(Buffer.from(contents));
    }
    return failures;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function corruptUtf8(text: string, marker: string, bytes: number[]): Buffer {
  const offset = text.indexOf(marker);
  if (offset < 0) throw new Error(`test input is missing ${marker}`);
  return Buffer.concat([
    Buffer.from(text.slice(0, offset)),
    Buffer.from(bytes),
    Buffer.from(text.slice(offset + marker.length)),
  ]);
}

describe("golden Markdown input grammar", () => {
  test.each([
    ["LF", "\n", ""],
    ["LF with BOM", "\n", "\uFEFF"],
    ["CRLF", "\r\n", ""],
    ["CRLF with BOM", "\r\n", "\uFEFF"],
    ["CR", "\r", ""],
    ["CR with BOM", "\r", "\uFEFF"],
  ])("accepts %s in governed artifacts, templates, and notes", (_label, newline, bom) => {
    const files = Object.fromEntries(markdownPaths.map((path) => [
      path, bom + original(path).replace(/\r\n?|\n/g, newline),
    ]));
    expect(checkFiles(files)).toEqual([]);
  });

  test.each([" ---", "--- ", "\uFEFF\uFEFF---"])(
    "rejects a required frontmatter opener that is not exact: %j", (opening) => {
      expect(checkFiles({ [configuration]: original(configuration).replace(/^---/, opening) }))
        .not.toEqual([]);
    },
  );

  test("accepts an ellipsis closing delimiter at EOF", () => {
    const source = original(configuration).replace(/\r\n?/g, "\n");
    const closing = source.indexOf("\n---", 4);
    expect(closing).toBeGreaterThan(0);
    expect(checkFiles({ [configuration]: source.slice(0, closing) + "\n..." })).toEqual([]);
  });

  test.each([
    ["no block", "# Plain Markdown\n---\n[body text\n"],
    ["an unclosed opening", "---\nnote_type: [unterminated\n"],
  ])("accepts optional frontmatter with %s", (_label, source) => {
    expect(checkFiles({ [template]: source, [note]: source })).toEqual([]);
  });

  test("keeps later delimiters and invalid YAML in the body", () => {
    const source = "---\nnote_type: meeting\n---\r\n---\r[unterminated\n...\r\n";
    expect(checkFiles({ [template]: source, [note]: source })).toEqual([]);
  });

  for (const [label, path] of optionalPaths) {
    test.each(["!!set {}", "!!omap []"])(
      `rejects top-level %s in optional ${label} frontmatter`, (value) => {
        expect(checkFiles({ [path]: `---\n${value}\n---\nBody.\n` }).join("\n"))
          .toContain("frontmatter must be a mapping");
      },
    );
  }

  test("recognizes invalid optional frontmatter with CR-only delimiters", () => {
    expect(checkFiles({ [note]: "---\r[one, two]\r---\rBody.\r" }).join("\n"))
      .toContain("frontmatter must be a mapping");
  });

  test("keeps nested tagged metadata opaque when parsing optional frontmatter", () => {
    const source = "---\nnote_type: meeting\nx_editor:\n"
      + "  selection: !!set {one: null, two: null}\n"
      + "  order: !!omap [{one: 1}, {two: 2}]\n---\nBody.\n";
    expect(checkFiles({ [template]: source, [note]: source })).toEqual([]);
  });
});

describe("golden UTF-8 input boundaries", () => {
  test.each([
    ["configuration frontmatter", configuration, original(configuration), "Canonical", [0xC3, 0x28]],
    ["configuration body", configuration, original(configuration), "complete", [0x80]],
    ["schema body", schema, original(schema), "records", [0xED, 0xA0, 0x80]],
    ["template without frontmatter", template, "# Template\nBroken bytes: HERE\n", "HERE", [0xC0, 0xAF]],
    ["managed-note body", note, original(note), "kickoff", [0xF4, 0x90, 0x80, 0x80]],
  ] as const)("rejects malformed UTF-8 in %s", (_label, path, source, marker, bytes) => {
    expect(checkFiles({ [path]: corruptUtf8(source, marker, [...bytes]) }).join("\n"))
      .toMatch(/utf-?8/i);
  });

  test("rejects malformed UTF-8 inside an otherwise valid expected-report message", () => {
    const vector = "unsupported-required-extension";
    const value = JSON.parse(original(report, vector));
    value.results[0].message = "HERE";
    expect(checkFiles({
      [report]: corruptUtf8(JSON.stringify(value), "HERE", [0xE2, 0x82]),
    }, vector).join("\n")).toMatch(/utf-?8/i);
  });

  test("reports malformed UTF-8 before validating optional JSON context", () => {
    const vector = "unsupported-required-extension";
    expect(checkFiles({
      "vector.json": corruptUtf8(original("vector.json", vector), "review", [0xFF]),
    }, vector).join("\n")).toMatch(/utf-?8/i);
  });

  test("rejects malformed UTF-8 in otherwise valid optional query predicate text", () => {
    const vector = "query-pilot-valid";
    expect(checkFiles({
      "query-cases.json": corruptUtf8(original("query-cases.json", vector),
        "draft", [0xFF]),
    }, vector).join("\n")).toMatch(/utf-?8/i);
  });

  test("accepts an encoded replacement character and preserves interior BOMs", () => {
    const files = Object.fromEntries(markdownPaths.map((path) => [
      path, original(path).replace("Canonical", "Literal \uFFFD")
        + "\r\nLiteral \uFFFD and interior \uFEFF.\r\n---\r\n[body text\r",
    ]));
    expect(checkFiles(files)).toEqual([]);
  });

  test("leaves non-Markdown binary assets outside text decoding", () => {
    expect(checkFiles({ "collection/Assets/sample.bin": Buffer.from([0x00, 0xFF, 0xC0, 0x80]) }))
      .toEqual([]);
  });

  test("preserves the JSON caller's rejection of a leading BOM", () => {
    expect(checkFiles({ [report]: "\uFEFF" + original(report) })).not.toEqual([]);
  });
});
