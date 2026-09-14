import { describe, expect, test } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { buildValidators, validateExamples, validateGoldenVectors } from "./validate-fixtures";

const validators = buildValidators();
const collection = "specification_version: 0.1.0\nname: example\ndescription: Example collection.";
const noteType = "specification_version: 0.1.0\ndescription: Example note type.\nabstract: true";

const structuralLocations = [
  ["collection validation defaults", "typedmark", `${collection}\nvalidation_defaults:`, "/validation_defaults"],
  ["collection vocabularies", "typedmark", `${collection}\nvocabularies:`, "/vocabularies"],
  ["note-type frontmatter", "note-type", `${noteType}\nfrontmatter:`, "/frontmatter"],
  ["nested object fields", "note-type", `${noteType}\nfrontmatter:\n  x_notes:\n    type: object\n    fields:`, "/frontmatter/x_notes/fields"],
  ["object fields inside list items", "note-type", `${noteType}\nfrontmatter:\n  rows:\n    type: list\n    items:\n      type: object\n      fields:`, "/frontmatter/rows/items/fields"],
] as const;

describe("tagged YAML structural containers", () => {
  for (const [label, artifact, source, instancePath] of structuralLocations) {
    test.each(["!!set {}", "!!omap []"])(`rejects %s as ${label}`, (tagged) => {
      const validate = validators[artifact]!;
      expect(validate(parseYaml(`${source} ${tagged}`))).toBe(false);
      expect(validate.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ instancePath, keyword: "type" }),
      ]));
    });
  }

  test.each(["!!timestamp 2026-09-15T12:34:56Z", '!!binary ""'])(
    "rejects other native tagged values as structural mappings: %s", (tagged) => {
      const validate = validators.typedmark!;
      expect(validate(parseYaml(`${collection}\nvalidation_defaults: ${tagged}`))).toBe(false);
      expect(validate.errors?.some((error) =>
        error.instancePath === "/validation_defaults" && error.keyword === "type")).toBe(true);
    },
  );

  test("refreshes validator errors on failing and successful calls", () => {
    const validate = validators.typedmark!;
    expect(validate(parseYaml(`${collection}\nvalidation_defaults: !!set {}`))).toBe(false);
    expect(validate.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ instancePath: "/validation_defaults", keyword: "type" }),
    ]));

    expect(validate(parseYaml(`${collection}\nvalidation_defaults: {}`))).toBe(true);
    expect(validate.errors).toBeNull();

    expect(validate(parseYaml(`${collection}\nvocabularies: !!omap []`))).toBe(false);
    expect(validate.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ instancePath: "/vocabularies", keyword: "type" }),
    ]));
    expect(validate.errors?.some((error) => error.instancePath === "/validation_defaults")).toBe(false);

    expect(validate(parseYaml(collection))).toBe(true);
    expect(validate.errors).toBeNull();
  });
});

describe("opaque YAML values", () => {
  test.each([
    "!!set {one: null, two: null}",
    "!!omap [{one: 1}, {two: 2}]",
    "!!timestamp 2026-09-15T12:34:56Z",
    "!!binary SGVsbG8=",
  ])("accepts %s inside vendor metadata without changing the value", (tagged) => {
    const document = parseYaml(`${collection}\nx_editor:\n  validation_defaults: ${tagged}`);
    const metadata = document.x_editor;
    const original = metadata.validation_defaults;
    const snapshot = structuredClone(original);
    expect(validators.typedmark!(document)).toBe(true);
    expect(document.x_editor).toBe(metadata);
    expect(document.x_editor.validation_defaults).toBe(original);
    // Buffer's structured clone is a Uint8Array; compare the bytes in that case.
    expect(Buffer.isBuffer(original) ? [...original] : original)
      .toEqual(Buffer.isBuffer(original) ? [...snapshot] : snapshot);
  });

  // Default/constant type conformance stays semantic; allowed_values also has
  // the scalar-only shape constraint from FDR-197.
  test.each([
    ["default_value", "!!set {one: null}", true],
    ["const_value", "!!omap [{one: 1}]", true],
    ["allowed_values", "[!!set {one: null}]", false],
  ] as const)("preserves %s input while checking its shape", (property, literal, valid) => {
    const document = parseYaml(`${noteType}\nfrontmatter:\n  value:\n    type: text\n    ${property}: ${literal}`);
    const field = document.frontmatter.value;
    const original = field[property];
    const snapshot = structuredClone(original);
    expect(validators["note-type"]!(document)).toBe(valid);
    expect(document.frontmatter.value).toBe(field);
    expect(field[property]).toBe(original);
    expect(field[property]).toEqual(snapshot);
  });

  test("preserves aliases shared between metadata and an unconstrained literal", () => {
    const document = parseYaml(`${noteType}
x_payload: &payload !!omap [{one: 1}, {two: 2}]
x_copy: *payload
frontmatter:
  value:
    type: any
    default_value: *payload`);
    const original = document.x_payload;
    expect(original).toBeInstanceOf(Map);
    expect(validators["note-type"]!(document)).toBe(true);
    expect(document.x_payload).toBe(original);
    expect(document.x_copy).toBe(original);
    expect(document.frontmatter.value.default_value).toBe(original);
    expect([...original]).toEqual([["one", 1], ["two", 2]]);
  });

  test("rejects an aliased structural value while preserving the caller's graph", () => {
    const document = parseYaml(`${collection}
x_payload: &payload !!set {one: null, two: null}
x_copy: *payload
validation_defaults: *payload`);
    const original = document.x_payload;
    expect(original).toBeInstanceOf(Set);
    expect(validators.typedmark!(document)).toBe(false);
    expect(document.x_payload).toBe(original);
    expect(document.x_copy).toBe(original);
    expect(document.validation_defaults).toBe(original);
    expect([...original]).toEqual(["one", "two"]);
  });
});

