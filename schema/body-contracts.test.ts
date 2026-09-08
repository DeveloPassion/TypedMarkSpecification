import { expect, test } from "bun:test";
import { buildValidators } from "./validate-fixtures";

const validators = buildValidators();
const expansion = {
  id: "title", mode: "auto", state: "materialized",
  source: { kind: "self_field", field: "title" }, render: { item: "${value}" },
};

test("body descriptors inherit versions instead of storing them", () => {
  expect(validators["template-region"]!({ id: "intro" })).toBe(true);
  expect(validators.expansion!(expansion)).toBe(true);
});

test("legacy descriptor version fields are rejected", () => {
  expect(validators["template-region"]!({ id: "intro", specification_version: "0.1.0" })).toBe(false);
  expect(validators.expansion!({ ...expansion, specification_version: "0.1.0" })).toBe(false);
});

test("retained once-and-eject descriptors remain pending", () => {
  expect(validators.expansion!({ ...expansion, mode: "once_and_eject" })).toBe(false);
  expect(validators.expansion!({ ...expansion, mode: "once_and_eject", state: "pending" })).toBe(true);
});
