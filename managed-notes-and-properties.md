---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 5
---

# Managed Notes and Properties

This page is authoritative for the managed note contract, core-defined managed-note field names, frontmatter property types, note-link syntax and resolution, field definition attributes, canonical field materialization, and field optionality semantics. Relationship cardinality, heading constraints, and template obligations are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). The effective note-type schema that supplies a note's structural contract is described in [Note Type Schemas](note-type-schemas.md).

## 11. Managed Note Contract

Every managed note MUST:

- be a Markdown file
- contain YAML frontmatter
- use YAML frontmatter as the note's metadata
- declare `note_type`
- declare `id`
- satisfy exactly one effective note-type schema as defined in [Note Type Schemas](note-type-schemas.md)
- satisfy the field and materialization rules defined in this page
- satisfy the storage, relationship, and heading rules linked from its declared note type

Common frontmatter shape:

```yaml
note_type: topic
id: note-taking
title: Note Taking
description: null
domain: "[[Domains/Knowledge Management|Knowledge Management]]"
sources:
  - "[Introduction to Note Taking](Sources/Introduction%20to%20Note%20Taking.md)"
summary: null
status: active
```

Rules:

- `note_type` defines what the note is.
- `note_type` MUST equal the schema identifier defined by the matching schema file.
- `id` MUST be stable across renames and moves.
- `title` is human-facing and MAY change unless the schema marks it immutable.
- Display-oriented fields such as `title` and `description` are human-facing note metadata and MAY differ from the note's file name and storage path unless a schema rule explicitly couples them.
- A conforming managed note MUST remain usable as a normal Markdown note without preprocessing, transpilation, or note-local sidecar metadata.
- Managed-note conformance uses the effective note-type schema after collection-level inheritance, property-set application, and local schema definitions have been applied.
- The meanings of `relationship_kind`, `belongs_to`, and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Managed note frontmatter MUST follow the canonical field materialization rules defined on this page.

### Core-Defined Frontmatter Field Names

Managed-note frontmatter includes both generic schema-defined fields and core-defined field names whose meaning is assigned by this specification.

Rules:

- A managed-note frontmatter field name is core-defined only when this specification gives that field a normative contract.
- The normative contract for a core-defined managed-note field MUST define its meaning, whether it is required or optional or conditional, whether schemas may declare it explicitly, the constraints on its stored values, and any note-type association or conformance behavior that follows from its use.
- `note_type` and `id` are core-defined managed-note field names in this specification version.
- A core-defined managed-note field name MUST NOT be repurposed as an ordinary user-defined field in `global_properties.frontmatter`, a property set, or a note-type schema unless the core field contract explicitly permits schema-level declaration of that field.
- Field names such as `title`, `description`, `tags`, `aliases`, `created_at`, `updated_at`, and `archived` are ordinary schema-defined managed-note field names in this specification version unless a rule explicitly defines them otherwise.
- The `tags` property type defined below remains a first-class supported property type.
- The generic property-type and field-definition rules in this page apply to ordinary schema-defined fields unless a dedicated core field rule says otherwise.

## 12. Frontmatter Property Types

Each field definition MUST declare one of these property `type` values:

- `text`
- `list`
- `number`
- `checkbox`
- `date`
- `datetime`
- `tags`
- `object`

Rules:

- Field definitions MUST NOT use unknown property types.
- `text` values MUST be YAML strings.
- Markdown syntax inside property values has no special meaning.
- A field definition with `type: list` MUST declare `items`.
- Stored `list` values MUST be YAML sequences.
- `number` values MUST be YAML numbers.
- `checkbox` values MUST be either `true` or `false`.
- `date` MUST use RFC 3339 full-date format `YYYY-MM-DD`.
- `datetime` MUST use RFC 3339 date-time format with seconds and an explicit timezone designator such as `Z` or `+02:00`.
- `tags` values MUST be YAML sequences of tag strings.
- `tags` entries MUST be non-empty strings.
- A field definition with `type: object` MUST declare `fields`.
- Stored `object` values MUST be YAML mappings.
- YAML scalar, sequence, and mapping values are all supported when they satisfy the declared property type.
- A core-defined managed-note field name MAY still use a dedicated structured value only when this specification explicitly defines that field's contract.

