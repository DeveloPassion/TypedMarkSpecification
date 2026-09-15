import { expect, test } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildValidators, validateExamples, validateGoldenVectors } from "./validate-fixtures";

const validators = buildValidators();
const versions = [undefined, "1.1", "1.2"] as const;
const header = "specification_version: 0.1.0\nname: core-baseline\ndescription: Core baseline.\n";
const directive = (version: string | undefined) => version ? `%YAML ${version}\n--- \n` : "";

function check(source: string, language: string, version: string | undefined) {
  const yaml = directive(version) + header + source;
  const body = language === "markdown" ? `---\n${yaml}\n---\nBody.\n` : yaml;
  let data: Record<string, unknown> | undefined;
  // Observe the parsed artifact at the public shape-validation boundary while
  // retaining the real validator and its live metadata.
  const capture = new Proxy(validators.typedmark!, {
    apply(target, receiver, args) { data = args[0]; return Reflect.apply(target, receiver, args); },
  });
  const failures: string[] = [];
  const count = validateExamples(`<!-- typedmark-example: artifact=typedmark -->\n\`\`\`${language}\n${body}\n\`\`\`\n`, "core.md", { ...validators, typedmark: capture }, failures);
  return { data, failures, count };
}

for (const language of ["yaml", "markdown"]) {
  test.each(versions)(`${language} artifacts use Core scalar resolution with directive %s`, version => {
    const result = check("x_values: [yes, no, on, off, y, n, 012, 0o12, 0b10, 'quoted', 12:34, 1_000, 2026-09-15, true, false, null]\n", language, version);
    expect(result.failures).toEqual([]);
    expect(result.count).toBe(1);
    expect(result.data?.x_values).toEqual(["yes", "no", "on", "off", "y", "n", 12, 10, "0b10", "quoted", "12:34", "1_000", "2026-09-15", true, false, null]);
  });

  test.each(versions)(`${language} artifacts retain explicit tags and aliases with directive %s`, version => {
    const result = check("x_set: &selection !!set {one: null, two: null}\nx_alias: *selection\n"
      + "x_map: !!omap [{one: 1}, {two: 2}]\nx_date: !!timestamp 2026-09-15T00:00:00Z\nx_bytes: !!binary SGVsbG8=\n", language, version);
    expect(result.failures).toEqual([]);
    expect(result.data?.x_set).toEqual(new Set(["one", "two"]));
    expect(result.data?.x_alias).toBe(result.data?.x_set);
    expect(result.data?.x_map).toEqual(new Map([["one", 1], ["two", 2]]));
    expect(result.data?.x_date).toEqual(new Date("2026-09-15T00:00:00Z"));
    expect(result.data?.x_bytes).toEqual(Buffer.from("Hello"));
  });

  test.each(versions)(`${language} artifacts do not activate implicit merge keys with directive %s`, version => {
    const result = check("x_base: &base {keep: yes}\nx_literal: {<<: *base}\nx_explicit: {!!merge <<: *base}\n", language, version);
    expect(result.failures).toEqual([]);
    expect(result.data?.x_literal).toEqual({ "<<": { keep: "yes" } });
    expect((result.data?.x_literal as Record<string, unknown>)["<<"]).toBe(result.data?.x_base);
    expect(result.data?.x_explicit).toEqual({ keep: "yes" });
  });

  test.each(versions)(`${language} artifacts still reject duplicate keys with directive %s`, version => {
    expect(check("x_values: {same: 1, same: 2}\n", language, version).failures.join("\n")).toContain("unique");
    // Core resolves both keys as decimal twelve, unlike YAML 1.1 octal.
    expect(check("x_values: {12: one, 012: two}\n", language, version).failures.join("\n")).toContain("unique");
  });
}

test.each(versions)("classified YAML fragments retain distinct Core string keys with directive %s", version => {
  const failures: string[] = [];
  expect(validateExamples(`<!-- typedmark-example: fragment: Core scalar keys. -->\n\`\`\`yaml\n${directive(version)}yes: one\non: two\n\`\`\`\n`, "fragment.md", validators, failures)).toBe(0);
  expect(failures).toEqual([]);
});

test.each(versions)("golden configuration keeps boolean-like identity text with directive %s", version => {
  const root = mkdtempSync(join(tmpdir(), "typedmark-yaml-core-"));
  try {
    const vector = join(root, "core-valid");
    cpSync(join(import.meta.dir, "fixtures/golden/core-valid"), vector, { recursive: true });
    const path = join(vector, "collection/typedmark.md");
    const original = readFileSync(path, "utf8").replace(/\r\n?/g, "\n");
    const source = "---\n" + directive(version) + original.slice(4).replace(/^name:.*$/m, "name: on");
    const bytes = Buffer.from("\uFEFF" + source.replaceAll("\n", "\r\n"));
    writeFileSync(path, bytes);
    const failures: string[] = [];
    expect(validateGoldenVectors(validators, failures, root)).toBe(1);
    expect(failures).toEqual([]);
    expect(readFileSync(path).equals(bytes)).toBe(true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
