# TypedMark Schema Boundary

The `schema/json-schema/` directory contains machine-readable JSON Schemas (draft
2020-12) for the governed TypedMark artifacts. They validate **document shape** so
that tools, editors, CI pipelines, and agents can catch authoring errors early
without re-deriving the artifact contracts from prose.

The prose specification is the single source of truth. The schemas complement it
and never override it: where a schema and the specification disagree, the
specification wins and the schema has a bug.

## Artifact map

| Contract surface | JSON Schema |
| --- | --- |
| `typedmark.md` | `typedmark.schema.json` |
| `<metadata_directory>/schemas/<note_type>.md` | `note-type.schema.json` |
| `<metadata_directory>/property-sets/<property_set>.md` | `property-set.schema.json` |
| `<metadata_directory>/automations/<automation>.md` | `automation.schema.json` |
| `<metadata_directory>/datasets/<dataset>.md` | `dataset.schema.json` |
| `<metadata_directory>/views/<view>.md` | `view.schema.json` |
| `<metadata_directory>/history.md` | `history.schema.json` |
| `marketplace.json` (marketplace repository root; plain JSON, not Markdown) | `marketplace.schema.json` |
| portable validation report (plain JSON output, not a collection artifact) | `validation-report.schema.json` |
| portable automation event (plain JSON runtime interchange) | `automation-event.schema.json` |
| portable automation run report (plain JSON runtime interchange) | `automation-run-report.schema.json` |
| portable query descriptor (plain JSON runtime interchange or embedded descriptor) | `query.schema.json` |
| content-expansion descriptor (JSON inside a Markdown start marker) | `expansion.schema.json` |
| template-region descriptor (JSON inside a Markdown start marker) | `template-region.schema.json` |
| `template_regions` managed-note receipt value | `template-tracking.schema.json` |
| shared blocks (field definitions, storage, relationships, headings, …) | `defs.schema.json` |

Managed notes as complete documents are deliberately **not** covered: their frontmatter is validated
against the collection's *effective note-type schemas*, which only exist after the
semantic layer composes property sets and inheritance. A document schema cannot
express them. Independently parseable content-expansion and template-region
descriptors are covered by their descriptor schemas, and the core-defined
`template_regions` value is covered separately by `template-tracking.schema.json`.

## What the schemas enforce

- required, defaultable, and allowed keys per artifact, with
  `additionalProperties: false` wherever the specification closes the key set
- scalar types, identifier grammars (`name`, slugs, field names), and enums
  (`kind`, property types, formats, severities, archive policies, history ops)
- optional collection `extensions` declarations and report extension maps:
  namespaced identifier keys and exact complete SemVer string values, including
  prerelease and build suffixes; empty maps are accepted, ranges and whitespace
  in extension versions are not
- inert `x_*` metadata only at the top level of collection configurations,
  note-type schemas, property sets, automations, datasets, saved views, and
  history frontmatter; existing field constraints and closed structural blocks
  remain unchanged; extension identifiers and metadata keys use explicit
  end-of-input assertions so line terminators cannot trail a valid name
- local conditional rules: `type: list` requires `items`, `type: link`/`time`
  require a matching `format`, `const_value`/`value_from_schema` exclusivity,
  per-type constraint applicability (`not_blank`, `regex`, `min`/`max`,
  `allowed_values`, `unique`, `computed`), abstract types not declaring
  composition references, archive-policy-dependent required keys, `version`
  requiring `scaffold`, mandatory-tag declaration grammar and uniqueness,
  folder scopes declaring exactly one path matcher and at least one action,
  field operations declaring exactly one of `note_type`/`property_set`,
  automation trigger and action variants, event snapshot and body-change
  combinations, causal producer variants, and automation run-report
  status/diagnostic combinations
- content-expansion descriptor keys, source variants, sync modes, persisted
  state, current-time restrictions, and render-block shape
- portable-query descriptor keys; recursive boolean, path, field, and
  relationship predicate variants; direct and mapped projection variants;
  mapped source shapes; ordering, grouping, count-range, and limit shapes
- dataset keys, nested query shape, row-identity grammar, and saved-view keys,
  embedded-query or dataset-reference exclusivity, presented-field entries,
  layout families, and board-layout configuration
- template-region descriptor keys and identifier grammar, plus baseline and
  detached receipt variants in a managed note's `template_regions` value
- the core-defined field contracts for `note_type`, `id`, `deleted`,
  `archived`, and `aliases` where schemas or property sets declare them;
  `template_regions` is runtime tracking state and cannot be schema-declared
- validation-report codes, severities, required extension context for
  `unsupported_extension`, and required `evaluation`, `required_extensions`,
  and `evaluated_extensions` fields; `valid` is true exactly when evaluation is
  complete and there are no emitted `error` results

## What stays in the semantic layer

These rules are normative but cannot (or should not) be expressed in JSON Schema:

