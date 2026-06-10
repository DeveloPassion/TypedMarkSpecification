---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 5
---

# Managed Notes and Properties

This page is authoritative for the managed note contract, note-type association, managed-note field names, core-defined managed-note field names, frontmatter property types, note-link syntax and resolution, field-definition properties, canonical field materialization, field optionality semantics, and the managed-note effect of system migration operations. Relationship cardinality, heading constraints, and template obligations are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). The effective note-type schema that supplies a note's structural contract is described in [Note Type Schemas](note-type-schemas.md).

## Notes in a Collection

TypedMark distinguishes between collection notes in general and managed notes specifically.

Rules:

- A collection note is a Markdown note that belongs to the collection as content rather than as a TypedMark artifact.
- A managed note is a collection note that is associated with exactly one known note type under this specification version's note-type association rules.
- The ordered note-type mapping rules are defined in [Collection Model](collection-model.md).
- The first matching note-type mapping rule determines the note's candidate note type.
- A collection note is managed only when the candidate note type from the winning mapping rule resolves to exactly one known concrete schema.
- A collection note is untyped when no mapping rule matches or when the winning mapping rule does not resolve to exactly one known concrete schema.
- Untyped notes MAY exist in a collection.
- Untyped notes are outside the managed-note contract on this page and are not validated against note-type storage, relationship, heading, or frontmatter field-definition rules.
- Rules on this page apply only to managed notes unless a rule explicitly says otherwise.

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

- `note_type`, when stored, defines the explicit note type value of the note.
- If stored, `note_type` MUST equal the schema identifier defined by the matching concrete schema file.
- `note_type` MAY be omitted when the configured note-type mapping rules resolve the note type from another surface.
- `id` MAY be omitted.
- A managed note MAY declare `id` when its schema includes an `id` field definition.
- If a managed note declares `id`, its `id` MUST be stable across renames and moves.
- `title` is human-facing and MAY change unless its field definition declares `immutable: true`.
- Display-oriented fields such as `title` and `description` are human-facing note metadata and MAY differ from the note's file name and storage path unless a schema rule explicitly couples them.
- A conforming managed note MUST remain usable as a normal Markdown note without preprocessing, transpilation, or note-local sidecar metadata.
- Managed-note conformance uses the effective note-type schema after default property sets, abstract-ancestor application, composed property sets, and local concrete schema definitions have been applied.
- The meanings of `relationship_kind`, `belongs_to`, and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Managed note frontmatter MUST follow the canonical field materialization rules defined on this page.

### Frontmatter Block Grammar

Rules:

- A note's frontmatter block is recognized under the Frontmatter Block Grammar defined in [Foundations](foundations.md).
- A note whose frontmatter block content parses as a non-mapping YAML document has no valid frontmatter and cannot satisfy the managed note contract.

A managed-note frontmatter field name is the YAML key under which a field definition stores its value. The same field-name rules apply wherever this specification declares field definitions: the `frontmatter` block of a note-type schema, the `frontmatter` block of a property set, and any nested `object.fields` mapping.

Rules:

- A field name MUST be a non-empty string.
- A field name MUST match the regular expression `^[a-z][a-z0-9_]*$`.
- A field name MUST start with a lowercase ASCII letter and MAY continue with lowercase ASCII letters, digits, and underscores.
- A field name MUST NOT contain uppercase letters, whitespace, dots, slashes, or any other character outside that grammar.
- Field names are case-sensitive; two names that differ only in case are different names.
- A field name MUST be unique within the `frontmatter` mapping or `object.fields` mapping that declares it.
- A note-type schema or property set that declares a field name violating these rules is invalid under its artifact contract.
- The core-defined managed-note field names defined below conform to this grammar and additionally carry the contracts defined in Core-Defined Frontmatter Field Names.
- Storage-pattern placeholders of the form `{field_name}` reference top-level field names that follow these rules, as defined in [Note Type Schemas](note-type-schemas.md).
- When two field definitions contributed through property-set composition or note-type inheritance share a field name, they are the same field and merge by name under the rules in [Collection Model](collection-model.md); this is not a uniqueness violation.

### Core-Defined Frontmatter Field Names

Managed-note frontmatter includes both generic schema-defined fields and core-defined field names whose meaning is assigned by this specification.

Rules:

