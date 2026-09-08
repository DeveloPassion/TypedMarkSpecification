import { expect, test } from "bun:test";
import { buildValidators } from "./validate-fixtures";

const validate = buildValidators()["note-type"]!;
const schema = {
  specification_version: "0.1.0",
  description: "A local concrete type.",
  storage: { folder_pattern: "", note_name_pattern: "{title}" },
};
const completeSchema = {
  ...schema, note_type: "note", label: "Note", icon: "file", frontmatter: {},
};

test("local schemas can omit deterministic metadata and an empty field mapping", () => {
  expect(validate(schema)).toBe(true);
});

test("a local concrete type still needs a storage contract", () => {
  const { storage, ...withoutStorage } = completeSchema;
  expect(validate(withoutStorage)).toBe(false);
});

test("abstract and inheriting types can obtain effective storage through Reuse", () => {
  expect(validate({ specification_version: "0.1.0", description: "Base.", abstract: true })).toBe(true);
  expect(validate({ specification_version: "0.1.0", description: "Child.", extends: "base" })).toBe(true);
});

test("kind is no longer a structural key", () => {
  expect(validate({ ...completeSchema, kind: "entity" })).toBe(false);
});

test("count ranges preserve general cardinality and permit the neutral empty range", () => {
  expect(validate({ ...completeSchema, count: {} })).toBe(true);
  expect(validate({ ...completeSchema, count: { min: 2, max: 8 } })).toBe(true);
});

test("Core note_type is not redundantly declared as a field", () => {
  expect(validate({
    ...completeSchema, frontmatter: { note_type: { type: "text", const_value: "note" } },
  })).toBe(false);
});

test("fixed Core field types cannot be widened", () => {
  for (const [field, definition] of Object.entries({
    tags: { type: "text" },
    title: { type: "object", fields: {} },
    created_at: { type: "date" },
    updated_at: { type: "datetime", generated: "now" },
  })) {
    expect(validate({ ...completeSchema, frontmatter: { [field]: definition } })).toBe(false);
  }
});
