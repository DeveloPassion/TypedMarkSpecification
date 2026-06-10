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
| shared blocks (field definitions, storage, relationships, headings, …) | `defs.schema.json` |

Managed notes are deliberately **not** covered: their frontmatter is validated
against the collection's *effective note-type schemas*, which only exist after the
semantic layer composes property sets and inheritance. A document schema cannot
express them.

## What the schemas enforce

- required and allowed keys per artifact, with `additionalProperties: false`
  wherever the specification closes the key set
- scalar types, identifier grammars (`name`, slugs, field names), and enums
  (`kind`, property types, formats, severities, archive policies, history ops)
- local conditional rules: `type: list` requires `items`, `type: link`/`time`
  require a matching `format`, `const_value`/`value_from_schema` exclusivity,
  per-type constraint applicability (`not_blank`, `regex`, `min`/`max`,
  `allowed_values`, `unique`), abstract types not declaring composition
  references, archive-policy-dependent required keys, `version` requiring
  `scaffold`, field operations declaring exactly one of `note_type`/`property_set`
- the core-defined field contracts for `note_type`, `id`, `deleted`, and
  `archived` where schemas or property sets declare them

## What stays in the semantic layer

These rules are normative but cannot (or should not) be expressed in JSON Schema:

- filesystem checks: file basename equals `note_type`/`property_set`, template
  files exist under `<metadata_directory>/templates/`, artifact locations derive
  from `metadata_directory`
- cross-file resolution: `extends` chains and cycle detection, property-set
  references, `exclude_property_sets` membership in `default_property_sets`,
  `frontmatter_remove` targeting inherited fields, relationship targets resolving
  to concrete note types, composition source resolution
- effective-schema computation: the evaluation pipeline, block merge rules, and
  the required effective keys for concrete note types
- value semantics: `default_value`/`const_value`/`allowed_values` conformance to
  the declared type, `min <= max`, regex dialect, storage placeholder resolution
- managed-note conformance: note-type association, canonical field
  materialization, note-link syntax and resolution, allowed unresolved
  placeholder links, relationship instance counting and cardinality, heading
  rules, storage-path conformance including archived state
- system evolution: history version ordering and uniqueness, the replay
  invariant, migration impact computation, composition determinism and the
  canonical serialization
- conformance modes: valid system definition and valid instantiated collection

## Fixtures

`schema/fixtures/` contains three buckets:

- `valid/` — artifacts that MUST pass their schema
- `invalid-shape/` — artifacts that MUST fail their schema; each file's leading
  comment names the violated rule
- `invalid-semantic/` — artifacts that MUST pass their schema but are invalid
  under the semantic layer; see the README in that folder

Run the expectations with:

```bash
python3 schema/validate_fixtures.py
```

Fixtures are mapped to artifact schemas by filename prefix (`typedmark-*`,
`note-type-*`, `property-set-*`, `history*`).

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
- every schema change MUST keep `python3 schema/validate_fixtures.py` passing
- rules the schemas cannot express MUST be listed in this document
- schemas MUST NOT silently redefine or extend normative prose behavior
