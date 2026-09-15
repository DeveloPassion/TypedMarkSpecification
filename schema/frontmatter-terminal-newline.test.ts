import { expect, test } from "bun:test";
import { buildValidators, validateExamples } from "./validate-fixtures";

const validators = buildValidators();
const header = "specification_version: 0.1.0\nname: terminal-newline\ndescription: Parsing.\n";

function check(source: string, language = "markdown") {
  let data: Record<string, unknown> | undefined;
  const capture = new Proxy(validators.typedmark!, {
    apply(target, receiver, args) { data = args[0]; return Reflect.apply(target, receiver, args); },
  });
  const failures: string[] = [];
  const count = validateExamples(`<!-- typedmark-example: artifact=typedmark -->\n\`\`\`${language}\n${source}\n\`\`\`\n`,
    "newlines.md", { ...validators, typedmark: capture }, failures);
  expect({ count, failures }).toEqual({ count: 1, failures: [] });
  return data;
}

for (const ending of ["\n", "\r\n", "\r"]) for (const closing of ["---", "..."]) {
  test.each([
    { style: "|+", value: "first\nsecond\n\n" },
    { style: ">+", value: "first second\n\n" },
  ])(`checker retains $style scalar content before ${JSON.stringify(closing)} with ${JSON.stringify(ending)}`, ({ style, value }) => {
    const source = `---\n${header}x_text: ${style}\n  first\n  second\n\n${closing}\nBody\n---\n`;
    expect(check(source.replaceAll("\n", ending))?.x_text).toBe(value);
  });
}

test.each([
  { style: "|", value: "first\nsecond\n" },
  { style: "|-", value: "first\nsecond" },
  { style: ">", value: "first second\n" },
  { style: ">-", value: "first second" },
])("checker retains $style clipping/stripping semantics", ({ style, value }) => {
  expect(check(`---\n${header}x_text: ${style}\n  first\n  second\n\n---`)?.x_text).toBe(value);
});

test("checker retains nested keep-chomp values when the closing delimiter ends the file", () => {
  expect(check(`---\n${header}x_editor:\n  message: |+\n    retained\n\n...`)?.x_editor).toEqual({ message: "retained\n\n" });
});

test("checker retains a final empty keep-chomp scalar's blank lines", () => {
  expect(check(`---\n${header}x_text: |+\n\n\n---`)?.x_text).toBe("\n\n");
});

test.each(["yaml", "yml"])("classified %s examples retain their final code-content line break", language => {
  // The fenced code contains two line breaks after the scalar text. check()
  // contributes the second one immediately before the closing code fence.
  expect(check(`${header}x_text: |+\n  retained\n`, language)?.x_text).toBe("retained\n\n");
});
