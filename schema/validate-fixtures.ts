#!/usr/bin/env bun
/**
 * Validate the TypedMark fixture files against the JSON Schemas.
 *
 * Fixtures are governed artifacts: Markdown files whose YAML frontmatter is the
 * governed content (the frontmatter is extracted per the Frontmatter Block
 * Grammar and validated against the matching artifact schema; the body is
 * ignored), plus plain-JSON contracts such as content-expansion and
 * template-region descriptors, template-tracking receipts, the marketplace
 * catalog, and portable validation reports.
 *
 * It also validates explicitly classified examples from the specification pages:
 * artifact shapes, fragment syntax, and classification of Markdown body examples.
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
import { Lexer, type Token } from "marked";
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
  dataset: "dataset.schema.json",
  query: "query.schema.json",
  view: "view.schema.json",
  expansion: "expansion.schema.json",
  "template-region": "template-region.schema.json",
  "template-tracking": "template-tracking.schema.json",
  marketplace: "marketplace.schema.json",
  "validation-report": "validation-report.schema.json",
};

export function buildValidators(): Record<string, ValidateFunction> {
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

export function validateExamples(
  text: string,
  pageName: string,
  validators: Record<string, ValidateFunction>,
  failures: string[],
): number {
  let checked = 0;
  const newlineCount = (value: string) => value.split("\n").length - 1;
  const eligible = new Set(["yaml", "yml", "json", "markdown", "md"]);

  function visit(tokens: Token[], startLine: number): void {
    let line = startLine;
    let pending: { kind: string; schema?: string; line: number } | undefined;
    for (const token of tokens) {
      const tokenLine = line;
      line += newlineCount(token.raw);
      if (token.type === "space") continue;
      const label = `${pageName}:${tokenLine}`;
      const lang = token.type === "code" ? token.lang?.trim().split(/\s+/)[0]?.toLowerCase() : "";
      const isExample = token.type === "code" && eligible.has(lang ?? "");
      const annotation = pending;
      pending = undefined;
      if (annotation && !isExample) {
        failures.push(`${pageName}:${annotation.line}: annotation must precede an eligible fenced example`);
      }

      if (token.type === "html" && token.raw.includes("typedmark-example")) {
        const match = /^<!-- typedmark-example: (?:artifact=([a-z][a-z0-9-]*)|(fragment|body): (\S[^\r\n]*)) -->$/
          .exec(token.raw.trim());
        if (!match) {
          failures.push(`${label}: invalid typedmark-example annotation`);
        } else if (match[1] && !Object.hasOwn(validators, match[1])) {
          failures.push(`${label}: unknown artifact schema ${match[1]}`);
        } else {
          pending = { kind: match[1] ? "artifact" : match[2]!, schema: match[1], line: tokenLine };
        }
      } else if (isExample && token.type === "code") {
        if (!annotation) {
          failures.push(`${label}: missing typedmark-example annotation`);
          continue;
        }
        const fence = /^ {0,3}(`{3,}|~{3,})/.exec(token.raw)?.[1];
        const closing = fence && new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*$`, "m");
        if (!closing || !closing.test(token.raw.slice(token.raw.indexOf("\n") + 1))) {
          failures.push(`${label}: unclosed example fence`);
          continue;
        }
        const markdown = lang === "markdown" || lang === "md";
        if (annotation.kind === "body") {
          if (!markdown) failures.push(`${label}: body classification requires markdown or md`);
          continue;
        }
        if (annotation.kind === "fragment" && markdown) {
          failures.push(`${label}: fragment classification requires yaml, yml, or json`);
          continue;
        }
        try {
          const document = lang === "json" ? JSON.parse(token.text)
            : markdown ? extractFrontmatter(token.text) : parseYaml(token.text);
          if (annotation.kind === "artifact") {
            checked += 1;
            validateShape(validators[annotation.schema!]!, document, `${label} (${annotation.schema})`, failures);
          }
        } catch (error) {
          failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else if (token.type === "blockquote") {
        visit(token.tokens, tokenLine);
      } else if (token.type === "list") {
        let offset = 0;
        for (const item of token.items) {
          const itemOffset = token.raw.indexOf(item.raw, offset);
          visit(item.tokens, tokenLine + newlineCount(token.raw.slice(0, itemOffset)));
          offset = itemOffset + item.raw.length;
        }
      }
    }
    if (pending) {
      failures.push(`${pageName}:${pending.line}: annotation must precede an eligible fenced example`);
    }
  }

  visit(Lexer.lex(text.replace(/\r\n?/g, "\n")), 1);
  return checked;
}

function validateSpecExamples(
  validators: Record<string, ValidateFunction>,
  failures: string[],
): number {
  return SPEC_PAGES.reduce((checked, pageName) => {
    const failureCount = failures.length;
    const count = validateExamples(readFileSync(join(ROOT, pageName), "utf8"), pageName, validators, failures);
    if (failureCount === failures.length) console.log(`ok spec-examples ${pageName} (${count} artifact shapes)`);
    return checked + count;
  }, 0);
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
    "expansion", "dataset", "view", "template_region", "drift_kind",
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

export function validateGoldenVectors(
  validators: Record<string, ValidateFunction>,
  failures: string[],
  goldenDirectory = GOLDEN_DIR,
): number {
  if (!existsSync(goldenDirectory)) {
    failures.push("golden fixtures: expected schema/fixtures/golden to exist");
    return 0;
  }
  const vectors = readdirSync(goldenDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (vectors.length === 0) {
    failures.push("golden fixtures: expected at least one collection vector");
  }

  for (const vector of vectors) {
    const failureCount = failures.length;
    const vectorRoot = join(goldenDirectory, vector);
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

    const viewRoot = join(metadataRoot, "views");
    if (existsSync(viewRoot)) {
      for (const viewPath of collectFiles(viewRoot).filter((path) => extname(path) === ".md")) {
        try {
          const view = extractFrontmatter(readFileSync(viewPath, "utf8"));
          validateShape(validators.view!, view, `golden/${vector}/${basename(viewPath)}`, failures);
          const viewObject = objectValue(view);
          const viewId = viewObject?.view;
          if (typeof viewId === "string" && basename(viewPath, ".md") !== viewId) {
            failures.push(`golden/${vector}: view basename does not match view ${viewId}`);
          }
        } catch (error) {
          failures.push(`golden/${vector}/${basename(viewPath)}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    const datasetRoot = join(metadataRoot, "datasets");
    if (existsSync(datasetRoot)) {
      for (const datasetPath of collectFiles(datasetRoot).filter((path) => extname(path) === ".md")) {
        try {
          const dataset = extractFrontmatter(readFileSync(datasetPath, "utf8"));
          validateShape(validators.dataset!, dataset, `golden/${vector}/${basename(datasetPath)}`, failures);
          const datasetId = objectValue(dataset)?.dataset;
          if (typeof datasetId === "string" && basename(datasetPath, ".md") !== datasetId) {
            failures.push(`golden/${vector}: dataset basename does not match dataset ${datasetId}`);
          }
        } catch (error) {
          failures.push(`golden/${vector}/${basename(datasetPath)}: ${error instanceof Error ? error.message : String(error)}`);
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

if (import.meta.main) process.exit(main());
