---
title: Quick Reference
parent: TypedMark
nav_order: 13
audience: essentials
---

# Quick Reference

This page is non-normative. It maps terms and tasks to the sections that govern them.

## Glossary

| Term | Meaning | Defined in |
| --- | --- | --- |
| Collection | A rooted set of Markdown notes plus the TypedMark artifacts that structure them | [Foundations](foundations.md#collection) |
| Governed artifact | `typedmark.md`, a note-type schema, a property set, or `history.md` — Markdown files whose frontmatter is the contract | [Foundations](foundations.md#governed-artifact-format) |
| Note type | A named structural class notes are associated with; abstract or concrete | [Foundations](foundations.md#note-types) |
| Managed note | A note associated with exactly one concrete note type and governed by its schema | [Managed Notes and Properties](managed-notes-and-properties.md) |
| Untyped note | A collection note with no known note type; allowed, but unvalidated | [Foundations](foundations.md#untyped-notes) |
| Asset | A non-Markdown collection file referenced by notes | [Foundations](foundations.md#assets) |
| Property set | A named reusable bundle of `frontmatter`, `relationships`, and `headings` | [Collection Model](collection-model.md#property-set-definitions) |
| Effective note-type schema | The result of composing a concrete schema, its abstract ancestors, and property sets | [Note Type Schemas](note-type-schemas.md#effective-note-type-schema) |
| Field definition | The typed contract for one frontmatter property | [Field Definition Reference](field-definition-reference.md) |
| Canonical materialization | Every declared field physically present in stored frontmatter, `null` when empty | [Managed Notes and Properties](managed-notes-and-properties.md#canonical-field-materialization) |
| Relationship instance | A resolved note-to-note link counted against declared targets | [Relationships, Headings, and Templates](relationships-headings-and-templates.md) |
| System | A collection that declares `version` and `scaffold`, making it publishable and composable | [Systems, Composition, and Evolution](systems-composition-evolution.md) |
| Composition | Building one self-contained collection from ordered source systems | [Systems, Composition, and Evolution](systems-composition-evolution.md#system-composition) |
| Marketplace catalog | The `marketplace.json` index of known systems | [Systems, Composition, and Evolution](systems-composition-evolution.md#marketplace-catalog) |
| Vocabulary | A named, reusable value set referenced by `allowed_values_from` | [Collection Model](collection-model.md#vocabularies) |

## How do I…

| I want to… | Use | Defined in |
| --- | --- | --- |
| require a field to always hold a value | `optional: false` with `nullable: false` | [Field optionality](managed-notes-and-properties.md#field-optionality) |
| require a field only in some states | `conditions` with `require` / `require_null` | [Conditional constraints](note-type-schemas.md#conditional-field-constraints) |
| restrict a field to fixed values | `allowed_values`, or `allowed_values_from` with a vocabulary | [Field Definition Reference](field-definition-reference.md#allowed_values) |
| make link fields point at real notes | `validate_exists: true` | [Field Definition Reference](field-definition-reference.md#validate_exists) |
| restrict which note types a link targets | `targets` on the link field | [Field Definition Reference](field-definition-reference.md#targets) |
| auto-fill creation dates or ids | `generated: now`, `uuid`, `ulid`, `{sequence: …}` | [Field Definition Reference](field-definition-reference.md#generated) |
| stop a value from changing | `immutable: true` | [Field Definition Reference](field-definition-reference.md#immutable) |
| keep a value unique | `unique: true` (per type) or `unique: collection` | [Field Definition Reference](field-definition-reference.md#unique) |
| say "every meeting belongs to a project" | `relationship_kind: belongs_to` field + relationship cardinality | [Relationships](relationships-headings-and-templates.md#relationship-constraints) |
| file notes by date, quarter, or week | storage patterns with `{field:format}` or `{now:format}` | [Storage rules](note-type-schemas.md#storage-rules) |
| add an optional name suffix like " (Meeting)" | `note_name_suffix` with `required: false` | [Storage rules](note-type-schemas.md#storage-rules) |
| map notes to types by tag or folder | `note_type_mappings` with `kind: tag` or `kind: folder` | [Note-type mappings](collection-model.md#note-type-mappings) |
| share fields across many note types | property sets and `default_property_sets` | [Collection Model](collection-model.md#composing-property-sets) |
| tolerate unknown fields on one type only | per-type `unknown_field` severity | [Note Type Schemas](note-type-schemas.md#schema-file-contract) |
| require exactly one Home note | `kind: singleton` with `count: {min: 1}` | [Schema kinds](note-type-schemas.md#allowed-schema-kinds) |
| enforce the H1 matches the title | `headings.require_h1_title: true` | [Heading rules](relationships-headings-and-templates.md#heading-rules) |
| soft-delete or archive a note | core fields `deleted` / `archived` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| give a note alternative link names | core field `aliases` | [Core-defined fields](managed-notes-and-properties.md#core-defined-frontmatter-field-names) |
| publish my setup for others | declare `version` and `scaffold`; list it in a marketplace | [Systems](systems-composition-evolution.md) |
| validate artifacts in my editor or CI | the published JSON Schemas | [schema/](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema) |
