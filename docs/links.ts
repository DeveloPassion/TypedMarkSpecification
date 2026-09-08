import { posix } from "node:path";
import type { RuleRegistry } from "../scripts/lint-rule-ids";

export function rewritePageLinks(
  html: string,
  sourceFile: string,
  pages: ReadonlyArray<{ file: string; out: string }>,
): string {
  const outputs = new Map(pages.map((page) => [page.file, page.out]));
  return html.replace(/href="([^"#?]+\.md)([?#][^"]*)?"/g,
    (original, target: string, suffix?: string) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(target)) return original;
      const sourceTarget = posix.normalize(posix.join(posix.dirname(sourceFile), target));
      return `href="${outputs.get(sourceTarget) ?? sourceTarget}${suffix ?? ""}"`;
    });
}

export function renderMovedRuleLinks(
  sourceFile: string,
  pages: ReadonlyArray<{ file: string; out: string }>,
  registry: Pick<RuleRegistry, "prefixes" | "relocations">,
): string {
  const outputs = new Map(pages.map((page) => [page.file, page.out]));
  const links: string[] = [];
  for (const [id, destination] of Object.entries(registry.relocations).sort()) {
    const prefix = id.split("-")[0]!;
    const allocation = registry.prefixes[prefix];
    if (!allocation) throw new Error(`unregistered moved rule ${id}`);
    if (allocation.page !== sourceFile || destination === sourceFile) continue;
    const output = outputs.get(destination);
    if (!output) throw new Error(`moved rule ${id} has unpublished destination ${destination}`);
    links.push(`<li id="${Bun.escapeHTML(id)}"><a href="${Bun.escapeHTML(output)}#${Bun.escapeHTML(id)}">${Bun.escapeHTML(id)}</a></li>`);
  }
  return links.length === 0 ? ""
    : `<details class="moved-rules"><summary>Moved rule references</summary><ul>${links.join("")}</ul></details>`;
}