- A managed-note frontmatter field name is core-defined only when this specification gives that field a normative contract.
- The normative contract for a core-defined managed-note field MUST define its meaning, whether it is required or optional or conditional, whether schemas may declare it explicitly, the constraints on its stored values, and any note-type association or conformance behavior that follows from its use.
- `note_type` is a core-defined managed-note field name in this specification version.
- `note_type` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `note_type` MAY be omitted from stored frontmatter when the configured note-type mapping rules resolve the note type from another surface.
- If stored, `note_type` MUST be a non-empty string.
- If stored, `note_type` MUST equal the resolved note type for that note.
- If a property set or a note-type schema declares `note_type`, it MUST declare `type: text`.
- If a property set or a note-type schema declares `note_type`, it MUST declare either `value_from_schema: note_type` or `const_value` equal to the schema's top-level `note_type`. In a property set, only `value_from_schema: note_type` is permitted, because a property set has no top-level `note_type`.
- If a property set or a note-type schema declares `note_type`, it MUST NOT declare `optional: true` or `nullable: true`.
- `id` is an optional core-defined managed-note field name in this specification version.
- Schemas MAY declare `id` when they require stable note-level identifiers.
- If a schema declares `id`, it MUST declare `type: text` and `format: slug`.
- If a schema declares `id`, it MUST NOT declare `optional: true` or `nullable: true`.
- `deleted` is an optional core-defined managed-note field name in this specification version.
- `deleted` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- If stored, `deleted` MUST be a YAML boolean.
- If omitted or stored as `false`, the note is not logically deleted.
- If stored as `true`, the note is logically deleted.
- Logical deletion is distinct from archiving. Setting `deleted: true` does not by itself move the note or apply archive storage rules.
- A logically deleted note remains a managed note and continues to use its resolved concrete note type in this specification version.
- A logically deleted note MUST still satisfy its effective note-type schema, including field, storage, relationship, and heading rules; logical deletion marks state, it does not relax conformance.
- A resolved internal note link to a logically deleted note still resolves; the effect on relationship counting is defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Logical deletion is reversible: setting `deleted` back to `false` restores the note's non-deleted state without any other change.
- Hard deletion is the removal of the note file itself and is outside managed-note state; this specification version defines no tombstone artifact for hard-deleted notes.
- After hard deletion, internal note links to the removed note resolve to zero notes, and as unresolved placeholders they no longer satisfy minimum-cardinality requirements at their source notes.
- A tool that hard-deletes a managed note SHOULD report the inbound internal note links that will stop resolving before it deletes the note.
- A property set or a note-type schema MAY declare `deleted` when they want canonical materialization of deletion state.
- If a property set or a note-type schema declares `deleted`, it MUST declare `type: checkbox`.
- If a property set or a note-type schema declares `deleted`, it MUST declare `default_value: false`.
- If a property set or a note-type schema declares `deleted`, it MUST NOT declare `optional: true` or `nullable: true`.
- `archived` is an optional core-defined managed-note field name in this specification version.
- `archived` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- If stored, `archived` MUST be a YAML boolean.
- If omitted or stored as `false`, the note is active.
- If stored as `true`, the note is archived.
- `archived` is the single marker of archived state; the storage rules in [Note Type Schemas](note-type-schemas.md) define where an archived note lives.
- Archived state changes which storage patterns govern the note's path, as defined in [Note Type Schemas](note-type-schemas.md); it does not by itself change relationship, heading, or field-conformance evaluation in this specification version.
- An archived note remains a managed note and continues to use its resolved concrete note type in this specification version.
- Archiving is distinct from logical deletion; `archived` and `deleted` are independent states and MAY both be `true` on the same note.
- A property set or a note-type schema MAY declare `archived` when they want canonical materialization of archived state.
- If a property set or a note-type schema declares `archived`, it MUST declare `type: checkbox`.
- If a property set or a note-type schema declares `archived`, it MUST declare `default_value: false`.
- If a property set or a note-type schema declares `archived`, it MUST NOT declare `optional: true` or `nullable: true`.
- `aliases` is an optional core-defined managed-note field name in this specification version.
- `aliases` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- If stored, `aliases` MUST be a YAML sequence of unique non-empty strings.
- An alias MUST NOT contain `/`, `\`, `#`, `^`, `|`, or line breaks, because those characters cannot appear in a simple wikilink target.
- Aliases are alternative names for the note and participate in note-link resolution through the alias pass defined under Target Resolution on this page.
- Two managed notes SHOULD NOT share an alias; a link using a shared alias is ambiguous and cannot resolve, and tools SHOULD report shared aliases.
- A property set or a note-type schema MAY declare `aliases` when they want canonical materialization of aliases.
- If a property set or a note-type schema declares `aliases`, it MUST declare `type: list` and `items` with `type: text`.
- A core-defined managed-note field name MUST NOT be repurposed as an ordinary user-defined field in a property set or a note-type schema unless the core field contract explicitly permits schema-level declaration of that field.
- Field names such as `title`, `description`, `tags`, `created_at`, and `updated_at` are ordinary schema-defined managed-note field names in this specification version unless a rule explicitly defines them otherwise.
- The `tags` property type defined below remains a first-class supported property type.
- The generic property-type and field-definition rules in this page apply to ordinary schema-defined fields unless a dedicated core field rule says otherwise.

