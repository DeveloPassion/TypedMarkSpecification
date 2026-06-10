# Semantic-only failures

Every fixture in this folder **passes** JSON Schema validation: its document shape is
correct. Each one is nevertheless invalid under the prose specification, because it
violates a rule that lives in the semantic layer — cross-file resolution, filesystem
checks, or effective-schema evaluation. See `schema/docs/schema-boundary.md` for the
full boundary.

| Fixture | Semantic rule violated |
| --- | --- |
| `note-type-basename-mismatch.md` | The schema file basename must equal the file's `note_type` value (`topic` here). |
| `note-type-extends-unresolved.md` | `extends` must resolve to exactly one abstract note type under `<metadata_directory>/schemas/`; no `person` schema exists. |
| `typedmark-composition-self-reference.md` | A composition source `name` must not equal the composing collection's own `name`. |
| `property-set-relationship-target-unresolved.md` | Every relationship target note type must resolve to a concrete note type in the composed collection; `ghost` does not exist. |

Managed-note semantics — note-link resolution, allowed unresolved placeholder links,
relationship cardinality, canonical field materialization — are also semantic-layer
concerns: managed-note frontmatter is validated against the collection's *effective
note-type schemas*, not against these document schemas.
