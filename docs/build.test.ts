import { expect, test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dir, "..");

test.each(["\n", "\r\n", "\r"])("site build removes page frontmatter with %j line endings", (newline) => {
  const root = mkdtempSync(join(tmpdir(), "typedmark-site-build-"));
  try {
    for (const entry of readdirSync(repository).filter((name) => name.endsWith(".md"))) {
      const source = readFileSync(join(repository, entry), "utf8").replace(/\r\n?|\n/g, newline);
      writeFileSync(join(root, entry), source);
    }
    cpSync(join(repository, "docs"), join(root, "docs"), { recursive: true });
    cpSync(join(repository, "schema"), join(root, "schema"), { recursive: true });
    mkdirSync(join(root, "scripts"));
    cpSync(join(repository, "scripts/rule-registry.json"), join(root, "scripts/rule-registry.json"));
    symlinkSync(join(repository, "node_modules"), join(root, "node_modules"), "junction");

    const built = Bun.spawnSync([process.execPath, join(root, "docs/build.ts")], { cwd: root, stdout: "pipe", stderr: "pipe" });
    expect(built.exitCode, built.stderr.toString()).toBe(0);
    const html = readFileSync(join(root, "dist/index.html"), "utf8");
    expect(html).toContain("<title>TypedMark — TypedMark</title>");
    expect(html).toContain('class="badge badge-essentials"');
    expect(html).not.toContain("title: TypedMark");
    expect(html).toContain("<h1>TypedMark</h1>");
    expect(html).toContain('<link rel="icon" href="data:,">');
    const search = JSON.parse(readFileSync(join(root, "dist/search-index.json"), "utf8"));
    expect(search.some((entry: { heading: string | null }) => entry.heading?.includes("nav_order:"))).toBe(false);
    expect(readFileSync(join(root, "index.md"), "utf8")).toBe(readFileSync(join(repository, "index.md"), "utf8").replace(/\r\n?|\n/g, newline));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 30_000);
