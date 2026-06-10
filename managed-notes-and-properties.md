---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 6
audience: essentials
---

# Managed Notes and Properties

Audience: collection authors.

Authoritative for:

- the managed note contract and note-type association
- field names and the core-defined fields: `note_type`, `id`, `deleted`, `archived`, and `aliases`
- canonical field materialization and field optionality

See also:

- [Field Definition Reference](field-definition-reference.md): property types and field-definition properties
- [Note Links](note-links.md): note-link syntax, resolution, and body extraction
- [Migration Effects](migration-effects.md): what migration operations do to managed notes
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationship cardinality, headings, and templates

## Notes in a Collection

TypedMark distinguishes between collection notes in general and managed notes specifically.

Rules:

- `MN-1` A collection note is a Markdown note that belongs to the collection as content rather than as a TypedMark artifact.
- `MN-2` A managed note is a collection note that is associated with exactly one known note type under this specification version's note-type association rules.
- `MN-3` The ordered note-type mapping rules are defined in [Collection Model](collection-model.md).
- `MN-4` The first matching note-type mapping rule determines the note's candidate note type.
- `MN-5` A collection note is managed only when the candidate note type from the winning mapping rule resolves to exactly one known concrete schema.
- `MN-6` A collection note is untyped when no mapping rule matches or when the winning mapping rule does not resolve to exactly one known concrete schema.
- `MN-7` Untyped notes MAY exist in a collection.
- `MN-8` Untyped notes are outside the managed-note contract on this page and are not validated against note-type storage, relationship, heading, or frontmatter field-definition rules.
- `MN-9` Rules on this page apply only to managed notes unless a rule explicitly says otherwise.

## Managed Note Contract

Every managed note MUST:

- be a Markdown file
- contain YAML frontmatter
- use YAML frontmatter as the note's metadata
- resolve to exactly one known concrete note type under the configured note-type mapping rules
- satisfy exactly one effective note-type schema as defined in [Note Type Schemas](note-type-schemas.md)
- satisfy the field and materialization rules defined in this page
- satisfy the storage, relationship, and heading rules linked from its resolved note type

Common frontmatter shape:

```yaml
note_type: topic
title: Note Taking
description: ""
domain: ""
sources:
  - "[Introduction to Note Taking](Sources/Introduction%20to%20Note%20Taking.md)"
summary: ""
status: active
```

This remains a common stored shape, especially when a collection uses explicit frontmatter mapping or chooses to materialize the resolved note type in frontmatter.

Rules:

- `MN-10` `note_type`, when stored, defines the explicit note type value of the note.
- `MN-11` If stored, `note_type` MUST equal the schema identifier defined by the matching concrete schema file.
- `MN-12` `note_type` MAY be omitted when the configured note-type mapping rules resolve the note type from another surface.
- `MN-13` `id` MAY be omitted.
- `MN-14` A managed note MAY declare `id` when its schema includes an `id` field definition.
- `MN-15` If a managed note declares `id`, its `id` MUST be stable across renames and moves.
- `MN-16` `title` is human-facing and MAY change unless its field definition declares `immutable: true`.
- `MN-17` Display-oriented fields such as `title` and `description` are human-facing note metadata and MAY differ from the note's file name and storage path unless a schema rule explicitly couples them.
- `MN-18` A conforming managed note MUST remain usable as a normal Markdown note without preprocessing, transpilation, or note-local sidecar metadata.
- `MN-19` Managed-note conformance uses the effective note-type schema after default property sets, abstract-ancestor application, composed property sets, and local concrete schema definitions have been applied.
- `MN-20` The meanings of `relationship_kind`, `belongs_to`, and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `MN-21` Managed note frontmatter MUST follow the canonical field materialization rules defined on this page.

### Frontmatter Block Grammar

Rules:

- `MN-22` A note's frontmatter block is recognized under the Frontmatter Block Grammar defined in [Foundations](foundations.md).
- `MN-23` A note whose frontmatter block content parses as a non-mapping YAML document has no valid frontmatter and cannot satisfy the managed note contract.

### Field Names

A managed-note frontmatter field name is the YAML key under which a field definition stores its value. The same field-name rules apply wherever this specification declares field definitions: the `frontmatter` block of a note-type schema, the `frontmatter` block of a property set, and any nested `object.fields` mapping.

Rules:

- `MN-24` A field name MUST be a non-empty string.
- `MN-25` A field name MUST match the regular expression `^[a-z][a-z0-9_]*$`.
- `MN-26` A field name MUST start with a lowercase ASCII letter and MAY continue with lowercase ASCII letters, digits, and underscores.
- `MN-27` A field name MUST NOT contain uppercase letters, whitespace, dots, slashes, or any other character outside that grammar.
- `MN-28` Field names are case-sensitive; two names that differ only in case are different names.
- `MN-29` A field name MUST be unique within the `frontmatter` mapping or `object.fields` mapping that declares it.
- `MN-30` A note-type schema or property set that declares a field name violating these rules is invalid under its artifact contract.
- `MN-31` The core-defined managed-note field names defined below conform to this grammar and additionally carry the contracts defined in Core-Defined Frontmatter Field Names.
- `MN-32` Storage-pattern placeholders of the form `{field_name}` reference top-level field names that follow these rules, as defined in [Note Type Schemas](note-type-schemas.md).
- `MN-33` When two field definitions contributed through property-set composition or note-type inheritance share a field name, they are the same field and merge by name under the rules in [Collection Model](collection-model.md); this is not a uniqueness violation.

### Core-Defined Frontmatter Field Names

Managed-note frontmatter includes both generic schema-defined fields and core-defined field names whose meaning is assigned by this specification.

Rules:

- `MN-34` A managed-note frontmatter field name is core-defined only when this specification gives that field a normative contract.
- `MN-35` The normative contract for a core-defined managed-note field MUST define its meaning, whether it is required or optional or conditional, whether schemas may declare it explicitly, the constraints on its stored values, and any note-type association or conformance behavior that follows from its use.
- `MN-36` `note_type` is a core-defined managed-note field name in this specification version.
- `MN-37` `note_type` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-38` `note_type` MAY be omitted from stored frontmatter when the configured note-type mapping rules resolve the note type from another surface.
- `MN-39` If stored, `note_type` MUST be a non-empty string.
- `MN-40` If stored, `note_type` MUST equal the resolved note type for that note.
- `MN-41` If a property set or a note-type schema declares `note_type`, it MUST declare `type: text`.
- `MN-42` If a property set or a note-type schema declares `note_type`, it MUST declare either `value_from_schema: note_type` or `const_value` equal to the schema's top-level `note_type`. In a property set, only `value_from_schema: note_type` is permitted, because a property set has no top-level `note_type`.
- `MN-43` If a property set or a note-type schema declares `note_type`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-44` `id` is an optional core-defined managed-note field name in this specification version.
- `MN-45` Schemas MAY declare `id` when they require stable note-level identifiers.
- `MN-46` If a schema declares `id`, it MUST declare `type: text` and `format: slug`.
- `MN-47` If a schema declares `id`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-48` Stored `id` values MUST be unique across all managed notes in the collection, regardless of note type; a repeated `id` value is a `duplicate_unique_value` failure.
- `MN-49` `deleted` is an optional core-defined managed-note field name in this specification version.
- `MN-50` `deleted` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-51` If stored, `deleted` MUST be a YAML boolean.
- `MN-52` If omitted or stored as `false`, the note is not logically deleted.
- `MN-53` If stored as `true`, the note is logically deleted.
- `MN-54` Logical deletion is distinct from archiving. Setting `deleted: true` does not by itself move the note or apply archive storage rules.
- `MN-55` A logically deleted note remains a managed note and continues to use its resolved concrete note type in this specification version.
- `MN-56` A logically deleted note MUST still satisfy its effective note-type schema, including field, storage, relationship, and heading rules; logical deletion marks state, it does not relax conformance.
- `MN-57` A resolved internal note link to a logically deleted note still resolves; the effect on relationship counting is defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `MN-58` Logical deletion is reversible: setting `deleted` back to `false` restores the note's non-deleted state without any other change.
- `MN-59` Hard deletion is the removal of the note file itself and is outside managed-note state; this specification version defines no tombstone artifact for hard-deleted notes.
- `MN-60` After hard deletion, internal note links to the removed note resolve to zero notes, and as unresolved placeholders they no longer satisfy minimum-cardinality requirements at their source notes.
- `MN-61` A tool that hard-deletes a managed note SHOULD report the inbound internal note links that will stop resolving before it deletes the note.
- `MN-62` A property set or a note-type schema MAY declare `deleted` when they want canonical materialization of deletion state.
- `MN-63` If a property set or a note-type schema declares `deleted`, it MUST declare `type: checkbox`.
- `MN-64` If a property set or a note-type schema declares `deleted`, it MUST declare `default_value: false`.
- `MN-65` If a property set or a note-type schema declares `deleted`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-66` `archived` is an optional core-defined managed-note field name in this specification version.
- `MN-67` `archived` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-68` If stored, `archived` MUST be a YAML boolean.
- `MN-69` If omitted or stored as `false`, the note is active.
- `MN-70` If stored as `true`, the note is archived.
- `MN-71` `archived` is the single marker of archived state; the storage rules in [Note Type Schemas](note-type-schemas.md) define where an archived note lives.
- `MN-72` Archived state changes which storage patterns govern the note's path, as defined in [Note Type Schemas](note-type-schemas.md); it does not by itself change relationship, heading, or field-conformance evaluation in this specification version.
- `MN-73` An archived note remains a managed note and continues to use its resolved concrete note type in this specification version.
- `MN-74` Archiving is distinct from logical deletion; `archived` and `deleted` are independent states and MAY both be `true` on the same note.
- `MN-75` A property set or a note-type schema MAY declare `archived` when they want canonical materialization of archived state.
- `MN-76` If a property set or a note-type schema declares `archived`, it MUST declare `type: checkbox`.
- `MN-77` If a property set or a note-type schema declares `archived`, it MUST declare `default_value: false`.
- `MN-78` If a property set or a note-type schema declares `archived`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-79` `aliases` is an optional core-defined managed-note field name in this specification version.
- `MN-80` `aliases` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-81` If stored, `aliases` MUST be a YAML sequence of unique non-empty strings.
- `MN-82` An alias MUST NOT contain `/`, `\`, `#`, `^`, `|`, or line breaks, because those characters cannot appear in a simple wikilink target.
- `MN-83` Aliases are alternative names for the note and participate in note-link resolution through the alias pass defined in [Note Links](note-links.md).
- `MN-84` Two managed notes SHOULD NOT share an alias; a link using a shared alias is ambiguous and cannot resolve, and tools SHOULD report shared aliases.
- `MN-85` A property set or a note-type schema MAY declare `aliases` when they want canonical materialization of aliases.
- `MN-86` If a property set or a note-type schema declares `aliases`, it MUST declare `type: list` and `items` with `type: text`.
- `MN-87` A core-defined managed-note field name MUST NOT be repurposed as an ordinary user-defined field in a property set or a note-type schema unless the core field contract explicitly permits schema-level declaration of that field.
- `MN-88` Field names such as `title`, `description`, `tags`, `created_at`, and `updated_at` are ordinary schema-defined managed-note field names in this specification version unless a rule explicitly defines them otherwise.
- `MN-89` The `tags` property type defined below remains a first-class supported property type.
- `MN-90` The generic property-type and field-definition rules in this page apply to ordinary schema-defined fields unless a dedicated core field rule says otherwise.