## Frontmatter Property Types

Every field definition is a YAML mapping. Every field definition MUST declare `type`, and it MAY declare additional field-definition properties such as `label`, `description`, `icon`, `format`, `generated`, `unique`, `deprecated`, `immutable`, `optional`, `nullable`, `default_value`, `validate_exists`, `not_empty`, `not_blank`, `regex`, `min`, `max`, and `allowed_values`.

### Field Definition Property Reference

Rules:

- Field-definition properties apply to top-level fields, to `list.items`, and recursively to nested fields inside `object.fields` unless a type-specific rule says otherwise.
- Human-facing field metadata MUST NOT change field identity, storage keys, type validation, optionality semantics, relationship semantics, or materialization behavior.
- Constraint properties other than `nullable` and `optional` are evaluated only when the stored value is non-null.
- A non-null `default_value` MUST satisfy all declared field constraints.

#### `type`

Rules:

- `type` is REQUIRED on every field definition.
- Supported `type` values are `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, `link`, `list`, `tags`, `object`, and `any`.
- Field definitions MUST NOT use unknown property types.
- `text` values MUST be YAML strings.
- `integer` values MUST be YAML numbers with no fractional component.
- Markdown syntax inside property values has no special meaning.
- `number` values MUST be YAML numbers.
- `checkbox` values MUST be either `true` or `false`.
- `date` MUST use RFC 3339 full-date format `YYYY-MM-DD`.
- `time` values MUST be YAML strings and MUST match the declared time `format`.
- `datetime` MUST use RFC 3339 date-time format with seconds and an explicit timezone designator such as `Z` or `+02:00`.
- `link` values MUST be YAML strings and MUST follow the declared link `format`.
- Stored `list` values MUST be YAML sequences.
- `tags` values MUST be YAML sequences of tag strings.
- `tags` entries MUST be non-empty strings.
- A `tags` entry is one or more segments joined by single `/` separators; each segment MUST consist of Unicode letters, digits, underscores, and hyphens, and MUST NOT start with a hyphen. In the ECMA-262 dialect with the `u` flag: `^[\p{L}\p{N}_][\p{L}\p{N}_-]*(?:\/[\p{L}\p{N}_][\p{L}\p{N}_-]*)*$`.
- `tags` entries MUST NOT include a leading `#`; the `#` prefix belongs to inline body syntax, which carries no structural meaning.
- The `/` separator expresses hierarchy: `project/alpha` is a descendant of `project`. This specification assigns the separator that meaning but does not define controlled vocabularies or validate entries against a taxonomy.
- Entries within one stored `tags` value MUST be unique under the string comparison rules defined in [Foundations](foundations.md); a duplicate entry is an `invalid_field_value` failure.
- A `tags` entry that violates this grammar is an `invalid_field_value` failure.
- Stored `object` values MUST be YAML mappings.
- `any` values MAY be any non-null YAML value, and MAY be `null` only when `nullable: true`.
- YAML scalar, sequence, and mapping values are all supported when they satisfy the declared property type.
- A core-defined managed-note field name MAY still use a dedicated structured value only when this specification explicitly defines that field's contract.

#### `items`

Rules:

- `items` MAY appear only when `type: list`.
- A field definition with `type: list` MUST declare `items`.
- `items` MUST be a valid field definition.
- `items` MUST NOT declare `default_value` because anonymous list elements are not materialized independently.
- `items` MUST NOT declare `nullable` because list elements are not materialized independently.
- `items` MUST NOT declare `immutable` because anonymous list elements are not tracked individually.
- `items` MAY use any supported property type.
- Fields with `type: tags` MUST NOT declare `items`.
- Fields with `type: object` MUST NOT declare `items`.

#### `fields`

Rules:

- `fields` MAY appear only when `type: object`.
- A field definition with `type: object` MUST declare `fields`.
- `fields` MUST be a mapping, even when it is empty.
- Nested field definitions inside `object.fields` follow the same type, materialization, and value-requirement rules as top-level field definitions unless a type-specific rule says otherwise.
- Nested list and object properties are supported.

#### `label`

Rules:

