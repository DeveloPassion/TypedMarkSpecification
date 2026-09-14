import { expect, test } from "bun:test";
import { parse as parseYaml } from "yaml";
import { buildValidators, validateExpectedReportCoverage } from "./validate-fixtures";

const validate = buildValidators()["validation-report"]!;
const requirements = { "example:review": "1.2.0" };
const result = {
  code: "extension_violation", severity: "error", path: "notes/review.md",
  rule_id: "example:review/REV-1", extension: "example:review", message: "Review needed.",
};
const report = {
  specification_version: "0.1.0", mode: "instantiated_collection", evaluation: "complete",
  required_extensions: requirements, evaluated_extensions: requirements,
  valid: false, results: [result],
};

test("accepts qualified third-party rules without a built-in prefix allocation", () => {
  expect(validate(report)).toBe(true);
});

test("a syntactically valid but unknown built-in identifier is a semantic report error", () => {
  const unknown = { ...report, results: [{ ...result, rule_id: "ZZZ-1" }] };
  expect(validate(unknown)).toBe(true);
  const failures: string[] = [];
  validateExpectedReportCoverage(unknown, { extensions: requirements }, "report", failures);
  expect(failures.join("\n")).toContain("unknown or retired built-in rule ZZZ-1");
});

test.each([
  "invalid_collection_configuration", "invalid_note_type_schema", "invalid_template",
  "invalid_system", "invalid_history", "invalid_automation", "invalid_note_frontmatter",
])("accepts the %s category", (code) => {
  expect(validate({
    ...report, required_extensions: {}, evaluated_extensions: {},
    results: [{ code, severity: "error", path: "typedmark.md", rule_id: "CM-1", message: "Invalid." }],
  })).toBe(true);
});

test.each([
  { ...result, code: "invalid_field_value" },
  { ...result, extension: undefined },
  { ...result, rule_id: "example:review/REV-0" },
  { ...result, rule_id: "example:review/REV-1\n" },
])("rejects malformed qualified diagnostics", (invalid) => {
  expect(validate({ ...report, results: [invalid] })).toBe(false);
});

test("coverage rejects a qualified rule whose namespace differs from its context", () => {
  const failures: string[] = [];
  validateExpectedReportCoverage({
    ...report, results: [{ ...result, extension: "example:other" }],
  }, { extensions: requirements }, "report", failures);
  expect(failures.join("\n")).toContain("qualified rule");
});

test("coverage rejects violations from extensions not actually evaluated", () => {
  const failures: string[] = [];
  validateExpectedReportCoverage({
    ...report, evaluation: "incomplete", evaluated_extensions: {},
  }, { extensions: requirements }, "report", failures);
  expect(failures.join("\n")).toContain("extension_violation");
});

test("coverage rejects an unsupported extension simultaneously claimed as evaluated", () => {
  const failures: string[] = [];
  validateExpectedReportCoverage({
    ...report, evaluation: "incomplete",
    results: [{ ...result, code: "unsupported_extension", rule_id: "EXT-19" }],
  }, { extensions: requirements }, "report", failures);
  expect(failures.join("\n")).toContain("unsupported_extension");
});

test.each(["EXT-2", "EXT-4", "EXT-6"])("malformed declaration diagnostic %s cannot appear in a complete report", (rule_id) => {
  expect(validate({ ...report, required_extensions: {}, evaluated_extensions: {},
    results: [{ code: "invalid_extension_declaration", severity: "error", path: "typedmark.md", rule_id, message: "Malformed declaration." }] })).toBe(false);
});

test("coverage retains exactly well-formed entries from a malformed declaration", () => {
  const kept = { ...requirements, "example:future": "9.0.0-rc.1+build" };
  const declaration = { ...kept, bad: "1.0.0", "typedmark:queries": 17, "typedmark:reuse": "0.1.0\n" };
  const failures: string[] = [];
  validateExpectedReportCoverage({ ...report, evaluation: "incomplete", required_extensions: kept, evaluated_extensions: {}, results: [] },
    { extensions: declaration }, "report", failures);
  expect(failures).toEqual([]);
});

test("coverage rejects dropping well-formed requirements with malformed siblings", () => {
  const failures: string[] = [];
  validateExpectedReportCoverage({ ...report, evaluation: "incomplete", required_extensions: {}, evaluated_extensions: {}, results: [] },
    { extensions: { ...requirements, bad: "1.0.0" } }, "report", failures);
  expect(failures.join("\n")).toContain("required_extensions");
});

test.each([null, [], "all", 17, { "typedmark:reuse": 17 }].map((extensions) => ({ extensions })))("malformed declaration %j stays incomplete with suppressed diagnostics", ({ extensions }) => {
  const failures: string[] = [];
  validateExpectedReportCoverage({ ...report, valid: true, required_extensions: {}, evaluated_extensions: {}, results: [] },
    { extensions }, "report", failures);
  expect(failures.join("\n")).toContain("incomplete");
});

test.each(["!!set {typedmark:reuse: null}", "!!omap [{example:future: 9.0.0}]"])("coverage rejects complete reports for tagged YAML declaration %s", (declaration) => {
  const failures: string[] = [];
  validateExpectedReportCoverage({ ...report, valid: true, required_extensions: {}, evaluated_extensions: {}, results: [] },
    parseYaml(`extensions: ${declaration}`), "report", failures);
  expect(failures.join("\n")).toContain("incomplete");
});