### Canonical Field Materialization

The canonical stored form of a managed note uses fully materialized frontmatter.

Rules:

- `MN-91` Every field declared in `frontmatter` MUST be physically present in stored note frontmatter.
- `MN-92` Declared fields MUST NOT be omitted merely because they currently have no concrete value.
- `MN-93` When no concrete value is known for a nullable field, the canonical stored value is `null`, unless an explicit non-null `default_value` is defined.
- `MN-94` When a field with `type: object` has a concrete mapping value, every field declared in that object's `fields` MUST be physically present in the stored mapping.
- `MN-95` Fields with `optional: false` and `optional: true` do not differ in physical materialization, but they do differ in value requirements.
- `MN-96` A field with `optional: false` MAY require a concrete non-null value, depending on `nullable` and `default_value`.
- `MN-97` A field with `optional: true` never requires a concrete non-null value; it remains valid when materialized as `null`.
- `MN-98` A missing field declared anywhere under `frontmatter` is a `missing_declared_field` validation failure.
- `MN-99` A missing nested field declared within an object field is also a `missing_declared_field` validation failure.
- `MN-100` Tools that create notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- `MN-101` Tools that import or scaffold notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- `MN-102` Tools that normalize notes or modify managed note frontmatter MUST rewrite frontmatter so it satisfies these canonical field materialization rules before saving.

## Field Optionality

Each schema MUST declare:

- `frontmatter`

Rules:

- `MN-103` `optional` defines value requirements, not sparse-storage behavior; canonical storage requirements are defined in Canonical Field Materialization.
- `MN-104` A field with `optional: false` MAY be nullable.
- `MN-105` A field with `optional: false` is part of the note's semantically expected metadata, even when `nullable: true` temporarily allows `null`.
- `MN-106` Fields with `optional: true` are semantically OPTIONAL, not sparse.
- `MN-107` Fields with `optional: true` MUST be nullable in the effective schema and MAY remain `null` indefinitely.
- `MN-108` Fields with `optional: true` MUST NOT be used for metadata that is REQUIRED to hold a concrete non-null value for conformance.
- `MN-109` If a field is intended to become invalid when no concrete value is present, it MUST declare `optional: false` and `nullable: false`.
- `MN-110` The same optionality distinction applies recursively within object field definitions.
- `MN-111` Unknown fields are evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md), at the effective severity for the note's resolved note type as defined in [Note Type Schemas](note-type-schemas.md).
- `MN-112` Unknown nested fields inside object values are also evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- `MN-113` A field is unknown when it is absent from the note's effective note-type schema; the core-defined managed-note field names `note_type`, `deleted`, `archived`, and `aliases` are never unknown fields, whether or not the effective schema declares them.
- `MN-114` If the effective `frontmatter` block declares `note_type`, `note_type` MUST be physically present in stored frontmatter.
- `MN-115` If the effective `frontmatter` block declares `note_type`, `note_type` MUST NOT declare `optional: true`.
- `MN-116` If `frontmatter` declares `id`, `id` MUST NOT declare `optional: true`.