- filesystem checks: file basename equals `note_type`/`property_set`/`automation`/`dataset`/`view`, template
  files exist under `<metadata_directory>/templates/`, artifact locations derive
  from `metadata_directory`
- cross-file resolution: `extends` chains and cycle detection, property-set
  references, `exclude_property_sets` membership in `default_property_sets` or
  `folder_scopes`,
  `frontmatter_remove` targeting inherited fields, relationship and field `targets` resolving
  to note types, composition source resolution
- effective-schema computation: folder-scope matching, the evaluation pipeline,
  block merge rules, and the required effective keys for concrete note types
- mandatory-tag semantics: collection/folder/note-type merge order, exact
  duplicate removal, compatibility with the effective `tags` field, template
  obligations, managed-note membership, and append-only materialization
- canonical expansion: applying effective defaults for omitted
  `metadata_directory`, `exclude_paths`, `validation_defaults`,
  `automation_defaults`, `abstract`, `template.file`, and
  `storage.archive.policy`
- value semantics: `default_value`/`const_value`/`allowed_values` conformance to
  the declared type, `min <= max`, regex dialect, storage placeholder resolution,
  generation-strategy value production, shared expression-language syntax,
  consumer-specific reference resolution, transform validity, null handling, and
  stored-value agreement (all tool / validator-time behaviors)
- managed-note conformance: note-type association, canonical field
  materialization, note-link syntax and resolution, allowed unresolved
  placeholder links, relationship instance counting and cardinality, heading
  rules, storage-path conformance including archived state
- field compatibility and conversion: directional type-pair classification,
  conditional-value qualification, target-constraint evaluation, finite-set
  compatibility, and safe write-back eligibility
- content-expansion semantics: marker parsing and pairing, source resolution and
  scalar conversion, relationship, query, dataset, and saved-view evaluation, shared-expression evaluation,
  embedded-query version and column agreement, rendered-region equality,
  template materialization, drift, and ejection
- portable-query semantics: note-type and abstract-descendant resolution,
  effective-field compatibility, typed comparisons, relationship traversal,
  projection-alias uniqueness and resolution, mapped-source overlap, declared
  conversion-class agreement, target compatibility, count-range consistency,
  compatible ordering domains, deterministic row order, grouping, and limiting
- dataset semantics: query-version agreement, projection-contract resolution,
  row-identity validity and uniqueness, source-backed/read-only classification,
  reference resolution, and schema-evolution compatibility
- saved-view semantics: query or dataset version agreement, projection-reference resolution,
  visible-field uniqueness, layout interpretation, explicit board-column equality,
  fallback-column placement, schema-evolution compatibility, and Bases conversion
  loss diagnostics
- template-region semantics: marker parsing and pairing, nesting boundaries,
  marker-to-receipt correspondence, region extraction, digest calculation,
  enrollment, three-way drift classification, reconciliation, and detachment
- system evolution: history version ordering and uniqueness, inventory replay
  across note types, property sets, automations, fields, datasets, and saved views;
  migration impact computation; composition determinism; and canonical
  serialization
- automation semantics: artifact basenames and reference resolution, schedule
  due-instant evaluation, event matching, action target compatibility,
  capability negotiation, staged execution, and propagation termination