describe("tagged YAML in specification examples", () => {
  test.each(["yaml", "markdown"])("rejects structural tags in %s artifacts", (language) => {
    const yaml = `${collection}\nvocabularies: !!omap []`;
    const body = language === "markdown" ? `---\n${yaml}\n---\nHuman guidance.` : yaml;
    const source = `<!-- typedmark-example: artifact=typedmark -->\n\`\`\`${language}\n${body}\n\`\`\`\n`;
    const failures: string[] = [];
    expect(validateExamples(source, "tagged.md", validators, failures)).toBe(1);
    expect(failures.join("\n")).toContain("tagged.md:2 (typedmark): expected to pass shape validation");
    expect(failures.join("\n")).toContain("/vocabularies");
  });
});

describe("tagged YAML in golden vectors", () => {
  test.each([
    ["collection mapping", ["typedmark.md"], `${collection}\nvalidation_defaults: !!set {}`, false],
    ["note-type mapping", [".typedmark", "schemas", "meeting.md"], `${noteType}\nfrontmatter: !!omap []`, false],
    ["opaque metadata", ["typedmark.md"], `${collection}\nx_editor: &metadata !!omap [{one: 1}]\nx_copy: *metadata`, true],
  ] as const)("checks %s without rewriting source bytes", (_label, path, yaml, valid) => {
    const root = mkdtempSync(join(tmpdir(), "typedmark-tagged-shapes-"));
    try {
      const vector = join(root, "tagged");
      cpSync(join(import.meta.dir, "fixtures", "golden", "core-valid"), vector, { recursive: true });
      const file = join(vector, "collection", ...path);
      const source = Buffer.from(`\uFEFF---\r\n${yaml.replaceAll("\n", "\r\n")}\r\n---\r\n\r\nKeep this body — café.\r\n`, "utf8");
      writeFileSync(file, source);
      const failures: string[] = [];
      expect(validateGoldenVectors(validators, failures, root)).toBe(1);
      expect(readFileSync(file)).toEqual(source);
      if (valid) expect(failures).toEqual([]);
      else expect(failures.join("\n")).toContain("expected to pass shape validation");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

test("validator metadata remains live on the projected-input callable", () => {
  const validate = validators.typedmark!;
  expect(validate.schema).toEqual(JSON.parse(readFileSync(join(import.meta.dir, "json-schema", "typedmark.schema.json"), "utf8")));
  expect(validate.schemaEnv.schema).toBe(validate.schema);
  expect(validate(parseYaml(`${collection}\nvocabularies: !!set {}`))).toBe(false);
  expect(validate.schemaEnv.validate?.errors).toBe(validate.errors);
  expect(validate.schemaEnv.validate?.evaluated).toBe(validate.evaluated);
  expect(validate(parseYaml(collection))).toBe(true);
  expect(validate.errors).toBeNull();
});

test("deep opaque graphs and cycles do not impose a projection call-stack limit", () => {
  const opaque: Record<string, unknown> = Object.create(null);
  let leaf = opaque;
  for (let index = 0; index < 20_000; index++) {
    const child: Record<string, unknown> = {};
    leaf.next = child;
    leaf = child;
  }
  const native = new Set(["retained"]);
  leaf.native = native;
  leaf.root = opaque;
  const document = { ...parseYaml(collection), x_vendor: opaque };
  expect(validators.typedmark!(document)).toBe(true);
  expect(document.x_vendor).toBe(opaque);
  expect(Object.getPrototypeOf(opaque)).toBeNull();
  expect(leaf.native).toBe(native);
  expect(leaf.root).toBe(opaque);
});

test("own prototype keys remain visible and cannot mutate prototypes during projection", () => {
  const fields = JSON.parse('{"__proto__":{"type":"text"}}');
  const document = { ...parseYaml(noteType), frontmatter: fields };
  expect(validators["note-type"]!(document)).toBe(false);
  expect(Object.hasOwn(fields, "__proto__")).toBe(true);
  expect(Object.getPrototypeOf(fields)).toBe(Object.prototype);
  expect(({} as Record<string, unknown>).type).toBeUndefined();
});
