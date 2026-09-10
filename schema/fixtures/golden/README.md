# Golden collection vectors

Each directory is one self-contained validation vector:

- `collection/` is the exact collection root a validator receives.
- `expected-validation-report.json` is the expected portable report defined in
  [Conformance and Roadmap](../../../conformance-and-roadmap.md#validation-reports).
- Optional `vector.json` records explicit negotiation preconditions and disabled
  capabilities, under the non-normative [runner guide](../../docs/conformance-runner.md#explicit-negotiation-context).

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
`unsupported-required-extension` exercises capability negotiation: a Core-capable
adapter that lacks the required illustrative extension must report incomplete
evaluation rather than conformance.

The additional capability cases are:

| Vector | Behavior exercised |
| --- | --- |
| `supported-required-extension` | An implemented exact requirement is included in the evaluated set. |
| `limited-required-extension` | The same known requirement remains required when explicitly disabled. |
| `unsupported-extension-version` | An unsupported build suffix is not replaced by an implemented version. |
| `missing-extension-dependency` | Views requires the exact Queries dependency even when Views cannot be evaluated. |
| `conflicting-extension-dependency` | Conflicting exact dependency versions invalidate the declaration. |
| `undeclared-reuse` | Conditional schema constraints require an explicit Reuse declaration. |

`vector.json` is outside the collection and is not a governed artifact. The
fixture gate validates its shape and consistency with the collection and
expected report; only an executable runner can check its capability preconditions.