- `label` MAY be omitted.
- `label` is the human-facing name of the field and MUST NOT change the stored field key.
- If present, `label` MUST be a non-empty string.

#### `description`

Rules:

- `description` MAY be omitted.
- `description` is human-facing explanatory metadata for generated references, forms, and authoring interfaces.
- If present, `description` MUST be a non-empty string.

#### `icon`

Rules:

- `icon` MAY be omitted.
- `icon` is human-facing field metadata for generated references and applications.
- If present, `icon` MUST be a non-empty string.
- The core specification treats `icon` as opaque and does not standardize icon libraries or rendering behavior.

#### `generated`

Rules:

- `generated` MAY be omitted.
- `generated` MUST be a boolean.
- If omitted, `generated` defaults to `false`.
- `generated: true` marks a field as generated or computed metadata rather than ordinary manually authored metadata.
- This specification does not define how or when a generated field is produced, refreshed, or protected from manual edits.
- `generated` does not make a field virtual. Declared generated fields still follow the same type validation, optionality, defaulting, stored-frontmatter, and canonical materialization rules as other declared fields.
- `generated` does not replace `const_value` or `value_from_schema`.

#### `unique`

Rules:

- `unique` MAY be omitted.
- `unique` MUST be a boolean.
- If omitted, `unique` defaults to `false`.
- `unique` MAY be declared only on top-level frontmatter fields.
- `unique: true` is valid only for scalar field types: `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, and `link`.
- `unique: true` means every non-null stored value for that field MUST be distinct across all managed notes of the same note type.
- Uniqueness is evaluated using exact stored-value equality after normal YAML parsing, under the string comparison rules defined in [Foundations](foundations.md), not by note-link resolution.
- Multiple `null` values do not violate uniqueness.
- A repeated non-null value for a field with `unique: true` is a `duplicate_unique_value` validation failure, as defined in [Collection Model](collection-model.md).
- If a unique value may be assigned later, the RECOMMENDED pattern is `nullable: true` with `default_value: null`.

#### `deprecated`

Rules:

- `deprecated` MAY be omitted.
- `deprecated` MUST be a boolean.
- If omitted, `deprecated` defaults to `false`.
- `deprecated: true` marks a field as discouraged for new use.
- A deprecated field remains valid and governed by the same type validation, optionality, defaulting, stored-frontmatter, and canonical materialization rules as any other declared field.
- This specification version does not define replacement mappings, migration behavior, or automatic validator severities for deprecated fields.

#### `immutable`

Rules:

- `immutable` MAY be omitted.
- `immutable` MUST be a boolean.
- If omitted, `immutable` defaults to `false`.
- `immutable: true` means that once the field holds a concrete non-null stored value, that value MUST NOT change.
- Immutability is an obligation on tools and operations that modify managed notes; because conformance evaluation is stateless, a validator MAY verify immutability only when it has access to historical state.
- A `rename_field` migration moves an immutable value unchanged; a `change_field` migration MAY change a field's `immutable` declaration.
- `const_value` and `value_from_schema` are stronger guarantees than `immutable`; a field declaring either need not also declare `immutable`.
- The core-defined `id` field is immutable whether or not its definition declares it.
- `immutable` MAY be declared on top-level fields and on nested fields inside `object.fields`; it MUST NOT be declared on `items`.

#### `optional`

Rules:

- `optional` MAY be omitted.
- `optional` MUST be a boolean.
- If omitted, `optional` defaults to `false`.
- `optional` defines value requirements, not sparse-storage behavior.
- A field with `optional: true` MUST be nullable in the effective schema.
- A schema MUST NOT yield a field definition with `optional: true` and `nullable: false`.
- Fields with `optional: true` are semantically OPTIONAL, not sparse.
- Fields with `optional: true` MAY remain `null` indefinitely when materialized.

#### `nullable`

Rules:

- `nullable` MAY be omitted.
- `nullable` MUST be a boolean.
- If `optional: false` and `nullable` is omitted, `nullable` defaults to `false`.
- If `optional: true` and `nullable` is omitted, `nullable` defaults to `true`.
- A field with `nullable: true` MAY explicitly use the value `null`.
- If a field is not nullable and no explicit value or `default_value` is available, the field still MUST be present and the note MUST be treated as non-conforming until a conforming concrete value is supplied.

#### `default_value`

Rules:

- `default_value` MAY be used on any field definition.
- `default_value` MUST conform to the declared field type, or MAY be `null` only when `nullable: true`.
- `default_value` applies during field materialization when the field has no explicit concrete value.
- An explicit `null` value is distinct from an absent field and MUST NOT be replaced by `default_value`.
- `default_value` does not waive the physical presence requirement for declared fields.
- If `nullable: true` and no explicit `default_value` is provided, the implicit materialization default is `null`.
- The RECOMMENDED pattern for a field that MUST always be present but MAY have no concrete value is `nullable: true` with `default_value: null`.

#### `relationship_kind`

Rules:

- `relationship_kind` MAY be omitted.
- If present, `relationship_kind` MUST be either `belongs_to` or `related_to`.
- `relationship_kind` MAY be declared only on top-level frontmatter fields.
- A field with `relationship_kind` MUST have `type: link` and `format: note_link`, or `type: list` whose `items.type` is `link` and `items.format` is `note_link`.
- A field without `relationship_kind` MAY still use `format: note_link`, but it does not contribute to typed relationship conformance.
- The semantics of `relationship_kind` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

#### `format`

Rules:

- `format` MAY be omitted.
- Supported `format` values are `slug`, `note_link`, `uri`, `hh:mm`, `hh:mm:ss`, and `hh:mm:ss.sss`.
- `type: link` MUST declare `format`.
- `type: time` MUST declare `format`.
- `format: slug` is valid only for `type: text` or `list.items.type: text`.
- `format: note_link` is valid only for `type: link` or `list.items.type: link`.
- `format: uri` is valid only for `type: link` or `list.items.type: link`.
- `format: hh:mm`, `format: hh:mm:ss`, and `format: hh:mm:ss.sss` are valid only for `type: time` or `list.items.type: time`.
- Values with `format: slug` MUST match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Values with `format: uri` MUST be absolute URIs with a non-empty scheme and valid syntax according to RFC 3986. Relative references MUST NOT be used.
- Values with `format: note_link` MAY be the empty string as an explicit placeholder when no concrete link is known.
- Non-empty values with `format: note_link` MUST use the note-link syntax and resolution rules defined later in this page.
- An empty-string value with `format: note_link` does not resolve to a managed note and does not contribute to relationship conformance.
- Values with `format: hh:mm` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d$`.
- Values with `format: hh:mm:ss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$`.
- Values with `format: hh:mm:ss.sss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$`.

