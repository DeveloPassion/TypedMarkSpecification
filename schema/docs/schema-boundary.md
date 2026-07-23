# TypedMark Schema Boundary

The `schema/json-schema/` directory contains machine-readable JSON Schemas (draft
2020-12) for the governed TypedMark artifacts. They validate **document shape** so
that tools, editors, CI pipelines, and agents can catch authoring errors early
without re-deriving the artifact contracts from prose.

The prose specification is the single source of truth. The schemas complement it
and never override it: where a schema and the specification disagree, the
specification wins and the schema has a bug.

## Artifact map

| Governed artifact | JSON Schema |
| --- | --- |
| `typedmark.md` | `typedmark.schema.json` |
| `<metadata_directory>/schemas/<note_type>.md` | `note-type.schema.json` |
| `<metadata_directory>/property-sets/<property_set>.md` | `property-set.schema.json` |
| `<metadata_directory>/history.md` | `history.schema.json` |
| `marketplace.json` (marketplace repository root; plain JSON, not Markdown) | `marketplace.schema.json` |
| portable validation report (plain JSON output, not a collection artifact) | `validation-report.schema.json` |
| shared blocks (field definitions, storage, relationships, headings, …) | `defs.schema.json` |

Managed notes are deliberately **not** covered: their frontmatter is validated
against the collection's *effective note-type schemas*, which only exist after the
semantic layer composes property sets and inheritance. A document schema cannot
express them.

## What the schemas enforce

- required, defaultable, and allowed keys per artifact, with
  `additionalProperties: false` wherever the specification closes the key set
- scalar types, identifier grammars (`name`, slugs, field names), and enums
  (`kind`, property types, formats, severities, archive policies, history ops)
- local conditional rules: `type: list` requires `items`, `type: link`/`time`
  require a matching `format`, `const_value`/`value_from_schema` exclusivity,
  per-type constraint applicability (`not_blank`, `regex`, `min`/`max`,
  `allowed_values`, `unique`, `computed`), abstract types not declaring
  composition references, archive-policy-dependent required keys, `version`
  requiring `scaffold`, mandatory-tag declaration grammar and uniqueness,
  folder scopes declaring exactly one path matcher and at least one action,
  field operations declaring exactly one of `note_type`/`property_set`
- the core-defined field contracts for `note_type`, `id`, `deleted`,
  `archived`, and `aliases` where schemas or property sets declare them
- validation-report codes, severities, required context, and consistency between
  the top-level `valid` flag and emitted `error` results

## What stays in the semantic layer

These rules are normative but cannot (or should not) be expressed in JSON Schema:

- filesystem checks: file basename equals `note_type`/`property_set`, template
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
  `metadata_directory`, `exclude_paths`, `validation_defaults`, `abstract`,
  `template.file`, and `storage.archive.policy`
- value semantics: `default_value`/`const_value`/`allowed_values` conformance to
  the declared type, `min <= max`, regex dialect, storage placeholder resolution,
  generation-strategy value production, shared expression-language syntax,
  consumer-specific reference resolution, transform validity, null handling, and
  stored-value agreement (all tool / validator-time behaviors)
- managed-note conformance: note-type association, canonical field
  materialization, note-link syntax and resolution, allowed unresolved
  placeholder links, relationship instance counting and cardinality, heading
  rules, storage-path conformance including archived state
- system evolution: history version ordering and uniqueness, the replay
  invariant, migration impact computation, composition determinism and the
  canonical serialization
- conformance evaluation: resolving the target mode, assigning effective
  severities, producing findings, and ordering validation results

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
`validation-report-*`). Markdown fixtures are validated through their extracted
frontmatter; `.json` fixtures such as the marketplace catalog and validation
reports are validated directly.

The golden-vector check validates collection layout, governed-artifact shapes,
schema basenames, referenced template existence, report shape, and canonical
result ordering. It deliberately does not infer semantic findings; that behavior
belongs to an executable conformance runner.

## Recommended validation workflow for implementations

1. extract the governed artifact's frontmatter per the Frontmatter Block Grammar and parse it as YAML
2. validate document shape with the matching JSON Schema
3. build effective models (composition, inheritance, property sets)
4. run semantic validation against the prose rules
5. report shape failures separately from semantic failures, using the severity
   model of `validation_defaults`

## Maintenance rules

- every normative change to a governed artifact's shape MUST update the JSON
  Schemas and the fixtures in the same change
- every schema change MUST keep `bun run validate-fixtures` passing
- rules the schemas cannot express MUST be listed in this document
- schemas MUST NOT silently redefine or extend normative prose behavior
