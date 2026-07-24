#!/usr/bin/env bun
/**
 * Lint rule identifiers, normative-keyword placement, and page preambles.
 *
 * Every top-level item of a normative rule list must start with a rule ID
 * chip (e.g. `CM-12`) using the page's prefix, and every ID must be unique
 * across the whole specification. IDs are append-only: never renumber, and
 * retire the ID of a removed rule instead of reusing it.
 * Normative keywords belong only on identified rule lines. Published pages
 * carry compact preambles; non-authoritative introductory pages omit the
 * otherwise-required Authoritative for list.
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

const PREAMBLE_PAGES = [
  "index.md",
  "manifesto.md",
  "getting-started.md",
  ...Object.keys(PREFIXES),
  "quick-reference.md",
];

const NON_AUTHORITATIVE_PREAMBLE_PAGES = new Set([
  "index.md",
  "manifesto.md",
  "getting-started.md",
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
  const identifiedRuleLines = new Set(ruleLines(text));
  for (const lineNo of identifiedRuleLines) {
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

  let inFence = false;
  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo]!;
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !NORMATIVE_KEYWORD.test(line)) continue;
    if (identifiedRuleLines.has(lineNo)) continue;
    console.error(`${page}:${lineNo + 1}: normative keyword outside an identified rule`);
    failures++;
  }
}

for (const page of PREAMBLE_PAGES) {
  const text = readFileSync(join(ROOT, page), "utf8");
  const requiredMarkers: Array<readonly [string, RegExp]> = [
    ["frontmatter audience", /^audience:\s+\S+/m],
    ["Audience line", /^Audience:\s+\S+/m],
    ["See also list", /^See also:\s*$/m],
  ];
  if (!NON_AUTHORITATIVE_PREAMBLE_PAGES.has(page)) {
    requiredMarkers.push(["Authoritative for list", /^Authoritative for:\s*$/m]);
  } else if (/^Authoritative for:\s*$/m.test(text)) {
    console.error(`${page}: non-authoritative page must omit the Authoritative for list`);
    failures++;
  }
  for (const [label, pattern] of requiredMarkers) {
    if (pattern.test(text)) continue;
    console.error(`${page}: missing required preamble element: ${label}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} specification rule lint problem(s)`);
  process.exit(1);
}
console.log(`all ${seen.size} rule identifiers are present and unique`);
