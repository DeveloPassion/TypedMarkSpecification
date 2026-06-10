#!/usr/bin/env bun
/**
 * Build the TypedMark specification website into dist/.
 *
 * The website renders the ACTUAL specification sources at the repository root
 * (plus schema/docs/schema-boundary.md) — no spec content is duplicated here.
 * It also copies the schema/ tree into the published site so the JSON Schema
 * $id URLs resolve.
 *
 * Usage: bun docs/build.ts  (or: bun run build-site)
 */

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

const ROOT = join(import.meta.dir, "..");
const DIST = join(ROOT, "dist");

interface Page {
  file: string;
  out: string;
  nav: string;
  section: string;
}

const PAGES: Page[] = [
  { file: "index.md", out: "index.html", nav: "Overview", section: "Specification" },
  { file: "manifesto.md", out: "manifesto.html", nav: "Manifesto", section: "Specification" },
  { file: "foundations.md", out: "foundations.html", nav: "Foundations", section: "Specification" },
  { file: "collection-model.md", out: "collection-model.html", nav: "Collection Model", section: "Specification" },
  { file: "note-type-schemas.md", out: "note-type-schemas.html", nav: "Note Type Schemas", section: "Specification" },
  { file: "managed-notes-and-properties.md", out: "managed-notes-and-properties.html", nav: "Managed Notes and Properties", section: "Specification" },
  { file: "relationships-headings-and-templates.md", out: "relationships-headings-and-templates.html", nav: "Relationships, Headings, and Templates", section: "Specification" },
  { file: "systems-composition-evolution.md", out: "systems-composition-evolution.html", nav: "Systems, Composition, and Evolution", section: "Specification" },
  { file: "conformance-and-roadmap.md", out: "conformance-and-roadmap.html", nav: "Conformance and Roadmap", section: "Specification" },
  { file: "schema/docs/schema-boundary.md", out: "schema-boundary.html", nav: "Schema Boundary", section: "Resources" },
];

const REPO_URL = "https://github.com/DeveloPassion/TypedMarkSpecification";

const RELATED = [
  { label: "TypedMark (tooling)", url: "https://github.com/DeveloPassion/TypedMark" },
  { label: "TypedMarkExample", url: "https://github.com/DeveloPassion/TypedMarkExample" },
  { label: "Systems Marketplace", url: "https://github.com/DeveloPassion/TypedMarkSystemsMarketplace" },
];

function stripFrontmatter(text: string): { body: string; title: string | null } {
  const lines = text.split("\n");
  if (lines[0] !== "---") return { body: text, title: null };
  const end = lines.findIndex((l, i) => i > 0 && (l === "---" || l === "..."));
  if (end === -1) return { body: text, title: null };
  const head = lines.slice(1, end).join("\n");
  const title = /^title:\s*(.+)$/m.exec(head)?.[1]?.trim() ?? null;
  return { body: lines.slice(end + 1).join("\n"), title };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface TocEntry {
  depth: number;
  text: string;
  id: string;
}

function renderPage(markdown: string): { html: string; toc: TocEntry[] } {
  let html = marked.parse(markdown, { async: false }) as string;

  // Rewrite internal links between spec pages: foo.md(#anchor) -> foo.html(#anchor)
  const known = new Map(PAGES.map((p) => [p.file.split("/").pop()!, p.out]));
  html = html.replace(/href="([a-z][a-z0-9./-]*\.md)(#[^"]*)?"/g, (m, target: string, anchor?: string) => {
    const base = target.split("/").pop()!;
    const out = known.get(base);
    return out ? `href="${out}${anchor ?? ""}"` : m;
  });

  // Add ids to h2/h3 headings and collect the table of contents.
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, depth: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "");
    let id = slugify(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    toc.push({ depth: Number(depth), text, id });
    return `<h${depth} id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>`;
  });

  return { html, toc };
}

function navHtml(current: Page): string {
  const sections = [...new Set(PAGES.map((p) => p.section))];
  let out = "";
  for (const section of sections) {
    out += `<p class="nav-section">${section}</p><ul>`;
    for (const page of PAGES.filter((p) => p.section === section)) {
      const active = page.out === current.out ? ' class="active"' : "";
      out += `<li${active}><a href="${page.out}">${page.nav}</a></li>`;
    }
    out += "</ul>";
  }
  out += `<p class="nav-section">Links</p><ul>`;
  out += `<li><a href="${REPO_URL}">GitHub</a></li>`;
  out += `<li><a href="schema/json-schema/typedmark.schema.json">JSON Schemas</a></li>`;
  for (const r of RELATED) out += `<li><a href="${r.url}">${r.label}</a></li>`;
  out += "</ul>";
  return out;
}

function tocHtml(toc: TocEntry[]): string {
  if (toc.length === 0) return "";
  let out = '<nav class="toc" aria-label="On this page"><p>On this page</p><ul>';
  for (const entry of toc) {
    out += `<li class="d${entry.depth}"><a href="#${entry.id}">${entry.text}</a></li>`;
  }
  return out + "</ul></nav>";
}

function shell(page: Page, title: string, content: string, toc: TocEntry[]): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — TypedMark</title>
<meta name="description" content="TypedMark is an open specification for typed Markdown note systems.">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="topbar">
<button id="menu" aria-label="Toggle navigation">☰</button>
<a class="brand" href="index.html">TypedMark</a>
<span class="tagline">Typed Markdown note systems</span>
<input id="search" type="search" placeholder="Search headings…" autocomplete="off">
<div id="search-results" hidden></div>
</header>
<div class="layout">
<nav class="sidebar" id="sidebar" aria-label="Specification">${navHtml(page)}</nav>
<main class="content">
<article>${content}</article>
<footer>Rendered from <a href="${REPO_URL}/blob/main/${page.file}"><code>${page.file}</code></a> — the Markdown sources are the specification.</footer>
</main>
<aside class="rail">${tocHtml(toc)}</aside>
</div>
<script src="site.js"></script>
</body>
</html>
`;
}

// Build
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const searchIndex: Array<{ page: string; heading: string | null; url: string }> = [];

for (const page of PAGES) {
  const raw = readFileSync(join(ROOT, page.file), "utf8");
  const { body, title } = stripFrontmatter(raw);
  const { html, toc } = renderPage(body);
  const pageTitle = title ?? page.nav;
  writeFileSync(join(DIST, page.out), shell(page, pageTitle, html, toc));
  searchIndex.push({ page: pageTitle, heading: null, url: page.out });
  for (const entry of toc) {
    searchIndex.push({ page: pageTitle, heading: entry.text, url: `${page.out}#${entry.id}` });
  }
  console.log(`rendered ${page.file} -> ${page.out}`);
}

writeFileSync(join(DIST, "search-index.json"), JSON.stringify(searchIndex));
cpSync(join(import.meta.dir, "styles.css"), join(DIST, "styles.css"));
cpSync(join(import.meta.dir, "site.js"), join(DIST, "site.js"));
cpSync(join(ROOT, "schema"), join(DIST, "schema"), { recursive: true });
writeFileSync(join(DIST, ".nojekyll"), "");
console.log(`built ${PAGES.length} pages into dist/`);
