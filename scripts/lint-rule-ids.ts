#!/usr/bin/env bun
/**
 * Lint the stable rule identifiers in the specification pages.
 *
 * Every top-level item of a normative rule list must start with a rule ID
 * chip (e.g. `CM-12`) using the page's prefix, and every ID must be unique
 * across the whole specification. IDs are append-only: never renumber, and
 * retire the ID of a removed rule instead of reusing it.
 *
 * Usage: bun scripts/lint-rule-ids.ts (or: bun run lint-rule-ids)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

const PREFIXES: Record<string, string> = {
  "foundations.md": "FND",
  "collection-model.md": "CM",
  "note-type-schemas.md": "NTS",
  "field-definition-reference.md": "FDR",
  "managed-notes-and-properties.md": "MN",
  "note-links.md": "NL",
  "relationships-headings-and-templates.md": "RHT",
  "systems-composition-evolution.md": "SCE",
  "migration-effects.md": "ME",
  "conformance-and-roadmap.md": "CR",
};

const EXTRA_TRIGGERS = new Set([
  "Encoding and layout:",
  "Key and element order:",
  "Scalars:",
  "Supported generation strategies:",
  "The update flow:",
]);

export function isTrigger(line: string): boolean {
  const trimmed = line.trim();
  return /ules:$/.test(trimmed) || /when:$/.test(trimmed) || EXTRA_TRIGGERS.has(trimmed);
}

export function ruleLines(text: string): number[] {
  const lines = text.split("\n");
  const result: number[] = [];
  let inFence = false;
  let inList = false;
  let armed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^```/.test(line)) {
      inFence = !inFence;
      inList = false;
      armed = false;
      continue;
    }
    if (inFence) continue;
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

let failures = 0;
const seen = new Map<string, string>();

for (const [page, prefix] of Object.entries(PREFIXES)) {
  const text = readFileSync(join(ROOT, page), "utf8");
  const lines = text.split("\n");
  for (const lineNo of ruleLines(text)) {
    const line = lines[lineNo]!;
    const match = /^(?:- |\d+\. )`([A-Z]{2,3}-\d+)` /.exec(line);
    if (!match) {
      console.error(`${page}:${lineNo + 1}: rule without identifier: ${line.slice(0, 80)}`);
      failures++;
      continue;
    }
    const id = match[1]!;
    if (!id.startsWith(`${prefix}-`)) {
      console.error(`${page}:${lineNo + 1}: identifier ${id} does not use prefix ${prefix}`);
      failures++;
    }
    const existing = seen.get(id);
    if (existing) {
      console.error(`${page}:${lineNo + 1}: duplicate identifier ${id} (also in ${existing})`);
      failures++;
    }
    seen.set(id, `${page}:${lineNo + 1}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} rule identifier problem(s)`);
  process.exit(1);
}
console.log(`all ${seen.size} rule identifiers are present and unique`);
