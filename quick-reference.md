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
| Saved view | A governed presentation over an embedded portable query or referenced dataset, using a table, list, cards, or board layout | [Saved Views](datasets-and-views.md#saved-views) |
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
| auto-fill creation dates or ids | Core `generated: now` or `uuid`; other generators use Authoring | [Field Definition Reference](field-definition-reference.md#generated) |
| stop a value from changing | `immutable: true` | [Field Definition Reference](field-definition-reference.md#immutable) |
| keep a value unique | `unique: true` (per type) or `unique: collection` | [Field Definition Reference](field-definition-reference.md#unique) |
| say "every meeting belongs to a project" | `relationship_kind: belongs_to` field + relationship cardinality | [Relationships](relationships-headings-and-templates.md#relationship-constraints) |
| file notes by date, quarter, or week | `{field:format}` over a stored/effective date field | [Storage rules](note-type-schemas.md#storage-rules) |
| add a required name suffix | `note_name_suffix.pattern` | [Storage rules](note-type-schemas.md#storage-rules) |
| map notes to types by tag or folder | `note_type_mappings` with `kind: tag` or `kind: folder` | [Note-type mappings](collection-model.md#note-type-mappings) |
| require tags collection-wide or by note type | `mandatory_tags` in the collection or schema | [Mandatory tags](collection-model.md#mandatory-tags) |
| react to note changes or a schedule | an automation artifact under `<metadata_directory>/automations/` | [Automation rules](automation-artifacts.md#automation-rules) |
| let automation changes trigger further rules safely | propagation mode with `automation_defaults.max_propagation_waves` | [Dependency propagation](automation-runtime.md#dependency-propagation-and-consistency) |
| select, filter, sort, group, or limit managed notes portably | a portable query descriptor with `where`, `select`, `order_by`, `group_by`, and `limit` | [Portable Queries](queries.md#portable-queries) |
| reuse one multi-type result in several presentations | a dataset artifact under `<metadata_directory>/datasets/` and saved views that reference it | [Datasets](datasets-and-views.md#datasets) |
| save and share a table, list, cards, or board view | a saved-view artifact under `<metadata_directory>/views/` | [Saved Views](datasets-and-views.md#saved-views) |
| build a readable Markdown dashboard from datasets or saved views | one or more dataset- or view-backed content expansions in an ordinary note | [Content Expansion](content-expansion.md#content-expansion) |
| detect and reconcile static template changes without overwriting note edits | `typedmark:template-region` markers plus `template_regions` baseline receipts | [Template Drift Tracking](template-tracking.md#template-drift-tracking) |
| keep a Markdown region synchronized with a field, relationship, or query result | a `typedmark:expansion` marker with `mode: auto` or `manual` | [Content Expansion](content-expansion.md#content-expansion) |
| share fields across many note types | property sets and `default_property_sets` | [Collection Model](property-sets.md#composing-property-sets) |
| combine differently typed fields safely | field compatibility and conversion rules | [Field compatibility and conversion](field-conversions.md#field-compatibility-and-conversion) |
| replace old folder-scoped structure | explicitly authored concrete types and mappings | [Collection Model](collection-model.md#folder-scopes) |
| tolerate unknown fields on one type only | per-type `unknown_field` severity | [Note Type Schemas](note-type-schemas.md#schema-file-contract) |
| require exactly one Home note | `count: {min: 1, max: 1}` and fixed storage | [Counts](note-type-schemas.md#allowed-schema-kinds) |
| enforce the H1 matches the title | `headings.require_h1_title: true` | [Heading rules](relationships-headings-and-templates.md#heading-rules) |
| soft-delete or archive a note | core fields `deleted` / `archived` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| give a note alternative link names | core field `aliases` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| publish my setup for others | declare `version` and `scaffold`; list it in a marketplace | [Systems](systems-composition-evolution.md) |
| validate artifacts in my editor or CI | the published JSON Schemas | [schema/](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema) |