### Note-Link Syntax and Resolution

Rules:

- Supported internal note-link forms include wikilinks and standard Markdown links.
- Supported wikilink forms include at least:
  - `[[Target]]`
  - `[[Target|Display text]]`
  - `[[Target#Heading]]`
  - `[[Target#Heading|Display text]]`
  - `[[Target#^block-id]]`
  - `[[Target#^block-id|Display text]]`
- Supported Markdown link forms include at least:
  - `[Display text](Target)`
  - `[Display text](Target.md)`
  - `[Display text](Target.md#Heading)`
  - `[Display text](Target.md#^block-id)`
- Markdown link destinations targeting managed notes SHOULD use wikilinks and MUST be URL encoded where required.
- Note-link resolution MAY use note names, note paths, note aliases, headings, and block identifiers.
- A syntactically valid internal note link MUST resolve unambiguously to at most one managed note.
- Resolution to zero managed notes MAY occur and represents a link to a note that does not exist yet.
- Display text, aliases, and other presentation details do not affect target resolution.
- Managed note frontmatter fields with `type: text` and `format: note_link` store exactly one non-embed internal note-link string.
- In note bodies, embed-prefixed wikilinks such as `![[Target]]` or `![[Target#^block-id]]` are supported internal note links.
- Relationship conformance uses the resolved managed-note targets produced by these rules; counting and cardinality rules are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Composite Properties

Rules:

- `list.items` MUST be a valid field definition.
- `list.items` MUST NOT declare `default_value` because anonymous list elements are not materialized independently.
- `list.items` MUST NOT declare `nullable` because list elements are not materialized independently.
- `list.items` MAY use any supported property type.
- `tags` MUST NOT declare `items`.
- `object.fields` MUST be a mapping, even when it is empty.
- Nested field definitions inside an `object` field follow the same type, materialization, and value-requirement rules as top-level field definitions unless a type-specific rule says otherwise.
- `object` MUST NOT declare `items`.
- Nested list and object properties are supported.

### Field Definition Attributes

Each field definition MAY additionally declare:

- `label`
- `description`
- `icon`
- `optional`
- `nullable`
- `default_value`
- `relationship_kind`
- `format`
- `allowed_values`
- `whole_number`
- `const_value`
- `value_from_schema`

Rules:

