import { expect, test } from "bun:test";
import { buildValidators } from "./validate-fixtures";

const validators = buildValidators();
const base = {
  specification_version: "0.1.0", description: "Core field cases.",
  storage: { folder_pattern: "", note_name_pattern: "{title}" },
};
const field = (definition: unknown) => validators["note-type"]!({
  ...base, frontmatter: { value: definition },
});

test.each([
  { type: "text", optional: true },
  { type: "text", generated: true },
  { type: "text", value_from_schema: "note_type" },
  { type: "text", not_empty: true },
])("rejects removed field syntax", definition => expect(field(definition)).toBe(false));

test("preserves nullable values, text minimums, and object non-emptiness", () => {
  expect(field({ type: "text", nullable: true })).toBe(true);
  expect(field({ type: "text", min: 1 })).toBe(true);
  expect(field({ type: "object", fields: {}, not_empty: true })).toBe(true);
});

test("archive blocks select explicit alternative paths without a policy enum", () => {
  expect(validators["note-type"]!({
    ...base, storage: { ...base.storage, archive: { folder_pattern: "Archive", note_name_pattern: "{title}" } },
  })).toBe(true);
  expect(validators["note-type"]!({
    ...base, storage: { ...base.storage, archive: { policy: "in_place_historical" } },
  })).toBe(false);
});

test("all supplied affixes apply without a required switch", () => {
  expect(validators["note-type"]!({
    ...base, storage: { ...base.storage, note_name_prefix: { pattern: "Note - " } },
  })).toBe(true);
  expect(validators["note-type"]!({
    ...base, storage: { ...base.storage, note_name_prefix: { pattern: "Note - ", required: false } },
  })).toBe(false);
});

test("guidance keys are individually optional and headings are unique", () => {
  expect(validators["note-type"]!({ ...base, guidance: {} })).toBe(true);
  expect(validators["note-type"]!({ ...base, guidance: { when_to_use: "For notes." } })).toBe(true);
  expect(validators["note-type"]!({ ...base, headings: { required_h2: ["A", "A"] } })).toBe(false);
});

test("core specification versions reject leading zeros", () => {
  expect(validators["note-type"]!({ ...base, specification_version: "00.1.0" })).toBe(false);
});
