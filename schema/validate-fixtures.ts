#!/usr/bin/env bun
/**
 * Validate the TypedMark fixture files against the JSON Schemas.
 *
 * Fixtures are governed artifacts: Markdown files whose YAML frontmatter is the
 * governed content (the frontmatter is extracted per the Frontmatter Block
 * Grammar and validated against the matching artifact schema; the body is
 * ignored), plus the marketplace catalog, which is plain JSON.
 *
 * It also extracts artifact-shaped example blocks from the specification pages
 * and validates them, so the prose examples can never drift from the schemas.
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
const ROOT = join(import.meta.dir, "..");

const SPEC_PAGES = [
  "index.md", "manifesto.md", "getting-started.md", "foundations.md",
  "collection-model.md", "note-type-schemas.md", "field-definition-reference.md",
  "managed-notes-and-properties.md", "note-links.md",
  "relationships-headings-and-templates.md", "systems-composition-evolution.md",
  "migration-effects.md", "conformance-and-roadmap.md", "quick-reference.md",
];

const ARTIFACT_SCHEMAS: Record<string, string> = {
  typedmark: "typedmark.schema.json",
  "note-type": "note-type.schema.json",
  "property-set": "property-set.schema.json",
  history: "history.schema.json",
  marketplace: "marketplace.schema.json",
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
  const lines = text.split(/\r?\n/);
  if (lines[0]?.replace(/^﻿/, "") !== "---") {
    throw new Error("fixture has no frontmatter block");
  }
  const end = lines.findIndex(
    (line, index) => index > 0 && (line === "---" || line === "..."),
  );
  if (end === -1) throw new Error("fixture frontmatter block is not closed");
  return parseYaml(lines.slice(1, end).join("\n"));
}

function classify(document: unknown): string | null {
  if (typeof document !== "object" || document === null || Array.isArray(document)) return null;
  const doc = document as Record<string, unknown>;
  if (!("specification_version" in doc)) return null;
  if ("note_type" in doc) return "note-type";
  if ("property_set" in doc) return "property-set";
  if ("history" in doc) return "history";
  if ("systems" in doc) return "marketplace";
  if ("metadata_directory" in doc || "name" in doc) return "typedmark";
  return null;
}

/** Extract fenced yaml/json/markdown example blocks from a spec page. */
function extractExamples(text: string): Array<{ lang: string; body: string }> {
  const blocks: Array<{ lang: string; body: string }> = [];
  const fence = /^```(yaml|json|markdown)\r?\n([\s\S]*?)^```\r?$/gm;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(text)) !== null) {
    blocks.push({ lang: match[1]!, body: match[2]! });
  }
  return blocks;
}

function validateSpecExamples(
  validators: Record<string, ValidateFunction>,
  failures: string[],
): number {
  let checked = 0;
  for (const pageName of SPEC_PAGES) {
    const text = readFileSync(join(ROOT, pageName), "utf8");
    extractExamples(text).forEach((block, index) => {
      let document: unknown;
      try {
        if (block.lang === "json") document = JSON.parse(block.body);
        else if (block.lang === "markdown") document = extractFrontmatter(block.body);
        else document = parseYaml(block.body);
      } catch {
        return; // fragments and illustrative non-artifact blocks are skipped
      }
      const kind = classify(document);
      if (!kind) return;
      checked += 1;
      const validate = validators[kind]!;
      if (!validate(document)) {
        failures.push(`spec example ${pageName} #${index + 1} (${kind}): expected to pass shape validation`);
        for (const error of (validate.errors ?? []).slice(0, 3)) {
          failures.push(`  ${error.instancePath || "/"}: ${error.message}`);
        }
      } else {
        console.log(`ok spec-example ${pageName} #${index + 1} (${kind})`);
      }
    });
  }
  return checked;
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
      const isJson = fixture.endsWith(".json");
      if ((!fixture.endsWith(".md") && !isJson) || fixture === "README.md") continue;
      checked += 1;
      const text = readFileSync(join(dir, fixture), "utf8");
      const document = isJson ? JSON.parse(text) : extractFrontmatter(text);
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

  checked += validateSpecExamples(validators, failures);

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
