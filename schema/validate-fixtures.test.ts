import { describe, expect, test } from "bun:test";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildValidators, validateExamples, validateGoldenVectors } from "./validate-fixtures";

const validators = buildValidators();
const collection = "specification_version: 0.0.1\nname: example\ndescription: Example collection.";

function checkExample(text: string) {
  const failures: string[] = [];
  const checked = validateExamples(text, "example.md", validators, failures);
  return { checked, failures };
}

function example(annotation: string, body: string, lang = "yaml", fence = "```") {
  return `<!-- typedmark-example: ${annotation} -->\n${fence}${lang}\n${body}\n${fence}\n`;
}

describe("specification examples", () => {
  test("validates explicitly classified full artifacts", () => {
    expect(checkExample(example("artifact=typedmark", collection))).toEqual({
      checked: 1, failures: [],
    });
  });

  test.each([
    ["json", '{"specification_version":"0.0.1","name":"example","description":"Collection."}'],
    ["markdown", `---\n${collection}\n---\n\nHuman guidance.`],
    ["md", `---\n${collection}\n...\n\nHuman guidance.`],
  ])("validates full %s artifacts", (lang, body) => {
    expect(checkExample(example("artifact=typedmark", body, lang)))
      .toEqual({ checked: 1, failures: [] });
  });

  test.each(["yaml", "yml", "json", "markdown", "md"])(
    "rejects unclassified %s blocks even when their shape cannot identify an artifact",
    (lang) => {
      expect(checkExample(`\`\`\`${lang}\n{}\n\`\`\``).failures.join("\n"))
        .toContain("example.md:1: missing typedmark-example annotation");
    },
  );

  test.each([
    ["yaml", "name: [unterminated"],
    ["json", '{"name":'],
    ["markdown", "---\nname: [unterminated\n---"],
    ["markdown", "No frontmatter."],
  ])("reports malformed %s artifacts", (lang, body) => {
    const result = checkExample(example("artifact=typedmark", body, lang));
    expect(result.failures.join("\n")).toContain("example.md:2");
    expect(result.failures.length).toBeGreaterThan(0);
  });

  test.each([
    "name: example\ndescription: Missing version.",
    "specification_version: 0.0.1\ndescription: Missing name.",
  ])("does not infer the schema from required keys", (body) => {
    expect(checkExample(example("artifact=typedmark", body)).failures.join("\n"))
      .toContain("expected to pass shape validation");
  });

  test.each(["artifact=typo", "artifact=constructor", "artifact=toString", "artfact=typedmark", "fragment:", "body:"])(
    "rejects unknown or malformed classifications: %s", (annotation) => {
      expect(checkExample(example(annotation, collection)).failures.length).toBeGreaterThan(0);
    },
  );

  test("rejects orphan annotations and unsupported fence languages", () => {
    for (const text of [
      "<!-- typedmark-example: artifact=typedmark -->",
      example("artifact=typedmark", collection, "text"),
      "<!-- typedmark-example: artifact=typedmark -->\nProse in between.\n```yaml\n{}\n```",
    ]) {
      expect(checkExample(text).failures.length).toBeGreaterThan(0);
    }
  });

  test.each([["yaml", "type: text"], ["json", '{"type":"text"}']])(
    "parse-checks intentional %s fragments without full-artifact validation", (lang, body) => {
      expect(checkExample(example("fragment: Individual field definition.", body, lang)))
        .toEqual({ checked: 0, failures: [] });
    },
  );

  test("does not infer full-artifact validation for an explicitly partial document", () => {
    expect(checkExample(example("fragment: Collection identity excerpt.",
      "specification_version: 0.0.1\nname: example"))).toEqual({ checked: 0, failures: [] });
  });

  test.each([["yaml", "type: ["], ["json", '{"type":']])(
    "rejects syntax errors in %s fragments", (lang, body) => {
      expect(checkExample(example("fragment: Partial field declaration.", body, lang))
        .failures.length).toBeGreaterThan(0);
    },
  );

  test("explicitly exempts Markdown body/template examples", () => {
    expect(checkExample(example("body: Template body with no governed frontmatter.",
      "# Heading\n{{title}}\n<!-- typedmark:expansion:start -->", "md")))
      .toEqual({ checked: 0, failures: [] });
  });

  test("does not allow body labels to bypass YAML or JSON parsing", () => {
    expect(checkExample(example("body: Not Markdown.", "name: [")).failures.length)
      .toBeGreaterThan(0);
  });

  test.each(["````", "~~~~"])("supports %s fences and language aliases", (fence) => {
    expect(checkExample(example("artifact=typedmark", collection, "yml", fence)))
      .toEqual({ checked: 1, failures: [] });
  });

  test("a shorter or different fence cannot truncate a body", () => {
    const text = "<!-- typedmark-example: body: Nested fenced example. -->\n````markdown\n"
      + "```yaml\nunclassified: [\n```\n~~~\n````\n";
    expect(checkExample(text)).toEqual({ checked: 0, failures: [] });
  });

  test("does not truncate malformed JSON at a shorter fence", () => {
    const body = '{"specification_version":"0.0.1","name":"example","description":"Collection."}'
      + "\n```\nnot JSON";
    expect(checkExample(example("artifact=typedmark", body, "json", "````")).failures.length)
      .toBeGreaterThan(0);
  });

  test.each(["yaml", "json", "markdown"])("requires classification inside %s container blocks", (lang) => {
    const text = `> Quote.\n>\n> \`\`\`${lang}\n> {}\n> \`\`\`\n\n`
      + `- Item.\n\n  \`\`\`${lang}\n  {}\n  \`\`\`\n`;
    const failures = checkExample(text).failures.join("\n");
    expect(failures).toContain("example.md:3: missing typedmark-example annotation");
    expect(failures).toContain("example.md:9: missing typedmark-example annotation");
  });

  test("accepts classified fences within blockquotes and list items", () => {
    const content = example("artifact=typedmark", collection).trimEnd().split("\n");
    for (const text of [
      content.map((line) => `> ${line}`).join("\n"),
      content.map((line, index) => `${index === 0 ? "- " : "  "}${line}`).join("\n"),
    ]) {
      expect(checkExample(text)).toEqual({ checked: 1, failures: [] });
    }
  });

  test("preserves opening line numbers with CRLF and longer closing fences", () => {
    const text = "\r\n\r\n<!-- typedmark-example: artifact=typedmark -->\r\n"
      + "~~~json\r\n{}\r\n~~~~\r\n";
    expect(checkExample(text).failures.join("\n")).toContain("example.md:4");
  });

  test("rejects unclosed eligible fences", () => {
    expect(checkExample("<!-- typedmark-example: artifact=typedmark -->\n```yaml\n"
      + collection).failures.join("\n")).toContain("unclosed");
  });
});