#### `validate_exists`

Rules:

- `validate_exists` MAY be omitted.
- `validate_exists` MUST be a boolean.
- If omitted, `validate_exists` defaults to `false`.
- `validate_exists` is valid only on field definitions that declare `format: note_link`, including `list.items`.
- `validate_exists: true` means every non-empty stored note-link value MUST resolve to exactly one existing collection note under the note-link resolution rules on this page.
- An empty-string placeholder value does not violate `validate_exists`; combine it with `not_empty: true` to forbid placeholders entirely.
- A non-empty value that does not resolve violates `validate_exists` and is reported as `invalid_note_link`.
- `validate_exists` does not change relationship counting; unresolved placeholders already fail minimum-cardinality requirements.

#### `targets`

Rules:

- `targets` MAY be omitted.
- If present, `targets` MUST be a non-empty list of unique note-type identifiers.
- `targets` is valid only on field definitions that declare `format: note_link`, including `list.items`.
- Each identifier in `targets` MUST resolve to a note type defined in the collection; it MAY name an abstract note type.
- An abstract note type in `targets` means any concrete note type that extends it directly or transitively.
- A non-empty stored value that resolves to a managed note MUST resolve to a note whose concrete note type satisfies `targets`; a value resolving to an untyped note violates `targets`.
- A `targets` violation is an `invalid_field_value` failure.
- An unresolved value does not violate `targets`; existence is governed by `validate_exists`.
- For values stored in a field declaring `targets`, the id, name, and alias passes of name-based resolution consider only managed notes whose concrete note type satisfies `targets`; path-formed targets resolve normally and are then validated against `targets`.
- A relationship-bearing field MAY declare `targets`; its declared targets SHOULD be consistent with the type-level relationship declarations, and a resolved typed relationship instance is validated against both.

#### `not_empty`

Rules:

- `not_empty` MAY be omitted.
- `not_empty` MUST be a boolean.
- If omitted, `not_empty` defaults to `false`.
- `not_empty: true` is valid only for `type: text`, `type: link`, `type: list`, `type: tags`, or `type: object`.
- For `type: text` and `type: link`, `not_empty: true` means the stored string MUST NOT be `""`.
- For `type: list` and `type: tags`, `not_empty: true` means the stored sequence MUST contain at least one item.
- For `type: object`, `not_empty: true` means the stored mapping MUST contain at least one key.

#### `not_blank`

Rules:

