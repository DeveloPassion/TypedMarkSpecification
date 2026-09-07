import { expect, test } from "bun:test";
import { renderMovedRuleLinks, rewritePageLinks } from "./links";

const pages = [
  { file: "foundations.md", out: "foundations.html" },
  { file: "schema/docs/schema-boundary.md", out: "schema-boundary.html" },
];

test("resolves Markdown links against the source page before relocating them", () => {
  expect(rewritePageLinks(
    '<a href="../../foundations.md#specification-versioning">Versioning</a>',
    "schema/docs/schema-boundary.md", pages,
  )).toBe('<a href="foundations.html#specification-versioning">Versioning</a>');
});

test("resolves links to copied resources that are not rendered pages", () => {
  expect(rewritePageLinks(
    '<a href="../fixtures/valid/README.md">Fixtures</a>',
    "schema/docs/schema-boundary.md", pages,
  )).toBe('<a href="schema/fixtures/valid/README.md">Fixtures</a>');
});

test("rewrites links from root pages and preserves query/fragment suffixes", () => {
  expect(rewritePageLinks(
    '<a href="schema/docs/schema-boundary.md?source=spec#fixtures">Boundary</a>',
    "index.md", pages,
  )).toBe('<a href="schema-boundary.html?source=spec#fixtures">Boundary</a>');
});

test("does not rewrite absolute URLs or anchor-only links", () => {
  const html = '<a href="https://example.org/foundations.md">External</a>'
    + '<a href="//example.org/foundations.md">External</a><a href="#fixtures">Here</a>';
  expect(rewritePageLinks(html, "index.md", pages)).toBe(html);
});

test("does not hide an escaping or wrong-directory path behind a known basename", () => {
  expect(rewritePageLinks(
    '<a href="../foundations.md">Outside</a><a href="wrong/foundations.md">Wrong</a>',
    "index.md", pages,
  )).toBe('<a href="../foundations.md">Outside</a><a href="wrong/foundations.md">Wrong</a>');
});

test("keeps original rule URLs navigable after a rule moves", () => {
  const registry = {
    prefixes: { FDR: { page: "fields.md", last: 2 } },
    relocations: { "FDR-2": "conversions.md" },
  };
  const output = renderMovedRuleLinks("fields.md", [
    { file: "fields.md", out: "fields.html" },
    { file: "conversions.md", out: "conversions.html" },
  ], registry);
  expect(output).toContain('id="FDR-2"');
  expect(output).toContain('href="conversions.html#FDR-2"');
  expect(output).not.toContain('id="FDR-1"');
  expect(renderMovedRuleLinks("conversions.md", [], registry)).toBe("");
});

test("rejects a moved-rule destination missing from the site registry", () => {
  expect(() => renderMovedRuleLinks("fields.md", [], {
    prefixes: { FDR: { page: "fields.md", last: 2 } },
    relocations: { "FDR-2": "conversions.md" },
  })).toThrow("conversions.md");
});
