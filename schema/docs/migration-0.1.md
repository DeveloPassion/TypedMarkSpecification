# Migrating to the 0.1.0 draft

This non-normative checklist records intentional compatibility changes. The
linked specification pages remain authoritative. The draft is not a released
compatibility promise; migration of real collections needs review and a backup.

| Earlier form | 0.1.0 action |
| --- | --- |
| Specification `0.0.x` | Select `0.1.0` only after reviewing the new contract; different pre-1.0 minor lines are separate compatibility lines. |
| Required full stored frontmatter | Evaluate defaults without rewriting. Ordinary edits preserve sparse storage; explicit normalization materializes declared fields. |
| `optional: true` with omitted `nullable` | Write `nullable: true`, then remove `optional`. Preserve explicit nullability, including nested fields. |
| `not_empty` on text/link/list/tags | Replace with `min: 1`, retaining a stricter existing minimum. Object `not_empty` remains supported. |
| `generated: true` | Remove the unstandardized marker; retain the stored value and keep tool-specific generation outside Core. |
| `value_from_schema: note_type` / a declared `note_type` field | Remove the field declaration. The associated concrete type supplies the Core value. |
| Non-Core types for promoted fields | Resolve manually: Core fixes the meanings of title, description, tags, IDs, state flags, and timestamps. Do not coerce existing values silently. |
| Empty-string note-link placeholder | Use null only when permitted, or supply a real link. Do not invent target names or silently drop list items. |
| `kind` | Remove descriptive kinds. Express desired cardinality with `count.min/max`; choose the intended minimum explicitly for former singleton types. |
| `archive.policy` | Omit the archive block for active-path storage, or retain alternate folder/name patterns without the policy enum. |
| Affix `required: true` | Remove the switch; every supplied affix applies. |
| Affix `required: false` | Choose one naming contract and review existing filenames. There is no automatic equivalence between two formerly valid names and one new name. |
| `{now:format}` | Reference an explicitly stored/generated date field instead. Historical dates that are not known need manual input, not inference. |
| `folder_scopes` | Author explicit concrete types/mappings or reuse declarations. The repository example migration is not a general-purpose lossless migration algorithm. |
| Required template files/full template frontmatter | Implicit templates can be derived; explicit files can supply partial or body-only overrides. Explicitly named missing files remain errors. |
| `specification_version` inside body-marker descriptors | Remove that outer field; the marker inherits its enclosing contract. Nested portable queries retain their own version. |
| Unknown artifact-structure keys | Use explicitly scoped inert `x_*` metadata or a declared extension; known structural keys remain strict. |
| Optional feature use without declaration | Declare the standard contract and exact dependency versions from Extensions and Capabilities. |
| Old validation reports | Produce actual evaluation completeness and required/evaluated maps; never manufacture `complete` by adding fields to an old report. |
| System instantiation retaining source identity | Author a new collection name, omit source publishing version/scaffold, and preserve licensing/attribution material. |

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
