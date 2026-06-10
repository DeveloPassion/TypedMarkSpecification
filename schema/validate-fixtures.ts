#!/usr/bin/env bun
/**
 * Validate the TypedMark fixture files against the JSON Schemas.
 *
 * Fixtures are governed artifacts: Markdown files whose YAML frontmatter is the
 * governed content. The frontmatter is extracted per the Frontmatter Block
 * Grammar and validated against the matching artifact schema; the body is
 * ignored.
 *
 * Expectations:
 * - every fixture under fixtures/valid/ passes its artifact schema
 * - every fixture under fixtures/invalid-shape/ fails its artifact schema
 * - every fixture under fixtures/invalid-semantic/ passes its artifact schema
 *   (they are invalid only under the semantic layer described in
 *   docs/schema-boundary.md)
 *
 * Usage: bun schema/validate-fixtures.ts (or: bun run validate-fixtures)
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020";
import { parse as parseYaml } from "yaml";

const SCHEMA_DIR = join(import.meta.dir, "json-schema");
const FIXTURE_DIR = join(import.meta.dir, "fixtures");

const ARTIFACT_SCHEMAS: Record<string, string> = {
  typedmark: "typedmark.schema.json",
  "note-type": "note-type.schema.json",
  "property-set": "property-set.schema.json",
  history: "history.schema.json",
};

function buildValidators(): Record<string, ValidateFunction> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const idsByFile: Record<string, string> = {};
  for (const file of readdirSync(SCHEMA_DIR)) {
    if (!file.endsWith(".schema.json")) continue;
    const schema = JSON.parse(readFileSync(join(SCHEMA_DIR, file), "utf8"));
    ajv.addSchema(schema);
    idsByFile[file] = schema.$id;
  }
  const validators: Record<string, ValidateFunction> = {};
  for (const [prefix, file] of Object.entries(ARTIFACT_SCHEMAS)) {
    const validate = ajv.getSchema(idsByFile[file]!);
    if (!validate) throw new Error(`schema ${file} did not compile`);
    validators[prefix] = validate;
  }
  return validators;
}

function validatorFor(
  validators: Record<string, ValidateFunction>,
  fixture: string,
): ValidateFunction {
  for (const [prefix, validate] of Object.entries(validators)) {
    if (fixture.startsWith(prefix)) return validate;
  }
  throw new Error(`cannot map fixture ${fixture} to an artifact schema`);
}

function extractFrontmatter(text: string): unknown {
  const lines = text.split("\n");
  if (lines[0]?.replace(/^﻿/, "") !== "---") {
    throw new Error("fixture has no frontmatter block");
  }
  const end = lines.findIndex(
    (line, index) => index > 0 && (line === "---" || line === "..."),
  );
  if (end === -1) throw new Error("fixture frontmatter block is not closed");
  return parseYaml(lines.slice(1, end).join("\n"));
}

function main(): number {
  const validators = buildValidators();
  const failures: string[] = [];
  let checked = 0;

  const buckets: Array<[string, boolean]> = [
    ["valid", true],
    ["invalid-shape", false],
    ["invalid-semantic", true],
  ];

  for (const [bucket, mustPass] of buckets) {
    const dir = join(FIXTURE_DIR, bucket);
    for (const fixture of readdirSync(dir).sort()) {
      if (!fixture.endsWith(".md") || fixture === "README.md") continue;
      checked += 1;
      const document = extractFrontmatter(
        readFileSync(join(dir, fixture), "utf8"),
      );
      const validate = validatorFor(validators, fixture);
      const passed = validate(document);
      if (passed !== mustPass) {
        const expectation = mustPass ? "pass" : "fail";
        failures.push(
          `${bucket}/${fixture}: expected to ${expectation} shape validation`,
        );
        for (const error of (validate.errors ?? []).slice(0, 3)) {
          failures.push(`  ${error.instancePath || "/"}: ${error.message}`);
        }
      } else {
        console.log(`ok ${bucket}/${fixture}`);
      }
    }
  }

  if (failures.length > 0) {
    console.log();
    console.log(failures.join("\n"));
    console.log(`\nexpectations violated across ${checked} fixtures`);
    return 1;
  }
  console.log(`\nall ${checked} fixtures behaved as expected`);
  return 0;
}

process.exit(main());
