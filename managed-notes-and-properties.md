---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 5
---

# Managed Notes and Properties

This page is authoritative for the managed note contract, frontmatter property types, note-link syntax and resolution, field definition attributes, canonical field materialization, canonical serialization, and required-versus-optional field semantics. Relationship cardinality, heading constraints, and template obligations are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). The effective note-type schema that supplies a note's structural contract is described in [Note Type Schemas](note-type-schemas.md).

## 11. Managed Note Contract

Every managed note MUST:

- be a Markdown file
- contain YAML frontmatter
- use YAML frontmatter as the note's metadata
- declare `note_type`
- declare `id`
- satisfy exactly one effective note-type schema as defined in [Note Type Schemas](note-type-schemas.md)
- satisfy the field, materialization, and serialization rules defined in this page
- satisfy the storage, relationship, and heading rules linked from its declared note type

Common frontmatter shape:

```yaml
note_type: topic
id: note-taking
title: Note Taking
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
- A conforming managed note MUST remain usable as a normal Markdown note without preprocessing, transpilation, or note-local sidecar metadata.
- Managed-note conformance uses the effective note-type schema after collection-level inheritance, property-set application, and local schema definitions have been applied.
- The meanings of `relationship_kind`, `belongs_to`, and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Managed note frontmatter MUST follow the canonical field materialization and canonical serialization rules defined later in this page.

## 12. Frontmatter Property Types

Each field definition MUST declare one of these property `type` values:

- `text`
- `list`
- `number`
- `checkbox`
- `date`
- `datetime`
- `tags`

Rules:

- Field definitions MUST NOT use unknown property types.
- `text` values MUST be YAML strings.
- Markdown syntax inside property values has no special meaning.
- `list` values MUST be YAML sequences and MUST declare `items`.
- `number` values MUST be YAML numbers.
- `checkbox` values MUST be either `true` or `false`.
- `date` MUST use RFC 3339 full-date format `YYYY-MM-DD`.
- `datetime` MUST use RFC 3339 date-time format with seconds and an explicit timezone designator such as `Z` or `+02:00`.
- `tags` MUST be materialized as a YAML sequence of tag strings.
- `tags` entries MUST be non-empty strings.
- This version of the specification does not support nested object-valued note properties.
- Managed note properties MUST NOT be object-valued, even when the YAML syntax itself is valid.

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

### List Properties and Unsupported Nested Properties

Rules:

- `list.items` MUST be a valid field definition.
- `list.items.type` MUST be one of `text`, `number`, `checkbox`, `date`, or `datetime`.
- `list.items` MUST NOT declare `default_value` because anonymous list elements are not materialized independently.
- `list.items` MUST NOT declare `nullable` because list elements are not materialized independently.
- `tags` MUST NOT declare `items`.
- Nested list properties are not supported.
- Nested object-valued note properties are not supported.
- Validators MUST reject object-valued note properties as non-conforming note metadata in this version of the specification.

### Field Definition Attributes

Each field definition MAY additionally declare:

- `nullable`
- `default_value`
- `relationship_kind`
- `format`
- `allowed_values`
- `whole_number`
- `const_value`
- `value_from_schema`

Rules:

- Field definition attributes apply to top-level fields and to `list.items` unless a type-specific rule says otherwise.
- `nullable` MUST be a boolean.
- In `required_fields`, `nullable` defaults to `false`.
- In `optional_fields`, `nullable` defaults to `true`.
- A field with `nullable: true` MAY explicitly use the value `null`.
- `default_value` MAY be used on required or optional fields.
- `default_value` MUST conform to the declared field type, or MAY be `null` only when `nullable: true`.
- `default_value` applies during field materialization when the field has no explicit concrete value.
- An explicit `null` value is distinct from an absent field and MUST NOT be replaced by `default_value`.
- `default_value` does not waive the physical presence requirement for fields declared in `required_fields`.
- The RECOMMENDED pattern for a field that MUST always be present but MAY have no concrete value is `nullable: true` with `default_value: null`.
- `relationship_kind`, if present, MUST be either `belongs_to` or `related_to`.
- `relationship_kind` MAY be declared only on top-level frontmatter fields in `required_fields` or `optional_fields`.
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
- `allowed_values` MUST be a non-empty list of unique scalar values compatible with the declared property `type`.
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
- A field declared in `optional_fields` MUST be nullable in the effective schema.
- A schema MUST NOT yield an `optional_fields` entry with `nullable: false`.

### Canonical Field Materialization

The canonical stored form of a managed note uses fully materialized frontmatter.

Rules:

- Every field declared in `frontmatter.required_fields` or `frontmatter.optional_fields` MUST be physically present in stored note frontmatter.
- Declared fields MUST NOT be omitted merely because they currently have no concrete value.
- When no concrete value is known for a nullable field, the canonical stored value is `null`, unless an explicit non-null `default_value` is defined.
- `required_fields` and `optional_fields` do not differ in physical materialization, but they do differ in value requirements.
- `required_fields` MAY require a concrete non-null value, depending on `nullable` and `default_value`.
- `optional_fields` never require a concrete non-null value; they remain valid when materialized as `null`.
- A missing field declared anywhere under `frontmatter.required_fields` or `frontmatter.optional_fields` is a `missing_declared_field` validation failure.
- Tools that create notes MUST write back materialized frontmatter in canonical form.
- Tools that import or scaffold notes MUST write back materialized frontmatter in canonical form.
- Tools that normalize notes or modify managed note frontmatter MUST rewrite frontmatter in canonical form before saving.

### Canonical Serialization

This section is authoritative for canonical serialization of all governed artifacts.

Unless a more specific rule says otherwise, the rules in this section apply to:

- `typedmark.yaml`
- `.metadata/system.yaml`
- `.metadata/instance.yaml`
- `.metadata/property-sets/*.yaml`
- `.metadata/schemas/*.yaml`
- managed note frontmatter

Rules:

- All governed artifacts MUST use canonical serialization.
- Canonical serialization is normative and is not an implementation preference.
- An artifact that is semantically valid but not canonically serialized is non-conforming.
- `typedmark.yaml` and YAML files under `.metadata/` MUST contain exactly one YAML document and MUST NOT include YAML document delimiter lines such as `---` or `...`.
- Canonical YAML text MUST be UTF-8 encoded.
- Canonical YAML line endings MUST use LF.
- Canonical YAML indentation MUST use two spaces per level.
- Tab characters MUST NOT be used for indentation.
- Managed note frontmatter MUST be the first content in the file.
- Managed note frontmatter MUST be delimited by an opening `---` line and a closing `---` line.
- If the note body is non-empty, the closing frontmatter delimiter MUST be followed by exactly one blank line before body content begins.
- YAML `null` values MUST be rendered as the bare literal `null`.
- YAML boolean values MUST be rendered as lowercase `true` and `false`.
- Empty arrays MUST be rendered as `[]`.
- Empty mappings MUST be rendered as `{}`.
- Non-empty arrays MUST use block sequence style.
- Non-empty mappings MUST use block mapping style.
- Single-line string values MUST use plain scalar style only when all of the following are true:
  - the value is non-empty
  - the value has no leading or trailing whitespace
  - the value is not exactly `null`, `true`, `false`, or `~`
  - the value matches `^[A-Za-z0-9_][A-Za-z0-9_./@%+-]*(?: [A-Za-z0-9_./@%+-]+)*$`
- Single-line string values that do not satisfy all plain-scalar conditions MUST use double-quoted style.
- Multi-line string values MUST use literal block scalar style with strip chomping: `|-`.
- Double-quoted scalar values MUST escape `\` as `\\`, `"` as `\"`, tab as `\t`, carriage return as `\r`, line feed as `\n`, and any other control character as `\uXXXX`.
- In canonical double-quoted scalars, hexadecimal digits in `\uXXXX` escapes MUST use uppercase `A-F`.
- Printable non-control Unicode characters other than `\` and `"` MUST be emitted literally in UTF-8 and MUST NOT be escaped.
- Single-quoted scalars MUST NOT be used in canonical YAML artifacts.
- Folded block scalars MUST NOT be used in canonical YAML artifacts.
- Frontmatter values with `format: note_link`, and list items with `format: note_link`, MUST use double-quoted scalar style.
- Canonical serialization does not rewrite one valid internal note-link form into another semantically equivalent form.
- For general `list` fields, list order is semantically significant and MUST be preserved exactly as stored unless a future specification version defines field-level unordered-list semantics.
- Unknown but allowed frontmatter fields MUST appear after all declared fields, sorted lexicographically by field name.

Canonical top-level key order for governed artifacts:

- In `typedmark.yaml`: `specification_version`, `collection_model_id`, `exclude_paths`, `validation_defaults`, `global_properties`, then any allowed unknown keys in lexicographic order.
- In `.metadata/system.yaml`: `specification_version`, `system_id`, `version`, `name`, `description`, `audiences`, `publisher`, `license`, `scaffold`, `catalog`, then any allowed unknown keys in lexicographic order.
- In `.metadata/instance.yaml`: `specification_version`, `collection_instance_id`, `collection_model_id`, `system_id`, `system_version`, then any allowed unknown keys in lexicographic order.
- In `.metadata/property-sets/<property_set>.yaml`: `specification_version`, `property_set`, `description`, `frontmatter`, then any allowed unknown keys in lexicographic order.
- In `.metadata/schemas/<note_type>.yaml`: `specification_version`, `note_type`, `label`, `icon`, `kind`, `description`, `inheritance`, `property_sets`, `storage`, `template`, `frontmatter`, `relationships`, `headings`, `guidance`, then any allowed unknown keys in lexicographic order.

Canonical nested key order for standard metadata blocks:

- In `scaffold`: `folders`, `notes`, then any allowed unknown keys in lexicographic order.
- In scaffold note entries: `path`, `note_type`, `from_template`, `values`, then any allowed unknown keys in lexicographic order.
- In `storage`: `path_pattern`, `archive`, then any allowed unknown keys in lexicographic order.
- In `archive`: `policy`, `archived_path_pattern`, then any allowed unknown keys in lexicographic order.
- In `template`: `file`, then any allowed unknown keys in lexicographic order.
- In `frontmatter`: `required_fields`, `optional_fields`, then any allowed unknown keys in lexicographic order.
- In `relationships`: `belongs_to`, `related_to`, then any allowed unknown keys in lexicographic order.
- In each relationship kind mapping: `allowed_note_types`, then any allowed unknown keys in lexicographic order.
- In `headings`: `required_h2`, `optional_h2`, `allow_other_h2`, `require_order`, then any allowed unknown keys in lexicographic order.
- In `guidance`: `when_to_use`, `when_not_to_use`, then any allowed unknown keys in lexicographic order.

Canonical frontmatter key order:

1. `note_type`
2. `id`
3. remaining fields from `frontmatter.required_fields`, in effective schema order, excluding `note_type` and `id`
4. fields from `frontmatter.optional_fields`, in effective schema order
5. any allowed unknown fields, in lexicographic order

Generic mapping order rules:

- Any governed mapping whose key order is not explicitly defined above MUST sort keys lexicographically by Unicode code point order.

Effective schema field order rules:

- Within a single YAML mapping, field declaration order is significant.
- For inherited global fields, inherited fields keep their original relative order.
- Fields contributed by property sets are appended after inherited global fields in the note type schema's declared `property_sets` order, while preserving each property set's internal field declaration order.
- If a property set overrides an inherited global field, or a local field overrides an inherited or property-set-provided field, it retains the earlier field's position in effective order.
- New local fields that are not inherited and are not provided by property sets are appended after inherited and property-set-provided fields in their local declaration order.

Tooling obligations:

- Tools that create governed artifacts MUST emit canonical serialization.
- Tools that import or scaffold governed artifacts MUST emit canonical serialization.
- Tools that modify governed artifacts MUST rewrite them into canonical serialization before saving.
- Tools that only modify note body content SHOULD preserve already-canonical frontmatter byte-for-byte when possible.
- Validators SHOULD report non-canonical serialization as a distinct failure from semantic schema violations.

## 13. Required and Optional Fields

Each schema MUST declare:

- `frontmatter.required_fields`
- `frontmatter.optional_fields`

Rules:

- `required_fields` and `optional_fields` define value requirements, not sparse-storage behavior; canonical storage requirements are defined in Canonical Field Materialization.
- A field declared in `required_fields` MAY be nullable.
- Fields declared in `optional_fields` are semantically OPTIONAL, not sparse.
- Fields declared in `optional_fields` MUST be nullable in the effective schema and MAY remain `null` indefinitely.
- Fields declared in `optional_fields` MUST NOT be used for metadata that is REQUIRED to hold a concrete non-null value for conformance.
- If a field is intended to become invalid when no concrete value is present, it MUST be declared in `required_fields`, not `optional_fields`.
- Unknown fields are evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- `note_type` and `id` MUST always appear in `required_fields`.
