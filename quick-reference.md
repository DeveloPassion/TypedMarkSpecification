---
title: Quick Reference
parent: TypedMark
nav_order: 13
audience: essentials
---

# Quick Reference

Audience: collection authors and tool authors looking up an existing rule.

See also:

- [Foundations](foundations.md): terminology and shared baselines
- [Conformance and Roadmap](conformance-and-roadmap.md): conformance modes

This page is non-normative. It maps terms and tasks to the sections that govern them.

## Glossary

| Term | Meaning | Defined in |
| --- | --- | --- |
| Collection | A rooted set of Markdown notes plus governing artifacts | [Foundations](foundations.md#core-concepts) |
| Core Profile | The minimal authoring profile for a conforming typed collection | [Foundations](foundations.md#authoring-profiles-and-canonical-expansion) |
| Governed artifact | `typedmark.md`, a note-type schema, a property set, an automation rule, a saved view, a template, or `history.md` — Markdown files with governed frontmatter or body surfaces | [Foundations](foundations.md#governed-artifact-format) |
| Note type | A named structural class notes are associated with | [Foundations](foundations.md#core-concepts) |
| Managed note | A note associated with exactly one concrete note type and governed by its schema | [Managed Notes and Properties](managed-notes-and-properties.md) |
| Untyped note | A note outside Core managed-note validation; explicit extensions can govern other surfaces | [Foundations](foundations.md#core-concepts) |
| Asset | A non-Markdown content file | [Foundations](foundations.md#core-concepts) |
| Property set | A named reusable bundle of `frontmatter`, `relationships`, and `headings` | [Collection Model](property-sets.md#property-set-definitions) |
| Effective note-type schema | The result of composing a concrete schema, its abstract ancestors, and property sets | [Note Type Schemas](note-type-schemas.md#effective-note-type-schema) |
| Field definition | The typed contract for one frontmatter property | [Field Definition Reference](field-definition-reference.md) |
| Field conversion | A directional, typed conversion from one field definition to another | [Field compatibility and conversion](field-conversions.md#field-compatibility-and-conversion) |
| Canonical materialization | Explicit normalization of declared effective values; ordinary edits preserve sparse storage | [Managed Notes and Properties](managed-notes-and-properties.md#canonical-field-materialization) |
| Relationship instance | A resolved note-to-note link counted against declared targets | [Relationships, Headings, and Templates](relationships-headings-and-templates.md) |
| System | A collection that declares `version` and `scaffold`, making it publishable and composable | [Systems, Composition, and Evolution](systems-composition-evolution.md) |
| Composition | Building one self-contained collection from ordered source systems | [Systems, Composition, and Evolution](systems-composition-evolution.md#system-composition) |
| Marketplace catalog | The `marketplace.json` index of known systems | [Systems, Composition, and Evolution](marketplace-catalog.md#marketplace-catalog) |
| Vocabulary | A named, reusable value set referenced by `allowed_values_from` | [Collection Model](collection-model.md#vocabularies) |
| Automation rule | A declarative event or schedule trigger with an ordered, atomic action list | [Collection Model](automation-artifacts.md#automation-rules) |
| Propagation | Deterministic multi-wave automation execution that commits only at a valid fixed point | [Managed Notes and Properties](automation-runtime.md#dependency-propagation-and-consistency) |
| Portable query | A plain-JSON, read-only descriptor for filtering managed notes and projecting deterministic result rows | [Portable Queries](queries.md#portable-queries) |
| Dataset | A governed reusable query with stable row identity and a common projected column contract across note types | [Datasets](datasets-and-views.md#datasets) |
| Saved view | A governed presentation over an embedded portable query or referenced dataset, using a table, list, cards, board, tree, calendar, or timeline layout | [Saved Views](datasets-and-views.md#saved-views) |
| Template region | Marker-delimited static Markdown with a per-note baseline receipt for portable three-way drift detection | [Template Drift Tracking](template-tracking.md#template-drift-tracking) |
| Content expansion | Marker-delimited plain Markdown derived from a declared source, with automatic, manual, once, and ejectable modes | [Content Expansion](content-expansion.md#content-expansion) |

## How do I…

| I want to… | Use | Defined in |
| --- | --- | --- |
| start with the smallest conforming setup | Core configuration and one concrete schema | [Getting Started](getting-started.md) |
| require a concrete effective value | `nullable: false` | [Effective values](managed-notes-and-properties.md#stored-and-effective-values) |
| require a field only in some states | `conditions` with `require` / `require_null` | [Conditional constraints](schema-reuse.md#conditional-field-constraints) |
| restrict a field to fixed values | `allowed_values`, or `allowed_values_from` with a vocabulary | [Field Definition Reference](field-definition-reference.md#allowed_values) |
| make link fields point at real notes | `validate_exists: true` | [Field Definition Reference](field-definition-reference.md#validate_exists) |
| restrict which note types a link targets | `targets` on the link field | [Field Definition Reference](field-definition-reference.md#targets) |
| ask for priority and effort when creating a task | `inputs: [priority, effort]` | [Creation Inputs](note-type-schemas.md#creation-inputs) |
| auto-fill creation dates or ids | Core `generated: now` or `uuid`; other generators use Authoring | [Field Definition Reference](field-definition-reference.md#generated) |
| stop a value from changing | `immutable: true` | [Field Definition Reference](field-definition-reference.md#immutable) |
| keep a value unique | `unique: true` (per type) or `unique: collection` | [Field Definition Reference](field-definition-reference.md#unique) |
| say "every meeting belongs to a project" | `relationship_kind: belongs_to` field + relationship cardinality | [Relationships](relationships-headings-and-templates.md#relationship-constraints) |
| keep `related_tasks` and `related_projects` in step | `inverse` on both fields (one-sided links are `inverse_mismatch` warnings) | [Relationship Model](relationships-headings-and-templates.md#relationship-model) |
| list a project's tasks or a task's prerequisites | `relationship_kind: contains` or `depends_on` (no cycles) | [Relationship Model](relationships-headings-and-templates.md#relationship-model) |
| file notes by date, quarter, or week | `{field:format}` over a stored/effective date field | [Storage rules](note-type-schemas.md#storage-rules) |
| store a periodic note's year, quarter, month, or week from its date | `from_date: {field: date, part: GGGG}` | [Expressions](expressions.md#from_date) |
| link a periodic note to its week or month note | `from_date` or `computed` name + `self_field` expansion | [Expressions](expressions.md#links-to-enclosing-periods) |
| keep companion notes beside their parent (`Projects/Launch/Decisions.md`) | `{project:folder}/{project:name}` over a single note-link field | [Storage rules](note-type-schemas.md#storage-rules) |
| add a required name suffix | `note_name_suffix.pattern` | [Storage rules](note-type-schemas.md#storage-rules) |
| accept names with or without a decorative suffix, titled without it | `note_name_suffix: {pattern: " (Permanent)", optional: true}` | [Storage rules](note-type-schemas.md#storage-rules) |
| let authors choose note names, optionally by shape | omit `note_name_pattern`; add `note_name_regex`, e.g. `"^[a-z0-9]+(?:[.-][a-z0-9]+)*$"` for `net.proto.bgp` | [Storage rules](note-type-schemas.md#storage-rules) |
| map notes to types by tag or folder | `note_type_mappings` with `kind: tag` or `kind: folder` | [Note-type mappings](collection-model.md#note-type-mappings) |
| require tags collection-wide or by note type | `mandatory_tags` in the collection or schema | [Mandatory tags](collection-model.md#mandatory-tags) |
| say which status values mean done | `states` on the status field, e.g. `completed: {done: true, outcome: success}` | [Field Definition Reference](field-definition-reference.md#states) |
| turn a note into another type without losing data | re-typing with a `typedmark-preserved` block | [Note Re-typing](note-retyping.md) |
| rename or move a note without breaking links, or edit without reformatting | a writer claiming the Edits and Renames contract | [Edits and Renames](edits-and-renames.md) |
| stamp the date work becomes done | `set_field` with `value_from: trigger_date` and `only_if_empty: true` | [Automation rules](automation-artifacts.md#automation-rules) |
| react when work becomes done | `trigger.changed.status.to_state: {done: true}` or `when: {status: {state: {done: true}}}` | [Automation rules](automation-artifacts.md#automation-rules) |
| archive notes some time after they finish | a daily schedule with `when: {status: {state: {done: true}}, completed_on: {older_than: P30D}}` and `archive_note` | [Automation rules](automation-artifacts.md#automation-rules) |
| remove a value so the field falls back to its default | `unset_field` | [Automation rules](automation-artifacts.md#automation-rules) |
| act only when a field is empty or past a threshold | `when: {due: {empty: true}}` or `when: {progress: {greater_than: 50}}` | [Automation rules](automation-artifacts.md#automation-rules) |
| target notes whose field is empty, or above or below a bound | `when: {lent_to: {empty: true}}`, `when: {copies: {greater_than: 1}}` | [Automation rules](automation-artifacts.md#automation-rules) |
| react to note changes or a schedule | an automation artifact under `<metadata_directory>/automations/` | [Automation rules](automation-artifacts.md#automation-rules) |
| let automation changes trigger further rules safely | propagation mode with `automation_defaults.max_propagation_waves` | [Dependency propagation](automation-runtime.md#dependency-propagation-and-consistency) |
| select, filter, sort, group, or limit managed notes portably | a portable query descriptor with `where`, `select`, `order_by`, `group_by`, and `limit` | [Portable Queries](queries.md#portable-queries) |
| reuse one multi-type result in several presentations | a dataset artifact under `<metadata_directory>/datasets/` and saved views that reference it | [Datasets](datasets-and-views.md#datasets) |
| save and share a table, list, cards, board, tree, calendar, or timeline view | a saved-view artifact under `<metadata_directory>/views/` | [Saved Views](datasets-and-views.md#saved-views) |
| split a board into swimlanes (per project, area, or type) | `presentation.board.lanes.column` | [Saved Views](datasets-and-views.md#saved-views) |
| move cards between columns and order them by hand | `presentation.board.writable: true` and `rank: manual_order` | [Saved Views](datasets-and-views.md#saved-views) |
| show tasks under their parent tasks and projects (work breakdown) | `layout: tree` with `tree.parent` (a link or a list of links), `context: ancestors`, `writable: true` | [Saved Views](datasets-and-views.md#saved-views) |
| see tasks on their scheduled and due days, or as spans on a plan | `layout: calendar` with `calendar.dates`, or `layout: timeline` with `start`/`end` | [Saved Views](datasets-and-views.md#saved-views) |
| list the open checklist items of many notes | a query with `rows: items` and an `item` predicate on `checked` | [Task Items](items.md) |
| roll estimates and progress up a work breakdown | `tree.rollups` with `sum` and `weighted_mean` (`weight`, `done_value`) | [Saved Views](datasets-and-views.md#saved-views) |
| show only this project's tasks with one shared dataset | a relationship predicate with `context_note: true` | [Portable Queries](queries.md#relationship-predicates) |
| build a readable Markdown dashboard from datasets or saved views | one or more dataset- or view-backed content expansions in an ordinary note | [Content Expansion](content-expansion.md#content-expansion) |
| detect and reconcile static template changes without overwriting note edits | `typedmark:template-region` markers plus `template_regions` baseline receipts | [Template Drift Tracking](template-tracking.md#template-drift-tracking) |
| keep a Markdown region synchronized with a field, relationship, or query result | a `typedmark:expansion` marker with `mode: auto` or `manual` | [Content Expansion](content-expansion.md#content-expansion) |
| share fields across many note types | property sets and `default_property_sets` | [Collection Model](property-sets.md#composing-property-sets) |
| combine differently typed fields safely | field compatibility and conversion rules | [Field compatibility and conversion](field-conversions.md#field-compatibility-and-conversion) |
| replace old folder-scoped structure | explicitly authored concrete types and mappings | [Collection Model](collection-model.md#folder-scopes) |
| tolerate unknown fields on one type only | per-type `unknown_field` severity | [Note Type Schemas](note-type-schemas.md#schema-file-contract) |
| require exactly one Home note | `count: {min: 1, max: 1}` and fixed storage | [Counts](note-type-schemas.md#allowed-schema-kinds) |
| explain sections and route quick captures | heading entries `{text, description}` and `headings.capture_h2` | [Heading rules](relationships-headings-and-templates.md#heading-rules) |
| enforce the H1 matches the title | `headings.require_h1_title: true` | [Heading rules](relationships-headings-and-templates.md#heading-rules) |
| soft-delete or archive a note | core fields `deleted` / `archived` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| give a note alternative link names | core field `aliases` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| publish my setup for others | declare `version` and `scaffold`; list it in a marketplace | [Systems](systems-composition-evolution.md) |
| let an agent repair a finding safely | a result's `fix` action | [Validation Reports](conformance-and-roadmap.md#validation-reports) |
| give an agent a note type's resolved fields and where they come from | a `typedmark:effective-schema` export | [Effective Schema Export](effective-schema.md) |
| validate artifacts in my editor or CI | the published JSON Schemas | [schema/](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema) |