function checkGoldenDataset(body: string, filename = "meetings.md"): string[] {
  const root = join(import.meta.dir, `.fixture-test-${crypto.randomUUID()}`);
  try {
    const vector = join(root, "core-valid");
    cpSync(join(import.meta.dir, "fixtures", "golden", "core-valid"), vector, { recursive: true });
    const datasets = join(vector, "collection", ".typedmark", "datasets");
    mkdirSync(datasets, { recursive: true });
    writeFileSync(join(datasets, filename), `---\n${body}\n---\n`);
    const failures: string[] = [];
    validateGoldenVectors(validators, failures, root);
    return failures;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const dataset = `specification_version: 0.0.1
dataset: meetings
description: Meeting paths.
row_identity: path
query:
  specification_version: 0.0.1
  note_types: [meeting]
  select:
    - {kind: path, as: path}`;

describe("golden datasets", () => {
  test("accepts a shape-valid dataset with matching basename", () => {
    expect(checkGoldenDataset(dataset)).toEqual([]);
  });

  test("rejects datasets with invalid schema shape", () => {
    expect(checkGoldenDataset(dataset.replace("row_identity: path\n", "")).join("\n"))
      .toContain("expected to pass shape validation");
  });

  test("rejects datasets whose basename differs from dataset", () => {
    expect(checkGoldenDataset(dataset, "wrong.md").join("\n"))
      .toContain("dataset basename does not match dataset meetings");
  });
});

describe("golden negotiation context", () => {
  function checkContext(context: string): string[] {
    const root = join(import.meta.dir, `.fixture-test-${crypto.randomUUID()}`);
    try {
      const vector = join(root, "negotiation");
      cpSync(join(import.meta.dir, "fixtures", "golden", "unsupported-required-extension"), vector, { recursive: true });
      writeFileSync(join(vector, "vector.json"), context);
      const failures: string[] = [];
      validateGoldenVectors(validators, failures, root);
      return failures;
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  test("accepts an explicit unsupported-extension precondition", () => {
    expect(checkContext('{"unsupported_extensions":["example:review"]}')).toEqual([]);
  });

  test.each([
    '{',
    '{"disabled_extensions":"example:review"}',
    '{"unsupported_extensions":["example:review","example:review"]}',
    '{"unexpected":true}',
  ])("rejects malformed context: %s", (context) => {
    expect(checkContext(context).join("\n")).toContain("vector.json");
  });

  test("rejects a precondition for an undeclared extension", () => {
    expect(checkContext('{"unsupported_extensions":["typedmark:queries"]}').join("\n")).toContain("declared");
  });

  test("does not conflate unsupported and deliberately disabled contracts", () => {
    expect(checkContext('{"unsupported_extensions":["example:review"],"disabled_extensions":["example:review"]}').join("\n"))
      .toContain("both");
  });
});

describe("golden query cases", () => {
  function checkQueryCases(cases: unknown): string[] {
    const root = join(import.meta.dir, `.fixture-test-${crypto.randomUUID()}`);
    try {
      const vector = join(root, "query");
      cpSync(join(import.meta.dir, "fixtures", "golden", "core-valid"), vector, { recursive: true });
      writeFileSync(join(vector, "query-cases.json"), JSON.stringify(cases));
      const failures: string[] = [];
      validateGoldenVectors(validators, failures, root);
      return failures;
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
  const queryCase = {
    name: "paths", query_version: "0.1.0", rules: ["CM-362"],
    query: { specification_version: "0.1.0", select: [{ kind: "path", as: "path" }] },
    expected_result: { evaluation: "complete", rows: [{ path: "Example.md" }] },
  };
  test("validates the query and its normalized expected result", () => {
    expect(checkQueryCases([queryCase])).toEqual([]);
  });
  test("rejects invalid descriptor shape and duplicate case names", () => {
    expect(checkQueryCases([{ ...queryCase, query: {} }]).join("\n")).toContain("query-cases.json");
    expect(checkQueryCases([queryCase, queryCase]).join("\n")).toContain("duplicate");
  });
  test("rejects stale rule references and mismatched projected columns", () => {
    expect(checkQueryCases([{ ...queryCase, rules: ["CM-999999"] }]).join("\n")).toContain("rule");
    expect(checkQueryCases([{ ...queryCase, expected_result: { evaluation: "complete", rows: [{ wrong: 1 }] } }]).join("\n")).toContain("columns");
  });
});
