# Golden collection vectors

Each directory is one self-contained validation vector:

- `collection/` is the exact collection root a validator receives.
- `expected-validation-report.json` is the expected portable report defined in
  [Conformance and Roadmap](../../../conformance-and-roadmap.md#validation-reports).

Implementations should compare every machine-stable report field and the
canonical result order. The `message` strings are illustrative; `CR-36` makes
them explicitly unsuitable for exact machine comparison.

`bun run validate-fixtures` checks the vector layout, governed-artifact shapes,
schema, automation, dataset, and view basenames, template references, report shape, and result
ordering. It does not replace a conformance runner or infer the expected
semantic findings.

`core-valid` contains only Core artifacts. `optional-artifacts-valid` exercises
automation and dataset shapes with explicit capability declarations.
`explicit-type-property-set-valid` replaces the old folder-scope example with
explicitly selected types. Query evaluation remains a semantic-runner responsibility.