- Field definition attributes apply to top-level fields, to `list.items`, and recursively to nested fields inside `object.fields` unless a type-specific rule says otherwise.
- `label` is the human-facing name of the field and MUST NOT change the stored field key. If present, MUST be a non-empty string.
- `description` is human-facing explanatory metadata for generated references, forms, and authoring interfaces. If present, MUST be a non-empty string.
- `icon` is human-facing field metadata for generated references and applications. If present, MUST be a non-empty string.
- The core specification treats `icon` as opaque and does not standardize icon libraries or rendering behavior.
- Human-facing field metadata MUST NOT change field identity, storage keys, type validation, optionality semantics, relationship semantics, or materialization behavior.
- `optional` MUST be a boolean.
- If omitted, `optional` defaults to `false`.
- `nullable` MUST be a boolean.
- If `optional: false` and `nullable` is omitted, `nullable` defaults to `false`.
- If `optional: true` and `nullable` is omitted, `nullable` defaults to `true`.
- A field with `optional: true` MUST be nullable in the effective schema.
- A schema MUST NOT yield a field definition with `optional: true` and `nullable: false`.
- A field with `nullable: true` MAY explicitly use the value `null`.
- `default_value` MAY be used on any field definition.
- `default_value` MUST conform to the declared field type, or MAY be `null` only when `nullable: true`.
- `default_value` applies during field materialization when the field has no explicit concrete value.
- An explicit `null` value is distinct from an absent field and MUST NOT be replaced by `default_value`.
- `default_value` does not waive the physical presence requirement for declared fields.
- The RECOMMENDED pattern for a field that MUST always be present but MAY have no concrete value is `nullable: true` with `default_value: null`.
- `relationship_kind`, if present, MUST be either `belongs_to` or `related_to`.
- `relationship_kind` MAY be declared only on top-level frontmatter fields.
- A field with `relationship_kind` MUST have `type: text` and `format: note_link`, or `type: list` whose `items.type` is `text` and `items.format` is `note_link`.
- A field without `relationship_kind` MAY still use `format: note_link`, but it does not contribute to typed relationship conformance.
- The semantics of `relationship_kind` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `format` MAY be omitted.
- Supported `format` values are `note_link`, `uri`, and `slug`.
- `format: note_link` is valid only for `type: text` or `list.items.type: text`.
- `format: uri` is valid only for `type: text` or `list.items.type: text`.
- `format: slug` is valid only for `type: text`.
- Values with `format: slug` MUST match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Values with `format: uri` MUST be absolute URIs with a non-empty scheme and valid syntax according to RFC 3986. Relative references MUST NOT be used.
- Values with `format: note_link` MUST use the note-link syntax and resolution rules defined earlier in this page.
- `allowed_values` MAY be omitted.
- `allowed_values` MUST be a non-empty list of unique scalar values compatible with the declared scalar property `type`.
- `allowed_values` MUST NOT be used with `type: list`, `type: tags`, or `type: object`.
- Text `allowed_values` comparisons are case-sensitive and use exact string equality.
- `whole_number` MAY be omitted.
- `whole_number: true` is valid only for `type: number`.
- If `whole_number: true`, the stored number value MUST have no fractional component.
- `const_value` MAY be omitted.
- `const_value` MUST conform to the declared property type.
- `const_value` and `value_from_schema` MUST NOT both be present on the same field definition.
- `value_from_schema: note_type` means the constant value is taken from the note type identifier of the schema currently being evaluated.
- If `const_value` is present, the stored value MUST equal it exactly.
- If `value_from_schema` is present, the stored value MUST equal the derived schema value exactly.
- If `nullable: true` and no explicit `default_value` is provided, the implicit materialization default is `null`.
- If a field is not nullable and no explicit value or `default_value` is available, the field still MUST be present and the note MUST be treated as non-conforming until a conforming concrete value is supplied.

### Canonical Field Materialization

The canonical stored form of a managed note uses fully materialized frontmatter.

Rules:

- Every field declared in `frontmatter` MUST be physically present in stored note frontmatter.
- Declared fields MUST NOT be omitted merely because they currently have no concrete value.
- When no concrete value is known for a nullable field, the canonical stored value is `null`, unless an explicit non-null `default_value` is defined.
- When a field with `type: object` has a concrete mapping value, every field declared in that object's `fields` MUST be physically present in the stored mapping.
- Fields with `optional: false` and `optional: true` do not differ in physical materialization, but they do differ in value requirements.
- A field with `optional: false` MAY require a concrete non-null value, depending on `nullable` and `default_value`.
- A field with `optional: true` never requires a concrete non-null value; it remains valid when materialized as `null`.
- A missing field declared anywhere under `frontmatter` is a `missing_declared_field` validation failure.
- A missing nested field declared within an object field is also a `missing_declared_field` validation failure.
- Tools that create notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- Tools that import or scaffold notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- Tools that normalize notes or modify managed note frontmatter MUST rewrite frontmatter so it satisfies these canonical field materialization rules before saving.

## 13. Field Optionality

Each schema MUST declare:

- `frontmatter`

Rules:

- `optional` defines value requirements, not sparse-storage behavior; canonical storage requirements are defined in Canonical Field Materialization.
- A field with `optional: false` MAY be nullable.
- A field with `optional: false` is part of the note's semantically expected metadata, even when `nullable: true` temporarily allows `null`.
- Fields with `optional: true` are semantically OPTIONAL, not sparse.
- Fields with `optional: true` MUST be nullable in the effective schema and MAY remain `null` indefinitely.
- Fields with `optional: true` MUST NOT be used for metadata that is REQUIRED to hold a concrete non-null value for conformance.
- If a field is intended to become invalid when no concrete value is present, it MUST declare `optional: false` and `nullable: false`.
- The same optionality distinction applies recursively within object field definitions.
- Unknown fields are evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- Unknown nested fields inside object values are also evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- `note_type` and `id` MUST always appear in `frontmatter`.
- `note_type` and `id` MUST NOT declare `optional: true`.