- `not_blank` MAY be omitted.
- `not_blank` MUST be a boolean.
- If omitted, `not_blank` defaults to `false`.
- `not_blank: true` is valid only for `type: text` or `type: link`.
- `not_blank: true` means the stored string MUST contain at least one non-whitespace character.
- `not_blank: true` is stronger than `not_empty: true`.

#### `regex`

Rules:

- `regex` MAY be omitted.
- `regex` MUST be a non-empty string.
- `regex` is valid only for `type: text` or `type: link`.
- `regex` is matched against the entire stored string value.
- `regex` patterns use the ECMA-262 regular expression dialect defined in [Foundations](foundations.md).

#### `min`

Rules:

- `min` MAY be omitted.
- `min` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- For `type: text` and `type: link`, `min` constrains string length in Unicode code points and MUST be a non-negative integer.
- For `type: list` and `type: tags`, `min` constrains item count and MUST be a non-negative integer.
- For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `min` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- For `type: date`, `type: time`, and `type: datetime`, `min` comparison uses temporal ordering, not raw string comparison.

#### `max`

Rules:

- `max` MAY be omitted.
- `max` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- For `type: text` and `type: link`, `max` constrains string length in Unicode code points and MUST be a non-negative integer.
- For `type: list` and `type: tags`, `max` constrains item count and MUST be a non-negative integer.
- For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `max` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- For `type: date`, `type: time`, and `type: datetime`, `max` comparison uses temporal ordering, not raw string comparison.
- If both `min` and `max` are present, `min` MUST be less than or equal to `max`.

#### `allowed_values`

Rules:

