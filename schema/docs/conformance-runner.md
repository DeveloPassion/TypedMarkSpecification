# Semantic conformance runner contract

This is a **non-normative integration guide** for executable conformance
adapters. It does not introduce another TypedMark artifact or replace the
[Conformance specification](https://developassion.github.io/TypedMarkSpecification/conformance-and-roadmap.html).
The prose specification owns behavior; vectors demonstrate that behavior.

`bun run validate-fixtures` checks examples, fixture shapes, collection layout,
and expected-report invariants. It does **not** run a semantic validator.
Executable validation and its adapter belong in the
[TypedMark tooling repository](https://github.com/DeveloPassion/TypedMark).

## Adapter inputs and outputs

The integration boundary is a validation operation over a filesystem snapshot.
A CLI, library, plugin, or service can supply an adapter; the specification does
not prescribe a command name, transport, or host application.

| Surface | Contract |
| --- | --- |
| Capability discovery | The adapter reports the core compatibility lines/highest implemented versions and exact extension versions it can actually evaluate. |
| Collection input | An isolated directory containing the vector's `collection/` tree. The harness supplies its absolute host path, not a path embedded in the fixture. |
| Reference edition | The suite identifies the specification edition being exercised. This does not override versions declared by individual artifacts. |
| Target mode | The harness explicitly selects the report's `mode`; a folder name is not a mode. |
| Evaluation scope | The harness records whether full interpretation or an intentionally limited capability set is requested. Limiting scope never removes requirements from the collection declaration. |
| Semantic output | One portable validation report as defined by Conformance, including completeness and the required/evaluated extension maps. |
| Operational failure | An adapter error, timeout, crash, or absence of a well-formed report is a failed run, not a fabricated validation result or a passing empty report. |

For example, a harness can select the `instantiated_collection` vector from the
`0.1.0` suite, copy its collection to a temporary directory, and request complete
evaluation. It passes the directory and evaluation context to the adapter,
**not** the expected findings, `valid` value, or expected evaluated set.

Logs remain separate from the report. Adapters document how their transport
represents a produced report versus an operational failure; the harness does
not infer collection validity merely from a process exit code.

## Selecting vectors by capability

Capabilities form a set with dependencies, not a numbered ladder. A normal
conformance case is eligible when the adapter can interpret its artifact
versions and required extension versions. A negotiation case instead names the
unsupported or deliberately excluded capability condition it is exercising.

| Case | Harness outcome |
| --- | --- |
| Eligible case, matching report | Pass for this vector and recorded capability configuration |
| Eligible case, different report | Fail with a machine-field difference |
| Missing capability for a normal full-conformance case | Not run / unsupported, never counted as a pass |
| Negotiation case matching the configured unsupported or limited scope | Run and compare the expected incomplete report |
| Negotiation precondition no longer applies to this adapter | Not run; do not disable support secretly to manufacture the expected result |

A collection requiring `example:review` at `1.2.0` remains such a collection when
the adapter only evaluates Core. The report retains that requirement and records
incomplete evaluation. An adapter that implements the extension can also run a
separate, explicitly limited-scope case without pretending the extension is
unknown.

### Explicit negotiation context

An optional `vector.json` beside `collection/` records harness setup. It is
non-normative test metadata, validated by `conformance-vector.schema.json`,
not another governed collection artifact. Ordinary vectors omit it.

| Key | Precondition and requested evaluation |
| --- | --- |
| `unsupported_extensions` | Each named extension is declared by the collection, and the adapter does not implement that exact declared version. No capability is disabled to arrange this condition. |
| `disabled_extensions` | The adapter implements each named extension at its exact declared version, and the harness explicitly excludes it from this run's evaluation scope. |

Both values are non-empty lists of unique extension identifiers when present.
The lists are disjoint and refer only to the collection's declared requirements.
Their names do not supply versions: the collection remains authoritative for
the exact versions. Unknown metadata keys are rejected.

For example, a deliberate Core-only evaluation of a collection requiring
`typedmark:systems` uses:

```json
{"disabled_extensions": ["typedmark:systems"]}
```

A runner whose Systems capability is absent records this case as not run because
its precondition is unmet. A runner implementing Systems executes it with that
capability explicitly excluded and records the requested scope alongside the
actual incomplete report. In either case the collection remains untouched.
An unsupported-extension case likewise stops applying once that exact version
is implemented; it is not counted as a pass.

Selection reads requirements from the collection and setup from `vector.json`.
The expected report supplies comparison data, not evidence of which capabilities
the adapter supports or a reason to disable one. The fixture gate checks that
expected reports do not claim a listed extension as evaluated.

### Standalone query cases

A vector can include `query-cases.json` beside `collection/`. This is additional
non-normative harness data, validated by `conformance-query.schema.json`, not a
new collection artifact or query interchange format. Each case names its
`query_version`, descriptor, cited `rules`, and exactly one expected outcome:
`expected_result` or `expected_error` (a built-in rule identifier).

The adapter receives only the collection snapshot, descriptor, and operation
version. The harness compares the produced result afterward. It normalizes
successful results to evaluation completeness, ordered projected rows, and
optional groups with their keys and ordered rows. It also checks projection
alias order. Adapters can retain additional provenance in actual evidence;
that adapter-specific representation is not a new portable wire contract.

The reference adapter advertises query execution separately under `operations`;
its `extensions` map describes collection-validation support. The dataset/view
validator now contributes Queries and Views support to that map. Supporting
these surfaces does not imply interpretation of queries inside unsupported
body contracts.

The fixture gate checks descriptor and expected-result shape, case-name
uniqueness, live rule references, and expected row columns. The executable
runner checks actual rows and groups or the expected failure rule, records
each outcome, and verifies unchanged collection paths and bytes across both
validation and query execution. Unanticipated exceptions fail the case.

`query-pilot-valid` exercises defaults versus stored presence, relationship
predicates, ordering, limiting before grouping, logical-deletion selection,
conditional conversion failure, and invalid boolean children. Its collection is
Core-only; each standalone operation supplies its own exact query-contract
version. Query execution does not add a collection extension declaration.

### Governed query consumers

`views-valid` declares Queries and Views and contains a dataset, dataset-backed
table/board views, and an embedded-query view. `views-invalid` exercises duplicate
row identities and invalid view references/columns. The executable validator
evaluates the governed queries as part of the artifacts and reports their owning
paths, categories, and rule identifiers. Dataset results are shared within one
captured model; validation and query execution remain read-only.

Unavailable model contracts and deliberately limited query evaluation prevent
full conformance. Their dependent contracts are not claimed as fully evaluated,
and unavailable interpretation is not labeled as invalid artifact content.
The authoritative contracts remain in [Datasets and Views](../../datasets-and-views.md).

As support expands, a negotiation vector's precondition can cease to apply.
The historical missing/conflicting-dependency vectors that require Views to be
unsupported are now explicitly not run by the reference adapter. Their outcomes
have not been rewritten to manufacture a passing case.

Vector names such as `core-valid` are historical labels, not capability
declarations. Until a vector is classified against the new module boundaries,
inspect its actual artifacts and required contracts rather than assuming the
name proves it is Core-only.

## Comparing reports

Validate both expected and actual report shapes before comparing them. Compare
every machine-stable field, including `specification_version`, `mode`,
`evaluation`, both extension maps, `valid`, and the result objects and their
optional context. Omitted context and an explicit value remain distinct.

Ignore only human-readable `message` values in equality comparisons. A message
still needs to satisfy the report's shape requirements. Do not ignore unexpected
findings, unknown context, duplicate findings, or an incomplete evaluation.

Object member order is not semantic; extension versions are compared as exact
strings. Results follow the canonical order defined by `CR-39`, without
locale-dependent sorting or a message-text tie-breaker. For equal canonical
sort keys, compare the complete machine-field multisets, preserving duplicate
counts.

For example, translating an error message does not fail an otherwise identical
result, but changing its `rule_id`, omitting its required extension context, or
changing `evaluation` does. A warning-only complete report is not equivalent to
an incomplete report with the same warnings.

When a vector and its cited prose rule disagree, report the conflict and correct
the mistaken source explicitly. Do not redefine conformance to match a vector
merely because that vector already exists.

## Isolation and reproducibility

Run each vector from a fresh copy. Compare the collection's file paths and bytes
before and after validation: a semantic validator does not normalize, backfill,
create caches inside the collection, or update timestamps in note frontmatter.
Keep harness results and temporary state outside the collection.

Record the source specification revision, suite revision, adapter revision,
advertised capabilities, requested scope, target mode, and actual report with
each run. Identical snapshots and evaluation contexts should reproduce the same
machine-stable report, independently of traversal order and message language.

Read-only validation does not supply missing clock- or randomness-generated
values. A future writer vector needs explicit controlled time/randomness and
expected before/after files under its writer contract; it is not a validation
vector. Cases depending on filesystem metadata likewise need that metadata
controlled by the harness rather than inherited accidentally from checkout.

## Completion evidence

A vector contributes evidence only after an actual semantic adapter has run it.
Passing JSON Schema checks or committing an expected report is not that evidence.
A conformance claim names the edition, capability set, applicable cases, and any
cases not run. The five-day implementability target in issue #123 is measured
from recorded implementation effort, not inferred from the fixture count.

## Reference evidence

The first executable adapter slice is available in the
[TypedMark tooling repository](https://github.com/DeveloPassion/TypedMark).
Its [0.1.0 evidence record](https://github.com/DeveloPassion/TypedMark/tree/main/evidence/0.1.0)
identifies the exact specification and adapter revisions, actual reports, and
read-only snapshot results. The companion
[system exercise](https://github.com/DeveloPassion/TypedMarkExample/blob/main/evidence/0.1.0.md)
records self-contained instantiation, offline validation, and missing-history
behavior.

That evidence covers every vector checked in at the recorded specification
revision. It is not a claim that the current vector inventory exercises every
normative rule; later conformance claims must continue to name their applicable
edition, capabilities, and vector set.

The negotiation matrix now includes exact support, deliberate exclusion, an
unknown extension, an unsupported exact version, missing and conflicting
standard dependencies, and undeclared Reuse. This extends issue #123's B1/E2
evidence. The standalone and dataset/view query pilots add executable B4 cases;
content-expansion query surfaces and broader optional-contract coverage remain
open.
