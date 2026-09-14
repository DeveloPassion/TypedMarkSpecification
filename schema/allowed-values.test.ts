import { expect, test } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import { parse } from "yaml";
import definitions from "./json-schema/defs.schema.json";
import { buildValidators } from "./validate-fixtures";

const validators = buildValidators();
const noteType = { specification_version: "0.1.0", description: "Scalar allowed values.", abstract: true };
const validate = validators["note-type"]!;
const document = (values: unknown[]) => ({ ...noteType, frontmatter: { value: { type: "text", allowed_values: values } } });

test.each([
  [{ a: 1 }, { a: 2 }],
  [[1], [2]],
  [{ valueOf: 1 }, { valueOf: 2 }],
  [{ toString: 1 }, { toString: 2 }],
  [Object.create(null), Object.create(null)],
])("rejects non-scalar entries without invoking authored object methods: %j", (first, second) => {
  expect(validate(document([first, second]))).toBe(false);
  expect(validate.errors).toContainEqual(expect.objectContaining({
    instancePath: "/frontmatter/value/allowed_values/0", keyword: "type",
  }));
});

test("rejects distinct cyclic mappings while preserving aliases in opaque positions", () => {
  const first: Record<string, unknown> = {}, second: Record<string, unknown> = {};
  first.self = first;
  second.self = second;
  const value = {
    ...document([first, second]), x_vendor: first,
    frontmatter: {
      value: { type: "text", allowed_values: [first, second] },
      defaulted: { type: "any", default_value: first },
      fixed: { type: "any", const_value: second },
    },
  };
  expect(validate(value)).toBe(false);
  expect(validate.errors?.every(error => error.instancePath.includes("/allowed_values/"))).toBe(true);
  expect(value.x_vendor).toBe(first);
  expect(value.frontmatter.defaulted.default_value).toBe(first);
  expect(value.frontmatter.fixed.const_value).toBe(second);
  expect(first.self).toBe(first);
  expect(second.self).toBe(second);
});

test.each(["!!set {one: null}", "!!omap [{one: 1}]", "!!timestamp 2026-09-15T00:00:00Z", "!!binary SGVsbG8="])(
  "native %s remains opaque metadata, not a scalar allowed value", tag => {
    const native = parse(`value: ${tag}`).value;
    expect(validate({ ...document([native]), x_vendor: native })).toBe(false);
    expect(validate({ ...noteType, x_vendor: native, frontmatter: { value: { type: "any", default_value: native } } })).toBe(true);
  },
);

test.each([
  ["plain", { value: { type: "text", allowed_values: [{}] } }],
  ["nested", { parent: { type: "object", fields: { value: { type: "text", allowed_values: [[]] } } } }],
  ["item", { values: { type: "list", items: { type: "text", allowed_values: [{}] } } }],
])("enforces scalar entries in %s field definitions", (_name, frontmatter) => {
  expect(validate({ ...noteType, frontmatter })).toBe(false);
  expect(validators["property-set"]!({ specification_version: "0.1.0", property_set: "shared", description: "Shared.", frontmatter })).toBe(false);
});

test.each([
  ["strings", ["constructor", "__proto_", "__proto__", "toString", "valueOf"]],
  ["numbers", [0, 1, 1.5]],
  ["booleans", [false, true]],
  ["null", [null]],
  ["distinct scalar types", [1, "1", true, "true", null, "null"]],
  ["NFC equality remains semantic", ["é", "e\u0301"]],
])("accepts scalar shape without deciding declared-type compatibility: %s", (_name, values) => {
  expect(validate(document(values as unknown[]))).toBe(true);
});

test.each([["x", "x"], ["__proto_", "__proto_"], [1, 1.0], [false, false], [null, null]])("retains scalar duplicate rejection: %j", (first, second) => {
  expect(validate(document([first, second]))).toBe(false);
  expect(validate.errors?.some(error => error.keyword === "uniqueItems")).toBe(true);
});

test("the published schema rejects object entries without a projection adapter", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(definitions);
  const field = ajv.getSchema(`${definitions.$id}#/$defs/field_definition`)!;
  expect(field({ type: "text", allowed_values: [{ valueOf: 1 }, { valueOf: 2 }] })).toBe(false);
  expect(field.errors?.every(error => error.keyword === "type")).toBe(true);
});
