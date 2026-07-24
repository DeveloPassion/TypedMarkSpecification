# Semantic-only failures

Every fixture in this folder **passes** JSON Schema validation: its document shape is
correct. Each one is nevertheless invalid under the prose specification, because it
violates a rule that lives in the semantic layer — cross-file resolution, filesystem
checks, or effective-schema evaluation. See `schema/docs/schema-boundary.md` for the
full boundary.

| Fixture | Semantic rule violated |
| --- | --- |
| `automation-set-field-unresolved.md` | Every automation field reference must resolve for every target on which the action can execute; `missing_field` is undeclared. |
| `expansion-note-field-unresolved.json` | A materialized `note_field` expansion source must resolve its note link to exactly one managed note. |
| `expansion-relationship-target-unresolved.json` | Every `target_note_types` filter entry must resolve to exactly one concrete or abstract note type; `ghost` does not. |
| `expansion-unknown-render-reference.json` | Expansion rendering exposes only the shared-expression reference name `value`; `title` is unknown. |
| `note-type-basename-mismatch.md` | The schema file basename must equal the file's `note_type` value (`topic` here). |
| `note-type-computed-reference-unresolved.md` | Every `computed` field reference must resolve to a sibling field declared in the same effective `frontmatter`; `nickname` does not exist. |
| `note-type-computed-unsupported-transform.md` | `computed` supports only the transforms defined by the specification version; `upper` is unknown. |
| `note-type-extends-unresolved.md` | `extends` must resolve to exactly one abstract note type under `<metadata_directory>/schemas/`; no `person` schema exists. |
| `note-type-mandatory-tags-without-tags-field.md` | A non-empty effective mandatory-tag policy requires an effective top-level `tags` field with `type: tags`. |
| `typedmark-composition-self-reference.md` | A composition source `name` must not equal the composing collection's own `name`. |
| `property-set-relationship-target-unresolved.md` | Every relationship target note type must resolve to a concrete note type in the composed collection; `ghost` does not exist. |

Managed-note semantics — note-link resolution, allowed unresolved placeholder links,
relationship cardinality, canonical field materialization — are also semantic-layer
concerns: managed-note frontmatter is validated against the collection's *effective
note-type schemas*, not against these document schemas.
