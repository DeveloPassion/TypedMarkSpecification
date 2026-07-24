#!/usr/bin/env bun
/**
 * Validate the TypedMark fixture files against the JSON Schemas.
 *
 * Fixtures are governed artifacts: Markdown files whose YAML frontmatter is the
 * governed content (the frontmatter is extracted per the Frontmatter Block
 * Grammar and validated against the matching artifact schema; the body is
 * ignored), plus plain-JSON contracts such as content-expansion descriptors,
 * the marketplace catalog, and portable validation reports.
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
 * - every collection under fixtures/golden/ has a valid self-contained layout
 *   and a shape-valid, canonically ordered expected validation report
 *
 * Usage: bun schema/validate-fixtures.ts (or: bun run validate-fixtures)
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020";
import { parse as parseYaml } from "yaml";

const SCHEMA_DIR = join(import.meta.dir, "json-schema");
const FIXTURE_DIR = join(import.meta.dir, "fixtures");
const GOLDEN_DIR = join(FIXTURE_DIR, "golden");
const ROOT = join(import.meta.dir, "..");

const SPEC_PAGES = [
  "index.md", "manifesto.md", "getting-started.md", "foundations.md",
  "collection-model.md", "note-type-schemas.md", "field-definition-reference.md",
  "managed-notes-and-properties.md", "note-links.md",
  "relationships-headings-and-templates.md", "systems-composition-evolution.md",
  "migration-effects.md", "conformance-and-roadmap.md", "quick-reference.md",
];

const ARTIFACT_SCHEMAS: Record<string, string> = {
  "automation-event": "automation-event.schema.json",
  "automation-run-report": "automation-run-report.schema.json",
  automation: "automation.schema.json",
  typedmark: "typedmark.schema.json",
  "note-type": "note-type.schema.json",
  "property-set": "property-set.schema.json",
  history: "history.schema.json",
  expansion: "expansion.schema.json",
  marketplace: "marketplace.schema.json",
  "validation-report": "validation-report.schema.json",
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
  if ("event_id" in doc && "kind" in doc && "occurred_at" in doc) return "automation-event";
  if ("run_id" in doc && "mode" in doc && "status" in doc) return "automation-run-report";
  if ("automation" in doc && "trigger" in doc && "actions" in doc) return "automation";
  if ("note_type" in doc) return "note-type";
  if ("property_set" in doc) return "property-set";
  if ("history" in doc) return "history";
  if ("id" in doc && "source" in doc && "render" in doc && "state" in doc) return "expansion";
  if ("systems" in doc) return "marketplace";
  if ("mode" in doc && "valid" in doc && "results" in doc) return "validation-report";
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

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function collectFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(path));
    else files.push(path);
  }
  return files.sort();
}

function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left, (char) => char.codePointAt(0)!);
  const rightPoints = Array.from(right, (char) => char.codePointAt(0)!);
  for (let index = 0; index < Math.min(leftPoints.length, rightPoints.length); index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index]! - rightPoints[index]!;
  }
  return leftPoints.length - rightPoints.length;
}

function compareReportResults(left: unknown, right: unknown): number {
  const leftResult = objectValue(left) ?? {};
  const rightResult = objectValue(right) ?? {};
  const keys = [
    "path", "rule_id", "code", "note_type", "field", "relationship", "heading",
    "expansion",
  ];
  for (const key of keys) {
    const compared = compareCodePoints(
      typeof leftResult[key] === "string" ? leftResult[key] : "",
      typeof rightResult[key] === "string" ? rightResult[key] : "",
    );
    if (compared !== 0) return compared;
  }
  return 0;
}

function validateShape(
  validate: ValidateFunction,
  document: unknown,
  label: string,
  failures: string[],
): void {
  if (validate(document)) return;
  failures.push(`${label}: expected to pass shape validation`);
  for (const error of (validate.errors ?? []).slice(0, 3)) {
    failures.push(`  ${error.instancePath || "/"}: ${error.message}`);
  }
}

function validateGoldenVectors(
  validators: Record<string, ValidateFunction>,
  failures: string[],
): number {
  if (!existsSync(GOLDEN_DIR)) {
    failures.push("golden fixtures: expected schema/fixtures/golden to exist");
    return 0;
  }
  const vectors = readdirSync(GOLDEN_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (vectors.length === 0) {
    failures.push("golden fixtures: expected at least one collection vector");
  }

  for (const vector of vectors) {
    const failureCount = failures.length;
    const vectorRoot = join(GOLDEN_DIR, vector);
    const collectionRoot = join(vectorRoot, "collection");
    const reportPath = join(vectorRoot, "expected-validation-report.json");
    const typedmarkPath = join(collectionRoot, "typedmark.md");

    if (!existsSync(collectionRoot)) {
      failures.push(`golden/${vector}: missing collection/ directory`);
      continue;
    }
    if (!existsSync(reportPath)) {
      failures.push(`golden/${vector}: missing expected-validation-report.json`);
      continue;
    }
    if (!existsSync(typedmarkPath)) {
      failures.push(`golden/${vector}: missing collection/typedmark.md`);
      continue;
    }

    let report: unknown;
    let typedmark: unknown;
    try {
      report = JSON.parse(readFileSync(reportPath, "utf8"));
      typedmark = extractFrontmatter(readFileSync(typedmarkPath, "utf8"));
    } catch (error) {
      failures.push(`golden/${vector}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    validateShape(
      validators["validation-report"]!, report,
      `golden/${vector}/expected-validation-report.json`, failures,
    );
    validateShape(
      validators.typedmark!, typedmark,
      `golden/${vector}/collection/typedmark.md`, failures,
    );

    const reportObject = objectValue(report);
    const results = Array.isArray(reportObject?.results) ? reportObject.results : [];
    const sortedResults = [...results].sort(compareReportResults);
    if (results.some((result, index) => result !== sortedResults[index])) {
      failures.push(`golden/${vector}: expected report results to use canonical order`);
    }

    const typedmarkObject = objectValue(typedmark);
    const metadataDirectory = typeof typedmarkObject?.metadata_directory === "string"
      ? typedmarkObject.metadata_directory
      : ".typedmark";
    const metadataRoot = join(collectionRoot, metadataDirectory);
    const schemaRoot = join(metadataRoot, "schemas");
    const templateRoot = join(metadataRoot, "templates");

    if (!existsSync(schemaRoot)) {
      failures.push(`golden/${vector}: missing ${metadataDirectory}/schemas/`);
      continue;
    }
    if (!existsSync(templateRoot)) {
      failures.push(`golden/${vector}: missing ${metadataDirectory}/templates/`);
      continue;
    }

    const schemaPaths = collectFiles(schemaRoot).filter((path) => extname(path) === ".md");
    if (schemaPaths.length === 0) {
      failures.push(`golden/${vector}: expected at least one note-type schema`);
    }
    for (const schemaPath of schemaPaths) {
      try {
        const schema = extractFrontmatter(readFileSync(schemaPath, "utf8"));
        validateShape(validators["note-type"]!, schema, `golden/${vector}/${basename(schemaPath)}`, failures);
        const schemaObject = objectValue(schema);
        const noteType = schemaObject?.note_type;
        if (typeof noteType === "string" && basename(schemaPath, ".md") !== noteType) {
          failures.push(`golden/${vector}: schema basename does not match note_type ${noteType}`);
        }
        if (schemaObject?.abstract !== true && typeof noteType === "string") {
          const templateObject = objectValue(schemaObject.template);
          const templateFile = typeof templateObject?.file === "string"
            ? templateObject.file
            : `${noteType}.md`;
          if (!existsSync(join(templateRoot, ...templateFile.split("/")))) {
            failures.push(`golden/${vector}: missing template ${templateFile}`);
          }
        }
      } catch (error) {
        failures.push(`golden/${vector}/${basename(schemaPath)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const propertySetRoot = join(metadataRoot, "property-sets");
    if (existsSync(propertySetRoot)) {
      for (const propertySetPath of collectFiles(propertySetRoot).filter((path) => extname(path) === ".md")) {
        try {
          const propertySet = extractFrontmatter(readFileSync(propertySetPath, "utf8"));
          validateShape(validators["property-set"]!, propertySet, `golden/${vector}/${basename(propertySetPath)}`, failures);
        } catch (error) {
          failures.push(`golden/${vector}/${basename(propertySetPath)}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    const automationRoot = join(metadataRoot, "automations");
    if (existsSync(automationRoot)) {
      for (const automationPath of collectFiles(automationRoot).filter((path) => extname(path) === ".md")) {
        try {
          const automation = extractFrontmatter(readFileSync(automationPath, "utf8"));
          validateShape(validators.automation!, automation, `golden/${vector}/${basename(automationPath)}`, failures);
          const automationObject = objectValue(automation);
          const automationId = automationObject?.automation;
          if (typeof automationId === "string" && basename(automationPath, ".md") !== automationId) {
            failures.push(`golden/${vector}: automation basename does not match automation ${automationId}`);
          }
        } catch (error) {
          failures.push(`golden/${vector}/${basename(automationPath)}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    const historyPath = join(metadataRoot, "history.md");
    if (existsSync(historyPath)) {
      try {
        const history = extractFrontmatter(readFileSync(historyPath, "utf8"));
        validateShape(validators.history!, history, `golden/${vector}/history.md`, failures);
      } catch (error) {
        failures.push(`golden/${vector}/history.md: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    for (const markdownPath of collectFiles(collectionRoot).filter((path) => extname(path) === ".md")) {
      try {
        extractFrontmatter(readFileSync(markdownPath, "utf8"));
      } catch (error) {
        failures.push(`golden/${vector}/${basename(markdownPath)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (failures.length === failureCount) console.log(`ok golden/${vector}`);
  }
  return vectors.length;
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
  checked += validateGoldenVectors(validators, failures);

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
