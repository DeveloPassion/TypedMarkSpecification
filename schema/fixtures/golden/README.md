# Golden collection vectors

Each directory is one self-contained validation vector:

- `collection/` is the exact collection root a validator receives.
- `expected-validation-report.json` is the expected portable report defined in
  [Conformance and Roadmap](../../../conformance-and-roadmap.md#validation-reports).
- Optional `vector.json` records explicit negotiation preconditions and disabled
  capabilities, under the non-normative [runner guide](../../docs/conformance-runner.md#explicit-negotiation-context).
- Optional `query-cases.json` records standalone descriptors, exact operation
  versions, rule references, and normalized expected query outcomes under the
  [query runner guide](../../docs/conformance-runner.md#standalone-query-cases).

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

`query-pilot-valid` is the supported-query pilot: its six cases exercise stored
versus effective values, relationships, ordering, limiting and grouping,
logical deletion, and semantic failures. The query descriptors remain outside
the collection and are supplied as explicit runtime inputs.

`views-valid` exercises governed dataset and saved-view query interpretation.
`views-invalid` reports duplicate dataset identities, an unknown presentation
column, and an unresolved dataset reference. Both require Queries and Views.
Their validation reports are complete even when semantic findings make them
invalid; missing interpretation is covered by separate negotiation cases.

`reuse-composition-valid` exercises collection defaults, abstract inheritance,
field removal, opt-in property sets, and full local replacement, including an
inherited condition and a dataset over concrete descendants.
`reuse-conditions-invalid` distinguishes effective comparisons from stored
presence and reports both a missing conditional value and conflicting matching
requirements. Neither vector materializes effective defaults into note files.

`derived-contracts-valid` combines stored computed names, note and template
expansions, dataset-backed dashboard content, and a valid automation declaration.
`derived-contracts-invalid` expects a protected-field automation assignment,
a stale computed value, and expansion drift to be reported independently.
These vectors exercise read-only validation, not automation execution,
template instantiation, expansion refresh, or destructive-action approval.

The reference adapter now supports Views, so the historical
`missing-extension-dependency` and `conflicting-extension-dependency` negotiation
preconditions no longer apply to it. The runner records them as not run instead
of changing capabilities to match their expected reports.
