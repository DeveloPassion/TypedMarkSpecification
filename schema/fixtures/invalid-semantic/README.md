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
| `expansion-query-unknown-column.json` | A query expansion's `column` must resolve to exactly one projected alias; `missing` is not projected. |
| `expansion-view-unknown-column.json` | A view expansion's `column` must resolve to a projected and presented column in the saved view; `missing` does not. |
| `note-type-basename-mismatch.md` | The schema file basename must equal the file's `note_type` value (`topic` here). |
| `note-type-computed-reference-unresolved.md` | Every `computed` field reference must resolve to a sibling field declared in the same effective `frontmatter`; `nickname` does not exist. |
| `note-type-computed-unsupported-transform.md` | `computed` supports only the transforms defined by the specification version; `upper` is unknown. |
| `note-type-extends-unresolved.md` | `extends` must resolve to exactly one abstract note type under `<metadata_directory>/schemas/`; no `person` schema exists. |
| `note-type-mandatory-tags-without-tags-field.md` | A non-empty effective mandatory-tag policy requires an effective top-level `tags` field with `type: tags`. |
| `typedmark-composition-self-reference.md` | A composition source `name` must not equal the composing collection's own `name`. |
| `property-set-relationship-target-unresolved.md` | Every relationship target note type must resolve to a concrete note type in the composed collection; `ghost` does not exist. |
| `query-duplicate-column.json` | Projection aliases must be unique within one query; `identity` is declared twice. |
| `query-relationship-count-range.json` | A relationship predicate's minimum count must not exceed its maximum count. |
| `query-unknown-order-column.json` | Every ordering column must resolve to exactly one projected alias; `priority` is not projected. |
| `view-unknown-column.md` | Every presented column must resolve to exactly one alias in the saved view's query; `missing` is not projected. |
| `validation-report-qualified-rule-context-mismatch.json` | The rule's `example:review` qualification disagrees with its `example:other` context (`CR-107`); both versions are otherwise declared and evaluated. |
| `validation-report-unknown-builtin-rule.json` | `ZZZ-1` is well-formed but is not an active built-in rule (`CR-106`). |

## Extension and evaluation boundaries

The following cases also pass JSON Schema. The `example:*` contracts are
illustrative external test assumptions, not installed or registered extensions.
Their dependency graphs and core compatibility are described in each Markdown
fixture's body. The fixture command does not resolve these assumptions or infer
semantic findings; it checks that these deliberately semantic-only cases remain
shape-valid.

| Fixture | Semantic rule violated |
| --- | --- |
| `typedmark-extension-missing-dependency.md` | EXT-14: the known review contract requires the omitted exact labels dependency. |
| `typedmark-extension-conflicting-dependencies.md` | EXT-15: review and tasks require different exact labels versions. |
| `typedmark-extension-dependency-cycle.md` | EXT-15: review and labels require each other. |
| `typedmark-extension-incompatible-core.md` | EXT-20: the known contract excludes the applicable artifact's Core `0.1` line. |
| `typedmark-extension-undeclared-use.md` | EXT-16: the external collection setup uses an extension-owned review-queue artifact but omits its declaration. |
| `validation-report-extension-version-mismatch.json` | CR-100: the evaluated version differs in its build suffix from the required exact version. |
| `validation-report-extension-undeclared-evaluated.json` | CR-100: an evaluated extension does not occur in the required map. |
| `validation-report-complete-missing-extension.json` | CR-101–103: a required extension is unevaluated, so evaluation cannot be complete. |
| `validation-report-required-map-mismatch.json` | CR-99: assume the target declares `example:review: 1.2.0`; the required report map omits it. |
| `validation-report-unsupported-claimed-evaluated.json` | EXT-19/21 and CR-101–103: assume the tool supports only `example:review` at `1.2.0`, but the report falsely claims it interpreted `9.0.0`. Matching maps alone cannot prove capability. |

The golden-vector checker separately checks expected reports' map consistency
against their collection declaration, as it checks canonical ordering. That
fixture-integrity check is not an extension evaluator and does not run against
this bucket. The illustrative supported/unsupported matrix is documented in
[`../valid/README.md`](../valid/README.md).

Managed-note semantics — note-link resolution, allowed unresolved placeholder links,
relationship cardinality, canonical field materialization — are also semantic-layer
concerns: managed-note frontmatter is validated against the collection's *effective
note-type schemas*, not against these document schemas.
