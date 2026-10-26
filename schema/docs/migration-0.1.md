# Migrating to the 0.1.0 draft

This non-normative ledger records every intentional compatibility change from
the 0.0.1 contract, as `FND-14` requires for a new compatibility line. The linked
specification pages remain authoritative. The [prior 0.0.1 contract and schemas](https://github.com/DeveloPassion/TypedMarkSpecification/tree/f9955555928ab69573d5e8beb376e9e98c3813e2)
remain available at their fixed baseline revision. The draft is not a released
compatibility promise; migration of real collections needs review and a backup.

Classes:

- **Breaking, automatic**: previously valid input becomes invalid, and a
  mechanical rewrite preserves its meaning.
- **Breaking, manual**: previously valid input becomes invalid, and an author
  must choose the intended meaning; tools report rather than guess.
- **Breaking, regenerate** / **tools**: derived outputs or tool behavior change;
  no collection file needs editing.
- **Relaxing**: previously invalid input becomes valid; no migration.
- **Clarification**: an ambiguous rule is pinned; results can change where
  tools disagreed.
- **Additive**: new optional syntax; existing collections are unaffected.

## Migration actions

| Earlier form | Class | 0.1.0 action |
| --- | --- | --- |
| Specification `0.0.x` | Breaking, manual | Select `0.1.0` only after reviewing the new contract; different pre-1.0 minor lines are separate compatibility lines. |
| Required full stored frontmatter | Relaxing | Evaluate defaults without rewriting. Ordinary edits preserve sparse storage; explicit normalization materializes declared fields. |
| `optional: true` with omitted `nullable` | Breaking, automatic | Write `nullable: true`, then remove `optional`. Preserve explicit nullability, including nested fields. |
| `not_empty` on text/link/list/tags | Breaking, automatic | Replace with `min: 1`, retaining a stricter existing minimum. Object `not_empty` remains supported. |
| `generated: true` | Breaking, automatic | Remove the unstandardized marker; retain the stored value and keep tool-specific generation outside Core. |
| `value_from_schema: note_type` / a declared `note_type` field | Breaking, automatic | Remove the field declaration. The associated concrete type supplies the Core value. |
| Non-Core types for promoted fields | Breaking, manual | Resolve manually: Core fixes the meanings of title, description, tags, IDs, state flags, and timestamps. Do not coerce existing values silently. |
| Empty-string note-link placeholder | Breaking, manual | Use null only when permitted, or supply a real link. Do not invent target names or silently drop list items. |
| `kind` | Breaking, manual | Remove descriptive kinds. Express desired cardinality with `count.min/max`; choose the intended minimum explicitly for former singleton types. |
| `archive.policy` | Breaking, automatic | Omit the archive block for active-path storage, or retain alternate folder/name patterns without the policy enum. |
| Affix `required: true` | Breaking, automatic | Remove the switch; every supplied affix applies. |
| Affix `required: false` | Breaking, automatic | Replace the switch with `optional: true`; names with and without the affix stay valid (`NTS-188`). |
| Managed notes with a name affix and no stored `title` | Breaking, automatic | The effective `title` is now the name part without the affixes (`NTS-192`). To keep the former value, store `title` explicitly as the whole basename; otherwise review H1 headings and title constraints that relied on the affix. |
| `{now:format}` | Breaking, manual | Reference an explicitly stored/generated date field instead. Historical dates that are not known need manual input, not inference. |
| `folder_scopes` | Breaking, manual | Author explicit concrete types/mappings or reuse declarations. The repository example migration is not a general-purpose lossless migration algorithm. |
| Required template files/full template frontmatter | Relaxing | Implicit templates can be derived; explicit files can supply partial or body-only overrides. Explicitly named missing files remain errors. |
| `specification_version` inside body-marker descriptors | Breaking, automatic | Remove that outer field; the marker inherits its enclosing contract. Nested portable queries retain their own version. |
| Unknown artifact-structure keys | Breaking, manual | Use explicitly scoped inert `x_*` metadata or a declared extension; known structural keys remain strict. |
| Optional feature use without declaration | Breaking, automatic | Declare the standard contract and exact dependency versions from Extensions and Capabilities. |
| Old validation reports | Breaking, regenerate | Produce actual evaluation completeness and required/evaluated maps; never manufacture `complete` by adding fields to an old report. |
| Reports for malformed extension declarations | Clarification, regenerate | Regenerate against the [validation report contract](../../conformance-and-roadmap.md#validation-reports) (`CR-99`, `CR-102`); repairing the source declaration is a separate, explicit action. |
| System instantiation retaining source identity | Breaking, tools | Author a new collection name, omit source publishing version/scaffold, and preserve licensing/attribution material. |
| Histories with equal-precedence release entries, including build-only differences | Breaking, manual | Review against [Change History](../../systems-composition-evolution.md#change-history) (`SCE-99`). Resolve explicitly while preserving recorded changes; do not automatically discard entries or rewrite published versions. |
| Internal Markdown links with non-UTF-8 percent octets | Clarification, manual | Resolve the intended Unicode note target or anchor manually and encode it as UTF-8; do not replace undecodable bytes or silently drop the link. See [Note Links](../../note-links.md#link-parsing). |
| Percent-encoded Markdown anchors | Clarification | Interpret after one decoding pass: `%5Epart` is a block identifier, while `%255Epart` retains the heading text `%5Epart`. Authored source remains available; no file rewrite is implied. |
| Raw Markdown anchors with Unicode, spaces, or forbidden punctuation | Breaking, automatic | Percent-encode those characters as UTF-8 under [NL-6](../../note-links.md#link-forms); preserve valid percent triplets rather than double-encoding them. One leading `^` remains the block marker. |
| Stored fields duplicating the filename only to satisfy `note_name_pattern` | Additive | Optional: omit `note_name_pattern` for a free name, constrain it with `note_name_regex`, then drop the duplicate field. A `{title}` pattern without a stored title already accepts any basename. See [Storage Rules](../../note-type-schemas.md#storage-rules). |
| Relationship fields whose `targets` exceed their kind's declared targets, or two fields of one kind admitting the same target type | Breaking, manual | Declare the missing targets under the kind or narrow the field's `targets`; merge duplicate fields or give one a different kind. See [FDR-164](../../field-definition-reference.md#targets) and [Relationship Constraints](../../relationships-headings-and-templates.md#relationship-constraints). |
| System `typedmark.md` frontmatter or scaffold templates using YAML anchors, aliases, explicit tags (such as `!!set`), or non-string keys | Breaking, manual | Rewrite them as plain mappings, lists, and scalars. Importers reject such systems instead of changing value types (`SCE-159`, `SCE-160`). |
| URI fields containing fragments | Clarification | No migration is needed: fragments remain accepted under the clarified [URI-field grammar](../../field-definition-reference.md#format) (`FDR-140`). |

## Relaxations

No migration is needed; each item accepts input that 0.0.1 rejected.

| Change | Owner |
| --- | --- |
| Note-type `note_type`, `label`, and `icon` are optional, with deterministic defaults | [Note Type Schemas](../../note-type-schemas.md#schema-file-contract) |
| `guidance` keys are individually optional | [Note Type Schemas](../../note-type-schemas.md#schema-file-contract) |
| `scaffold.notes[].from_template` is optional; the type's template or a derived starter applies | [Systems](../../systems-composition-evolution.md) |
| Core state flags need no explicit `default_value` | [Managed Notes and Properties](../../managed-notes-and-properties.md) |
| Storage may omit `note_name_pattern` for an author-chosen free name | [Storage Rules](../../note-type-schemas.md#storage-rules) |

## Additive changes

No migration is needed; each item is new optional syntax.

| Addition | Owner |
| --- | --- |
| `extensions` declarations with exact versions, and capability-scoped `evaluation`, `required_extensions`, and `evaluated_extensions` in reports | [Extensions and Capabilities](../../extensions.md), [Conformance](../../conformance-and-roadmap.md#validation-reports) |
| Core-defined managed-note fields (`note_type`, `id`, `deleted`, `archived`, `aliases`, `tags`, `title`, `description`, `created_at`, `updated_at`) | [Managed Notes and Properties](../../managed-notes-and-properties.md) |
| New `validation_defaults` keys for the added diagnostic categories, including `inverse_mismatch` (default `warn`) | [Collection Model](../../collection-model.md) |
| Query `include_deleted` | [Portable Queries](../../queries.md) |
| `{field:name}` / `{field:folder}` storage placeholders over a parent note link | [Storage Rules](../../note-type-schemas.md#storage-rules) |
| `note_name_regex` constraining a free name | [Storage Rules](../../note-type-schemas.md#storage-rules) |
| `contains` and `depends_on` relationship kinds, acyclic `depends_on` | [Relationship Model](../../relationships-headings-and-templates.md#relationship-model) |
| `inverse` relationship fields | [Relationship Model](../../relationships-headings-and-templates.md#relationship-model) |
| Heading entries with `description`, and `capture_h2` | [Heading Rules](../../relationships-headings-and-templates.md#heading-rules) |
| Note re-typing with a `typedmark-preserved` block (optional writer contract) | [Note Re-typing](../../note-retyping.md) |
| Lifecycle `states` on fields with allowed values | [Field Definition Reference](../../field-definition-reference.md#states) |
| Automation `add_list_item`, `remove_list_item`, `set_field.only_if_empty`, `set_field.value_from`, and `when` predicates `older_than` and `state`, with `to_state` / `from_state` change predicates | [Automation Rules](../../automation-artifacts.md#automation-rules) |
| Optional name affixes (`optional: true` on `note_name_prefix` / `note_name_suffix`) | [Storage Rules](../../note-type-schemas.md#storage-rules) |
| Automation `unset_field`, and `when` predicates `empty`, `less_than`, `less_than_or_equal`, `greater_than`, and `greater_than_or_equal` | [Automation Rules](../../automation-artifacts.md#automation-rules) |
| Board swimlanes (`presentation.board.lanes`) | [Saved Views](../../datasets-and-views.md#saved-views) |
| Creation `inputs` on note-type schemas | [Creation Inputs](../../note-type-schemas.md#creation-inputs) |
| Validation-result `fix` advice | [Validation Reports](../../conformance-and-roadmap.md#validation-reports) |
| Relationship predicate `context_note` | [Portable Queries](../../queries.md#relationship-predicates) |

## Ledger discipline and verification

Every change to a governed artifact's shape or meaning adds or updates a row
here in the same commit. Completeness was checked by diffing every JSON Schema
property, enum, and required list between the 0.0.1 baseline revision above and
the current draft: each removal and newly required key maps to a breaking row,
each newly optional key to a relaxation, and each new key to an additive row.

## Behavioral notes

Core field defaults do not license arbitrary invention: explicit null remains
distinct from omission, and validation does not generate clock/random values.
Storage, headings, uniqueness, and relationship constraints use the effective
record, with stored-presence tests remaining explicit.

Deleted notes remain validated and linkable, but deleted targets no longer count
toward relationship cardinality. Queries exclude deleted rows by default and can
opt in with `include_deleted`.

Floating datetimes use the collection timezone; daylight-saving gaps and overlaps
require an explicit offset. Heading matching uses CommonMark 0.31.2 blocks and
retains inline Markdown in the compared name. Required/optional heading lists
are disjoint and independently ordered.

No automatic data migration or semantic conformance runner is implied by this
checklist. Shape fixtures demonstrate artifact syntax; actual collection
conformance needs an executable semantic adapter.