- specification-version support: artifact-local version selection, template
  version inheritance, and tool support for the compatibility lines defined in
  [Foundations](https://developassion.github.io/TypedMarkSpecification/foundations.html#specification-versioning); a shape-valid
  version string does not establish that a tool implements that version
- extension semantics: namespace ownership, supported exact contracts and their
  applicable core compatibility lines, dependency resolution including omitted
  transitive dependencies, exact-version conflicts and cycles, and required
  declarations for extension-owned constructs; accepting a declaration's shape
  does not select or evaluate a contract
- vendor-metadata semantics: inertness, preservation on rewrite/composition,
  and reporting conflicts when composing different values at the same key;
  neither managed-note frontmatter nor template starter frontmatter receives
  a general `x_*` exemption from effective-schema validation
- report coverage: required-map agreement with the collection, exact evaluated
  subset membership (including prerelease/build suffixes), complete coverage
  of required extensions, and truthful claims about which core and extension
  contracts were actually interpreted; standard JSON Schema cannot compare
  these dynamic property maps or observe tool capabilities
- report rule ownership: a well-formed built-in identifier still needs to name
  an active rule, and a qualified extension rule needs matching extension
  context and an actually evaluated required contract; report shape permits
  qualified third-party IDs without assigning them a repository-global prefix
- conformance evaluation: resolving the target mode, assigning effective
  severities (including fixed structural-key error severity), producing findings,
  and ordering validation results

The extension declaration shape, metadata scope, and capability rules are
authoritative in [Extensions and Capabilities](https://developassion.github.io/TypedMarkSpecification/extensions.html); report
coverage and completeness are authoritative in
[Validation Reports](https://developassion.github.io/TypedMarkSpecification/conformance-and-roadmap.html#validation-reports).
Unknown structural keys remain schema failures under implemented contracts.
If a tool lacks a required extension contract, a bare Core schema's rejection
of a potentially extension-owned key is not evidence that the construct is
invalid. Such a tool reports incomplete evaluation while still checking known,
independent Core constraints. These schemas are not an extension loader.

## Fixtures

`schema/fixtures/` contains three artifact buckets and one end-to-end suite:

- `valid/` — artifacts that MUST pass their schema
- `invalid-shape/` — artifacts that MUST fail their schema; each file's body
  names the violated rule
- `invalid-semantic/` — artifacts that MUST pass their schema but are invalid
  under the semantic layer; see the README in that folder
- `golden/` — self-contained collection trees paired with expected portable
  validation reports for implementers; see the README in that folder

Run the expectations with:

```bash
bun run validate-fixtures
```

Fixtures are mapped to artifact schemas by filename prefix (`typedmark-*`,
`note-type-*`, `property-set-*`, `history*`, `marketplace*`,
`validation-report-*`, `automation-*`, `automation-event-*`, and
`automation-run-report-*`, `expansion-*`, `template-region-*`, and
`template-tracking-*`, `query-*`, `dataset-*`, and `view-*`). Markdown fixtures are validated through their extracted
frontmatter; `.json` fixtures such as marker descriptors, tracking receipts, the
marketplace catalog, and validation reports are validated directly.

The golden-vector check validates collection layout, governed-artifact shapes,
schema, automation, dataset, and view basenames, referenced template existence,
report shape, and canonical result ordering (including the final `extension`
component). It also checks the expected report's required map against the
collection's declaration, exact evaluated-map subset membership, and coverage
of every required extension for complete reports. These are fixture-integrity
checks, not evidence of actual contract interpretation. Incomplete reports may
have no missing extension entries because core interpretation can also be
incomplete. The checker deliberately does not infer semantic findings;
that behavior belongs to an executable conformance runner.

The extension capability matrix in [`fixtures/valid/README.md`](../fixtures/valid/README.md)
and the semantic-only cases in
[`fixtures/invalid-semantic/README.md`](../fixtures/invalid-semantic/README.md)
use illustrative external contract assumptions. They do not claim an executable
extension-aware conformance runner exists.

The non-normative
[Conformance Runner Guide](https://developassion.github.io/TypedMarkSpecification/conformance-runner.html)
describes a proposed implementation architecture beyond these shape checks.

### Specification example annotations

The same command checks fenced `yaml`, `yml`, `json`, `markdown`, and `md`
examples in the root specification pages. Each has a preceding HTML comment
classifying its validation scope; missing, malformed, unknown, and orphaned
classifications fail the check. Backtick and tilde fences, including longer
fences containing shorter ones, are recognized by the existing Markdown lexer.
Diagnostics include the source page and opening fence line.

- `<!-- typedmark-example: artifact=typedmark -->` selects the full artifact
  schema explicitly, independently of keys present in the example. The target
  is a name in `ARTIFACT_SCHEMAS` in `schema/validate-fixtures.ts`, including
  standalone descriptors and reports. YAML and JSON are parsed directly;
  Markdown examples have their governed frontmatter extracted. Parse failures,
  missing identification fields, and missing versions are errors, not skips.
- `<!-- typedmark-example: fragment: Individual field declaration. -->`
  marks an intentional partial YAML or JSON example. A non-empty reason explains
  the scope. Fragments are syntax-checked, but not counted as full schema checks.
- `<!-- typedmark-example: body: Managed-note template. -->` marks a Markdown
  body, managed note, or template rather than a governed frontmatter artifact.
  A non-empty reason is required. These examples are not artifact-schema checks;
  managed-note conformance, embedded marker semantics, and template content are
  outside this check.

These non-rendered comments are repository authoring metadata, not a new
TypedMark artifact format or normative contract. The command's fixture total
counts full artifact examples, not fragments or body examples.

## Recommended validation workflow for implementations

1. extract the governed artifact's frontmatter per the Frontmatter Block Grammar and parse it as YAML
2. select supported artifact-local core and required extension contracts, then
   validate document shape with the applicable schemas; do not misclassify
   potentially extension-owned structure solely because a required contract is
   unsupported
3. build effective models (composition, inheritance, property sets)
4. run semantic validation against the prose rules
5. report shape failures separately from semantic failures, using the effective
   severity rules and recording evaluation completeness independently of
   diagnostic severity or suppression

## Maintenance rules

- every normative change to a governed artifact's shape MUST update the JSON
  Schemas and the fixtures in the same change
- every schema change MUST keep `bun run validate-fixtures` passing
- rules the schemas cannot express MUST be listed in this document
- schemas MUST NOT silently redefine or extend normative prose behavior