- `allowed_values` MAY be omitted.
- `allowed_values` MUST be a non-empty list of unique scalar values.
- For scalar field types, `allowed_values` entries MUST be compatible with the declared property `type`.
- For `type: list`, `allowed_values` is valid only when `items.type` is one of `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, or `link`, and each `allowed_values` entry MUST be compatible with that item type.
- For `type: list`, every stored item value MUST be one of the declared `allowed_values`.
- `allowed_values` MUST NOT be used with `type: tags`, `type: object`, or `type: any`.
- Text and link `allowed_values` comparisons are case-sensitive and use exact string equality under the string comparison rules defined in [Foundations](foundations.md).
- Non-text scalar `allowed_values` comparisons use exact scalar equality after normal YAML parsing and type validation.

#### `const_value`

Rules:

- `const_value` MAY be omitted.
- `const_value` MUST conform to the declared property type.
- `const_value` and `value_from_schema` MUST NOT both be present on the same field definition.
- If `const_value` is present, the stored value MUST equal it exactly.

#### `value_from_schema`

Rules:

- `value_from_schema` MAY be omitted.
- The only supported `value_from_schema` value in this specification version is `note_type`.
- `value_from_schema: note_type` means the constant value is taken from the note type identifier of the schema currently being evaluated.
- If `value_from_schema` is present, the stored value MUST equal the derived schema value exactly.

### Note-Link Syntax and Resolution

Internal note links connect collection notes. This section defines the supported link forms, the parsed link components, and the deterministic target-resolution algorithm. Two conforming tools MUST resolve the same internal note link, in the same collection, to the same result.

#### Link Forms

Rules:

- The supported internal note-link forms are wikilinks and standard Markdown links.
- Supported wikilink forms are:
  - `[[Target]]`
  - `[[Target|Display text]]`
  - `[[Target#Heading]]`
  - `[[Target#Heading|Display text]]`
  - `[[Target#^block-id]]`
  - `[[Target#^block-id|Display text]]`
- Supported Markdown link forms are:
  - `[Display text](Target)`
  - `[Display text](Target.md)`
  - `[Display text](Target.md#Heading)`
  - `[Display text](Target.md#^block-id)`
- An embed is any supported form prefixed with `!`, such as `![[Target]]` or `![Alt text](Target.md)`.
- A Markdown link destination that contains an RFC 3986 URI scheme, such as `https:` or `mailto:`, is an external link, not an internal note link.
- Markdown link destinations MUST be URL encoded where RFC 3986 requires it; notes linking to managed notes SHOULD prefer wikilinks.
- Managed note frontmatter fields with `type: link` and `format: note_link` store exactly one non-embed internal note-link string in either supported form.
- Link parsing and target resolution are the same wherever an internal note link appears, in frontmatter or in the note body.

#### Link Parsing

Rules:

- An internal note link MUST parse into these components: the raw source string, the form (`wikilink` or `markdown`), the target, an optional anchor, an optional display text, and an embed flag.
- In wikilinks, the segment after `|` is the display text and the segment after the first `#` is the anchor.
- In Markdown links, the bracketed segment is the display text and the destination segment after the first `#` is the anchor; the destination before it is the target, URL decoded before resolution.
- An anchor beginning with `^` is a block identifier; any other anchor is heading text.
- Display text and the embed flag never affect target resolution.

#### Target Resolution

A parsed target resolves through the following algorithm. Path-formed targets resolve by path; simple wikilink names resolve by name.

Rules:

1. If the form is `markdown`: a target with a leading `/` resolves from the collection root with the leading `/` removed; any other target resolves relative to the containing note's directory.
2. If the form is `wikilink`: a target starting with `./` or `../` resolves relative to the containing note's directory; a target with a leading `/` resolves from the collection root with the leading `/` removed; any other target containing `/` resolves from the collection root; a target with no `/` is a simple name and resolves by name under rule 5.
3. Path resolution MUST normalize `.` and `..` segments before lookup. If the normalized path escapes the collection root, the link MUST NOT resolve and is an `invalid_note_link` failure.
4. If a path-formed target does not end in `.md`, `.md` is appended. The link resolves to the collection note at exactly the resulting collection-relative path, or to zero notes when no such note exists.
5. Name resolution considers collection notes that are not excluded by `exclude_paths`, in three passes:
   - The id pass matches managed notes whose stored `id` equals the target. Exactly one match resolves the link. More than one match makes the link ambiguous.
   - If the id pass has no match, the name pass matches collection notes whose file name without the `.md` extension equals the target. Exactly one match resolves the link. When several notes match, the candidates in the same directory as the containing note are preferred; among the remaining candidates, those whose path has the fewest segments are preferred. If more than one candidate still remains, the link is ambiguous.
   - If the name pass has no match, the alias pass matches managed notes whose stored `aliases` value contains an entry equal to the target. Exactly one match resolves the link. When several notes match, the name-pass tiebreakers apply; if more than one candidate still remains, the link is ambiguous.
6. An ambiguous link MUST NOT resolve and is an `invalid_note_link` failure.
7. Aliases participate in resolution only through the alias pass, using the stored `aliases` values defined under Core-Defined Frontmatter Field Names; a note's file name always takes precedence over another note's alias.
8. Target, `id`, file-name, and alias comparisons in this algorithm are case-sensitive exact string comparisons.
9. Resolution to zero notes MAY occur and represents a link to a note that does not exist yet; it is not by itself a failure, unless the declaring field requires existence through `validate_exists`.
10. A note MAY link to itself; a self-link resolves to the containing note.

#### Anchors

Rules:

- A heading anchor refers to heading text within the resolved note; a block anchor refers to a block identifier within the resolved note.
- Anchors do not affect note-target resolution.
- An anchor that does not match anything in the resolved note is not a conformance failure in this specification version; tools MAY report it.

Relationship conformance uses the resolved managed-note targets produced by these rules; counting and cardinality rules are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

#### Body Link Extraction

The note body is the content after the frontmatter block. Body internal note links participate in structural reasoning, so what counts as a body link must be deterministic.

Rules:

- Internal note links are extracted from the note body wherever they appear, except in the excluded regions below.
- Links are NOT extracted from fenced code blocks delimited by ``` or `~~~`, from indented code blocks as defined by CommonMark, or from inline code spans delimited by backticks.
- A backslash immediately before `[[` escapes the wikilink: the backslash is consumed and the brackets are literal text. Markdown links follow standard CommonMark escaping.
- Text inside an excluded region or escaped link is not an internal note link: it creates no relationship instance and is not evaluated by link validation.
- Embeds are extracted as internal note links with the embed flag set; tools MUST be able to distinguish embeds from non-embed links.
- Embeds participate in body-link relationship counting like non-embed body links.

#### Inline Body Tags

Rules:

- This specification version assigns no structural meaning to inline `#tag` tokens in note bodies.
- Managed tag metadata lives in frontmatter fields with `type: tags`.
- Tools MAY index inline body tags for search or navigation, but MUST NOT use them for note-type mapping, field conformance, or relationship conformance.

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

## Field Optionality

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
- Unknown fields are evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md), at the effective severity for the note's resolved note type as defined in [Note Type Schemas](note-type-schemas.md).
- Unknown nested fields inside object values are also evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- A field is unknown when it is absent from the note's effective note-type schema; the core-defined managed-note field names `note_type`, `deleted`, `archived`, and `aliases` are never unknown fields, whether or not the effective schema declares them.
- If the effective `frontmatter` block declares `note_type`, `note_type` MUST be physically present in stored frontmatter.
- If the effective `frontmatter` block declares `note_type`, `note_type` MUST NOT declare `optional: true`.
- If `frontmatter` declares `id`, `id` MUST NOT declare `optional: true`.

## Migrating Managed Notes

When a collection is updated to newer versions of its source systems, the migration plan defined in [Systems, Composition, and Evolution](systems-composition-evolution.md) is applied to managed notes. Each system change operation recorded in `history.md` has a defined effect on managed-note frontmatter, defined here. The migration plan determines the order in which these operations are applied; this page defines what each one does to a note.

Rules:

- A migration operation that names `note_type` applies only to managed notes whose resolved note type is that note type.
- A field operation that names `property_set` applies to managed notes of every note type whose effective schema composes that property set.
- `add_field` MUST add the new field to every affected managed note, materialized to its `default_value` or to `null` under the Canonical Field Materialization rules.
- `remove_field` MUST remove the named field from every affected managed note.
- `rename_field` MUST move the stored value from the old field name to the new field name in every affected managed note, preserving the value unchanged.
- `retype_field` MUST convert each stored value under the Field Type Conversions rules below: a defined lossless conversion is applied automatically, a conditional conversion is applied only when every affected value qualifies, and every other type pair MUST be reported for explicit resolution and MUST NOT be coerced destructively.
- `change_field` MUST re-validate every affected managed note against the field's new constraints; a stored value that violates the new constraints MUST be reported rather than silently dropped or altered.
- `rename_note_type` MUST update the stored `note_type` field when present, MUST re-resolve the note's storage path under the renamed type's effective storage rules, and MUST update internal note links and relationship-bearing fields that target the renamed type.
- `change_storage` MUST re-resolve the storage path of every affected managed note under the new effective storage rules, MUST move each note whose stored path no longer conforms, and MUST update internal note links so moved notes still resolve; a move or link update that cannot be applied safely MUST be reported for explicit resolution.
- `change_template` has no direct managed-note effect; tools MAY re-evaluate `template_drift` against the new canonical template.
- `change_headings` and `change_relationships` MUST re-validate every affected managed note against the new effective heading and relationship rules; violations MUST be reported, and a migration MUST NOT restructure note body content automatically.
- `change_note_type` and `change_collection` have the managed-note effect of the resulting change to each note's effective schema, evaluated through the operations above and re-validation.
- `add_note_type`, `remove_note_type`, `add_property_set`, `remove_property_set`, and `rename_property_set` change which schemas and property sets exist; their effect on an individual managed note is only the resulting change to that note's effective schema, evaluated through the field operations above.
- After a migration operation is applied, every affected managed note MUST satisfy the Canonical Field Materialization rules on this page.
- A migration MUST NOT discard managed-note data silently; any operation that cannot preserve data MUST be reported for explicit resolution, as required by [Systems, Composition, and Evolution](systems-composition-evolution.md).
- A field whose name is changed by `rename_field` follows the managed-note field-name rules defined on this page; a rename whose target name violates those rules is invalid.

### Field Type Conversions

A `retype_field` migration changes a field's declared `type`. Conversions fall into three tiers, defined by the source type and target type pair.

Defined lossless conversions are always information-preserving and a tool MUST apply them automatically:

- `integer` to `number`, because every integer is a valid number.
- `date` to `text`, `time` to `text`, `datetime` to `text`, and `link` to `text`, because these types are stored as strings and the stored characters are unchanged.
- `tags` to `list` when the target `items.type` is `text`, because every tag value is a valid text item and the stored sequence is unchanged.
- any type to `any`, because `any` accepts any non-null value.

Conditional conversions are information-preserving only for values that already satisfy the target type and its constraints. A tool MUST apply a conditional conversion only when every affected stored value qualifies, and MUST otherwise report the field for explicit resolution:

- `number` to `integer`, when every value has no fractional component.
- `text` to `link`, and `text` to `date`, `time`, or `datetime`, when every value satisfies the target type's `format`.
- `list` to `tags`, when the source `items.type` is `text` and every item is a non-empty string.
- `any` to a concrete type, when every value satisfies that type.

Rules:

- Any source and target type pair not listed above MUST be reported for explicit resolution and MUST NOT be coerced destructively.
- A conversion changes only the stored representation; after conversion, each value MUST satisfy the new field definition's constraints under the rules on this page, and a value that fails is reported rather than silently altered.
- A conversion to a non-nullable target MUST NOT introduce `null`; a value that cannot be converted to a conforming non-null value is reported for explicit resolution.
