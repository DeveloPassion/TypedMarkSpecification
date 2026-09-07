import { posix } from "node:path";

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
