#!/usr/bin/env bun
/**
 * Lint rule identifiers, normative-keyword placement, and page preambles.
 *
 * Every top-level item of a normative rule list must start with a rule ID
 * chip (e.g. `CM-12`) at its registered owner, and every ID must be unique
 * across the whole specification. The registry preserves allocated IDs,
 * explicit relocations, and retirements; moving a rule never renumbers it.
 * Normative keywords belong only on identified rule lines. Published pages
 * carry compact preambles; non-authoritative pages omit the otherwise-required
 * Authoritative for list.
 *
 * Usage: bun scripts/lint-rule-ids.ts (or: bun run lint-rule-ids)
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import registry from "./rule-registry.json";

const ROOT = join(import.meta.dir, "..");
const CORE_PAGES = [
  "foundations.md", "collection-model.md", "note-type-schemas.md",
  "field-definition-reference.md", "managed-notes-and-properties.md", "note-links.md",
  "relationships-headings-and-templates.md", "extensions.md", "conformance-and-roadmap.md",
];
const REUSE_PAGES = ["schema-reuse.md", "property-sets.md"];

export interface RuleRegistry {
  prefixes: Record<string, { page: string; last: number }>;
  relocations: Record<string, string>;
  retired: Record<string, string>;
}

const NON_AUTHORITATIVE_PREAMBLE_PAGES = new Set([
  "index.md",
  "manifesto.md",
  "getting-started.md",
  "quick-reference.md",
]);

const EXTRA_TRIGGERS = new Set([
  "Encoding and layout:",
  "Key and element order:",
  "Scalars:",
  "Supported generation strategies:",
  "The update flow:",
]);

const NORMATIVE_KEYWORD = /\b(?:MUST|SHOULD|MAY|OPTIONAL|RECOMMENDED|REQUIRED)\b/;

export function isTrigger(line: string): boolean {
  const trimmed = line.trim();
  return /ules:$/.test(trimmed) || /when:$/.test(trimmed) || EXTRA_TRIGGERS.has(trimmed);
}

function proseLines(text: string): Array<string | null> {
  let fence: string | undefined;
  return text.split(/\r?\n/).map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (marker && marker[1]![0] === fence[0]
        && marker[1]!.length >= fence.length && marker[2]!.trim() === "") {
        fence = undefined;
      }
      return null;
    }
    if (marker && !(marker[1]![0] === "`" && marker[2]!.includes("`"))) {
      fence = marker[1]!;
      return null;
    }
    return line;
  });
}

export function ruleLines(text: string): number[] {
  const lines = proseLines(text);
  const result: number[] = [];
  let inList = false;
  let armed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line == null) {
      inList = false;
      armed = false;
      continue;
    }
    if (/^- /.test(line) || /^\d+\. /.test(line)) {
      if (armed || inList) {
        result.push(i);
        inList = true;
        armed = false;
      }
      continue;
    }
    if (/^\s+\S/.test(line) && inList) continue; // nested item or continuation
    if (line.trim() === "") {
      inList = false;
      if (!armed) continue;
      continue; // a single blank line after a trigger keeps it armed
    }
    inList = false;
    armed = isTrigger(line);
  }
  return result;
}

export function lintSpecification(
  documents: Record<string, string>,
  registry: RuleRegistry,
): string[] {
  const failures: string[] = [];
  const allocated = new Map<string, string>();
  const seen = new Map<string, string>();
  const normativePages = new Set<string>();

  for (const [prefix, { page, last }] of Object.entries(registry.prefixes)) {
    if (!/^[A-Z]{2,3}$/.test(prefix) || !Number.isSafeInteger(last) || last < 0) {
      failures.push(`registry: invalid allocation for ${prefix}`);
      continue;
    }
    normativePages.add(page);
    for (let number = 1; number <= last; number++) {
      const id = `${prefix}-${number}`;
      allocated.set(id, registry.relocations[id] ?? page);
    }
  }

  for (const [id, page] of Object.entries(registry.relocations)) {
    if (!allocated.has(id)) failures.push(`registry: ${id} is not allocated`);
    if (id in registry.retired) failures.push(`registry: ${id} is both relocated and retired`);
    normativePages.add(page);
  }
  for (const [id, reason] of Object.entries(registry.retired)) {
    if (!allocated.has(id)) failures.push(`registry: ${id} is not allocated`);
    if (!reason.trim()) failures.push(`registry: ${id} retirement needs a reason`);
  }

  for (const page of normativePages) {
    const text = documents[page];
    if (text === undefined) {
      failures.push(`registry: missing owning page ${page}`);
      continue;
    }
    const lines = text.split("\n");
    const identifiedRuleLines = new Set(ruleLines(text));
    for (const lineNo of identifiedRuleLines) {
      const line = lines[lineNo]!;
      const match = /^(?:- |\d+\. )`([A-Z]{2,3}-[1-9][0-9]*)` /.exec(line);
      const location = `${page}:${lineNo + 1}`;
      if (!match) {
        failures.push(`${location}: rule without identifier: ${line.slice(0, 80)}`);
        continue;
      }
      const id = match[1]!;
      const owner = allocated.get(id);
      if (!owner) failures.push(`${location}: ${id} is not allocated in the registry`);
      else if (owner !== page) failures.push(`${location}: ${id} belongs to ${owner}`);
      if (id in registry.retired) failures.push(`${location}: ${id} is retired and cannot be reused`);
      const existing = seen.get(id);
      if (existing) failures.push(`${location}: duplicate identifier ${id} (also in ${existing})`);
      seen.set(id, location);
    }

    for (const [lineNo, line] of proseLines(text).entries()) {
      if (line === null || !NORMATIVE_KEYWORD.test(line) || identifiedRuleLines.has(lineNo)) continue;
      failures.push(`${page}:${lineNo + 1}: normative keyword outside an identified rule`);
    }
  }

  for (const id of allocated.keys()) {
    if (!seen.has(id) && !(id in registry.retired)) {
      failures.push(`registry: allocated rule ${id} is missing; restore it or record its retirement`);
    }
  }

  for (const [page, text] of Object.entries(documents)) {
    const nonAuthoritative = NON_AUTHORITATIVE_PREAMBLE_PAGES.has(page);
    if (!normativePages.has(page) && /^Authoritative for:\s*$/m.test(text)) {
      failures.push(`${page}: authoritative page is not registered`);
    }
    for (const [lineNo, line] of proseLines(text).entries()) {
      if (line === null) continue;
      for (const match of line.matchAll(/\b([A-Z]{2,3}-[0-9]+)\b/g)) {
        const id = match[1]!;
        const prefix = id.split("-")[0]!;
        if (!(prefix in registry.prefixes) && !line.includes(`\`${id}\``) && !line.includes(`#${id}`)) continue;
        if (id in registry.retired) failures.push(`${page}:${lineNo + 1}: retired rule reference ${id}`);
        else if (!seen.has(id)) failures.push(`${page}:${lineNo + 1}: unknown rule reference ${id}`);
      }
    }
    if (!normativePages.has(page) && !nonAuthoritative) continue;
    const requiredMarkers: Array<readonly [string, RegExp]> = [
      ["frontmatter audience", /^audience:\s+\S+/m],
      ["Audience line", /^Audience:\s+\S+/m],
      ["See also list", /^See also:\s*$/m],
    ];
    if (!nonAuthoritative) {
      requiredMarkers.push(["Authoritative for list", /^Authoritative for:\s*$/m]);
    } else if (/^Authoritative for:\s*$/m.test(text)) {
      failures.push(`${page}: non-authoritative page must omit the Authoritative for list`);
    }
    for (const [label, pattern] of requiredMarkers) {
      if (!pattern.test(text)) failures.push(`${page}: missing required preamble element: ${label}`);
    }
  }
  return failures;
}

function main(): number {
  const documents: Record<string, string> = {};
  for (const file of readdirSync(ROOT).filter((file) => file.endsWith(".md"))) {
    documents[file] = readFileSync(join(ROOT, file), "utf8");
  }
  const failures = lintSpecification(documents, registry);
  const countRules = (pages: string[]) =>
    pages.reduce((total, page) => total + ruleLines(documents[page] ?? "").length, 0);
  const coreCount = countRules(CORE_PAGES);
  const reuseCount = countRules(REUSE_PAGES);
  const readingWords = [...CORE_PAGES, "manifesto.md", "getting-started.md"]
    .reduce((total, page) => total + (documents[page]?.trim().split(/\s+/u).length ?? 0), 0);
  if (coreCount > 600) failures.push(`Core budget: ${coreCount} rules exceeds 600`);
  if (reuseCount > 100) failures.push(`Reuse budget: ${reuseCount} rules exceeds 100`);
  if (readingWords > 20000) failures.push(`Core reading-path budget: ${readingWords} words exceeds 20000`);
  for (const page of CORE_PAGES) {
    const count = ruleLines(documents[page] ?? "").length;
    if (count > 150) failures.push(`${page}: ${count} Core rules exceeds 150`);
  }
  for (const page of NON_AUTHORITATIVE_PREAMBLE_PAGES) {
    if (!(page in documents)) failures.push(`missing published page ${page}`);
  }

  const reportSchema = JSON.parse(readFileSync(
    join(ROOT, "schema", "json-schema", "validation-report.schema.json"), "utf8",
  ));
  const reportRulePattern = new RegExp(reportSchema.$defs.result.properties.rule_id.pattern);
  for (const prefix of Object.keys(registry.prefixes)) {
    if (!reportRulePattern.test(`${prefix}-1`)) {
      failures.push(`validation-report schema does not recognize registered prefix ${prefix}`);
    }
  }
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    console.error(`\n${failures.length} specification rule lint problem(s)`);
    return 1;
  }
  const count = Object.values(registry.prefixes).reduce((total, { last }) => total + last, 0)
    - Object.keys(registry.retired).length;
  console.log(`all ${count} rule identifiers are present, unique, and registered`);
  console.log(`budgets: Core ${coreCount}/600 rules, Reuse ${reuseCount}/100, reading path ${readingWords}/20000 words`);
  return 0;
}

if (import.meta.main) process.exit(main());
