---
title: Field Definition Reference
parent: TypedMark
nav_order: 7
audience: essentials
---

# Field Definition Reference

Audience: collection authors.

Authoritative for:

- frontmatter property types
- core field-definition properties: human-facing metadata, constraints, generation and materialization, uniqueness, relationship contribution, and vocabulary references

See also:

- [Foundations](foundations.md): the shared expression language, parsing baselines, and string comparison
- [Managed Notes and Properties](managed-notes-and-properties.md): the managed note contract, field names, core-defined fields, materialization, and optionality
- [Note Links](note-links.md): the link forms and resolution used by `format: note_link` fields
- [Collection Model](collection-model.md): property sets and vocabularies
- [Field Compatibility and Conversion](field-conversions.md): the shared optional conversion contract
- [Expressions](expressions.md): computed field definitions and sibling-field derivation
- [Authoring](authoring.md): immutable fields and additional optional generation strategies

## Frontmatter Property Types

Field definitions are mappings with `type` and the applicable properties below.
Core value validation is independent of optional expression or authoring
contracts.

Property applicability at a glance:

| Property | Applies to | Default or key restriction |
| --- | --- | --- |
| `type` | every field definition | physically required |
| `items` | `list` | required for lists; absent elsewhere |
| `fields` | `object` | required for objects; absent elsewhere |
| `label`, `description`, `icon` | any declared field | optional human-facing metadata |
| `generated` | declared fields | `false`; strategies are unavailable on anonymous `items`; [additional strategies](authoring.md#additional-generation-strategies) |
| [`computed`](expressions.md#computed) | top-level `text` fields | sibling-field derivation only |
| `unique` | top-level scalar fields | `false`; per-note-type or collection scope |
| `deprecated` | declared fields | `false` |
| [`immutable`](authoring.md#immutable) | top-level and nested object fields | `false`; unavailable on anonymous `items` |
| `nullable` | declared fields except anonymous `items` | `false`, subject to the dedicated Core-field contract |
| `default_value` | declared fields except anonymous `items` | unavailable with generation strategies or `computed` |
| `relationship_kind` | top-level note-link fields | `belongs_to` or `related_to` |
| `format` | `text`, `link`, and `time` where supported | required for `link` and `time` |
| `validate_exists`, `targets` | note-link definitions | `false` / absent |
| `not_empty` | object | `false` |
| `not_blank`, `regex` | text and link | `false` / absent |
| `min`, `max` | scalar, temporal, list, and tags types listed below | absent |
| `allowed_values`, `allowed_values_from` | supported scalar/list types; vocabularies additionally support tags | mutually exclusive |
| `const_value` | declared fields | absent; unavailable with `computed` or a generation strategy |

Property representation:

| Properties | Present-value shape |
| --- | --- |
| `label`, `description`, `icon`, `regex` | Non-empty string |
| `nullable`, `deprecated`, `validate_exists`, `not_empty`, `not_blank` | Boolean |
| `unique` | Boolean or `collection` |
| `relationship_kind` | `belongs_to` or `related_to` |
| `generated` | `false` or a supported strategy; `now_on_write` excludes `immutable: true` |
| `targets` | Non-empty list of unique note-type slugs |
| `min`, `max` | Scalar bound or count as defined below |
| `allowed_values` | Non-empty list of unique scalar values |
| `allowed_values_from` | Vocabulary slug |

Rules:

- `FDR-285` A field property MAY be omitted unless its type or dedicated contract requires it.
- `FDR-286` Present field properties MUST satisfy their representation and applicability tables.
- `FDR-287` Omitted properties MUST use the table's effective default or contribute no constraint when no default is defined.

## Field Definition Property Reference

Rules:

- `FDR-1` Field-definition properties apply to top-level fields, to `list.items`, and recursively to nested fields inside `object.fields` unless a type-specific rule says otherwise.
- `FDR-2` Human-facing field metadata MUST NOT change field identity, types, constraints, relationships, or materialization.
- `FDR-3` Value constraints other than nullability apply only to non-null effective values.
- `FDR-4` A non-null `default_value` MUST satisfy all declared field constraints.

### Field Value Equality

Several field features compare values. These rules define one type-aware equality model so uniqueness, constants, and allowed values cannot disagree.

Rules:

- `FDR-239` Every field-value comparison that this page defines as exact equality MUST compare parsed values under the declared field definition.
- `FDR-240` `text` and `link` strings are equal when their NFC-normalized code points are equal with case preserved.
- `FDR-241` `integer` and `number` values are equal when their numeric values are equal, and `checkbox` values are equal when their boolean values are equal.
- `FDR-242` `date` and `time` values are equal when they denote the same calendar date or wall-clock time, and `datetime` values are equal when they denote the same instant regardless of offset notation.
- `FDR-243` `list` and `tags` values are equal when they have the same length and their entries are pairwise equal in sequence order under the applicable item definition.
- `FDR-244` `object` values are equal when they have the same keys and their field values are equal recursively; `any` values use the same scalar, sequence, and mapping equality rules recursively after YAML parsing.

### Field Compatibility and Conversion

The shared [conversion contract](field-conversions.md#field-compatibility-and-conversion)
is authoritative on its own page and is used by both queries and migrations.

### `type`

Rules:

- `FDR-5` `type` is REQUIRED on every field definition.
- `FDR-6` Supported `type` values are `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, `link`, `list`, `tags`, `object`, and `any`.
- `FDR-7` Field definitions MUST NOT use unknown property types.
- `FDR-8` `text` values MUST be YAML strings.
- `FDR-9` `integer` values MUST be YAML numbers with no fractional component.
- `FDR-11` `number` values MUST be YAML numbers.
- `FDR-12` `checkbox` values MUST be either `true` or `false`.
- `FDR-13` `date` MUST use RFC 3339 full-date format `YYYY-MM-DD`.
- `FDR-14` `time` values MUST be YAML strings and MUST match the declared time `format`.
- `FDR-15` A datetime MUST contain a valid `YYYY-MM-DDTHH:mm` value, optionally followed by seconds, fractional seconds when seconds are present, and a timezone designator `Z` or `+HH:mm` / `-HH:mm`.
- `FDR-281` Omitted datetime seconds MUST be interpreted as zero.
- `FDR-282` A datetime without an explicit offset MUST be interpreted in the collection timezone.
- `FDR-283` A floating datetime in a daylight-saving gap or overlap MUST be rejected unless an explicit offset disambiguates its instant.
- `FDR-284` An explicit datetime offset MUST determine the represented instant independently of the collection timezone.
- `FDR-16` `date` and `time` values are floating: they carry no timezone and denote a calendar date or wall-clock time as written; when a rule needs to place them in time, they are interpreted in the collection timezone defined in [Collection Model](collection-model.md).
- `FDR-19` `link` values MUST be YAML strings and MUST follow the declared link `format`.
- `FDR-20` Stored `list` values MUST be YAML sequences.
- `FDR-21` `tags` values MUST be YAML sequences of tag strings.
- `FDR-22` `tags` entries MUST be non-empty strings.
- `FDR-23` A `tags` entry is one or more segments joined by single `/` separators; each segment MUST consist of Unicode letters, digits, underscores, and hyphens, and MUST NOT start with a hyphen. In the ECMA-262 dialect with the `u` flag: `^[\p{L}\p{N}_][\p{L}\p{N}_-]*(?:\/[\p{L}\p{N}_][\p{L}\p{N}_-]*)*$`.
- `FDR-24` `tags` entries MUST NOT include a leading `#`; the `#` prefix belongs to inline body syntax, which carries no structural meaning.
- `FDR-25` The `/` separator expresses hierarchy; explicit vocabulary constraints remain governed by `allowed_values_from`.
- `FDR-26` Entries within one stored `tags` value MUST be unique under the string comparison rules defined in [Foundations](foundations.md); a duplicate entry is an `invalid_field_value` failure.
- `FDR-27` A `tags` entry that violates this grammar is an `invalid_field_value` failure.
- `FDR-28` Stored `object` values MUST be YAML mappings.
- `FDR-29` `any` values MAY be any non-null YAML value, and MAY be `null` only when `nullable: true`.

### `items`

Rules:

- `FDR-33` A field definition with `type: list` MUST declare `items`.
- `FDR-35` `items` MUST NOT declare `default_value` because anonymous list elements are not materialized independently.
- `FDR-36` `items` MUST NOT declare `nullable` because list elements are not materialized independently.
- `FDR-37` `items` MUST NOT declare `immutable` because anonymous list elements are not tracked individually.

### `fields`

Rules:

- `FDR-42` A field definition with `type: object` MUST declare `fields`.

### `label`

Shapes and defaults follow the shared property tables.

### `description`

Shapes and defaults follow the shared property tables.

### `icon`

Rules:

- `FDR-55` The core specification treats `icon` as opaque and does not standardize icon libraries or rendering behavior.

### `generated`

Rules:

- `FDR-57` `generated` MUST be `false` or a supported generation strategy.
- `FDR-59` A field is generated when it declares a supported generation strategy.
- `FDR-62` Generated fields follow the effective-value and sparse-storage contract in [Managed Notes and Properties](managed-notes-and-properties.md).
- `FDR-63` A generation strategy does not constrain stored values; validation of stored values uses only the field's declared type and constraints.
- `FDR-64` A field declaring a generation strategy MUST NOT declare `default_value` or `const_value`.
- `FDR-65` A generated value MUST satisfy the field's declared type and constraints; a schema MUST NOT combine a strategy with constraints the strategy's values cannot satisfy.
- `FDR-66` Anonymous `items` MUST NOT declare a generation strategy.
- `FDR-67` Sibling-field derivation uses the optional [Expressions](expressions.md) contract rather than a generation strategy.

Supported generation strategies:

- `FDR-68` `now` and `now_on_write` are valid for `date`, `time`, and `datetime` fields.
- `FDR-245` Producing a `now` value for an absent field or template placeholder MUST use the current instant in the collection timezone.
- `FDR-246` A tool MUST render a `now` value according to the field's declared type and `format`.
- `FDR-247` A generated `datetime` value SHOULD carry the collection timezone's offset at the generated instant.
- `FDR-248` A tool MUST NOT overwrite an existing concrete non-null value of a `now` field.
- `FDR-69` A semantic write MUST refresh a concrete `now_on_write` value, or materialize an absent declared one, using the collection timezone; explicit null preservation follows Managed Notes.
- `FDR-70` `uuid` is valid for `text` fields. The tool MUST generate an RFC 4122 version 4 UUID in lowercase form, once; it MUST NOT overwrite an existing concrete non-null value. Lowercase UUIDs satisfy `format: slug`, so `uuid` MAY be used for the core-defined `id` field.

Additional optional generation strategies are defined in
[Authoring](authoring.md#additional-generation-strategies).

Generation behavior rules:

- `FDR-74` Creation, scaffolding, and import MUST apply declared generators to absent values or template placeholders, respecting the explicit-value contract in [Managed Notes](managed-notes-and-properties.md).
- `FDR-75` Generation alone guarantees no uniqueness: random values MAY collide and hard deletion MAY free sequence values. When the field also declares `unique`, the tool MUST verify the generated value against the field's uniqueness scope and regenerate on collision.
- `FDR-76` Read-only conformance of a missing generated field MUST follow the effective-value rules without executing the generator.

### `computed`

Stored sibling-field derivation is defined in [Expressions](expressions.md#computed).

### `unique`

Rules:

- `FDR-81` `unique` MAY be declared only on top-level frontmatter fields.
- `FDR-82` `unique: true` and `unique: collection` are valid only for scalar field types: `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, and `link`.
- `FDR-83` `unique: true` requires distinct non-null effective values among managed notes of the same type.
- `FDR-84` `unique: collection` requires distinct non-null effective values among same-named fields with the same property type across managed notes in the collection.
- `FDR-85` Uniqueness is evaluated using the type-aware Field Value Equality rules on this page, not by note-link resolution.

### `deprecated`

Rules:

- `FDR-92` `deprecated: true` marks a field as discouraged for new use.
- `FDR-93` A deprecated field remains valid and governed by the same effective-value validation and writing rules as any other declared field.

### `immutable`

Immutable field semantics are defined in [Authoring](authoring.md#immutable).

### `optional`

The former `optional` property is not part of `0.1.0`. Nullability controls
null values; the managed-note contract controls omission. Migration preserves
an old implicit nullable value explicitly before removing `optional`.

### `nullable`

Rules:

- `FDR-116` A field with `nullable: true` MAY explicitly use the value `null`.

### `default_value`

Rules:

- `FDR-118` `default_value` MAY be used on any field definition that does not declare a generation strategy, as defined under `generated`.
- `FDR-119` `default_value` MUST conform to the declared field type, or MAY be `null` only when `nullable: true`.
- `FDR-120` `default_value` applies to an absent field during effective-value construction.
- `FDR-121` An explicit `null` value is distinct from an absent field and MUST NOT be replaced by `default_value`.
- `FDR-123` An absent nullable field without an explicit default has effective value `null`.

### `relationship_kind`

Rules:

- `FDR-127` `relationship_kind` MAY be declared only on top-level frontmatter fields.
- `FDR-128` A field with `relationship_kind` MUST have `type: link` and `format: note_link`, or `type: list` whose `items.type` is `link` and `items.format` is `note_link`.

### `format`

Rules:

- `FDR-132` Supported `format` values are `slug`, `note_link`, `uri`, `hh:mm`, `hh:mm:ss`, and `hh:mm:ss.sss`.
- `FDR-133` `type: link` MUST declare `format`.
- `FDR-134` `type: time` MUST declare `format`.
- `FDR-135` `format: slug` is valid only for `type: text` or `list.items.type: text`.
- `FDR-136` `format: note_link` is valid only for `type: link` or `list.items.type: link`.
- `FDR-137` `format: uri` is valid only for `type: link` or `list.items.type: link`.
- `FDR-138` `format: hh:mm`, `format: hh:mm:ss`, and `format: hh:mm:ss.sss` are valid only for `type: time` or `list.items.type: time`.
- `FDR-139` Values with `format: slug` MUST match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `FDR-140` Values with `format: uri` MUST be absolute URIs with a non-empty scheme and valid syntax according to RFC 3986. Relative references MUST NOT be used.
- `FDR-142` Non-null values with `format: note_link` MUST be non-empty strings using the syntax and resolution contract in [Note Links](note-links.md).
- `FDR-144` Values with `format: hh:mm` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d$`.
- `FDR-145` Values with `format: hh:mm:ss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$`.
- `FDR-146` Values with `format: hh:mm:ss.sss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$`.

### `validate_exists`

Rules:

- `FDR-150` `validate_exists` is valid only on field definitions that declare `format: note_link`, including `list.items`.
- `FDR-151` `validate_exists: true` means every non-empty stored note-link value MUST resolve to exactly one existing collection note under the note-link resolution rules defined in [Note Links](note-links.md).
- `FDR-153` A non-empty value that does not resolve violates `validate_exists` and is reported as `invalid_note_link`.

### `targets`

Rules:

- `FDR-157` `targets` is valid only on field definitions that declare `format: note_link`, including `list.items`.
- `FDR-158` Each identifier in `targets` MUST resolve to a note type defined in the collection; it MAY name an abstract note type.
- `FDR-159` An abstract note type in `targets` means any concrete note type that extends it directly or transitively.
- `FDR-160` A non-empty stored value that resolves to a managed note MUST resolve to a note whose concrete note type satisfies `targets`; a value resolving to an untyped note violates `targets`.
- `FDR-161` A `targets` violation is an `invalid_field_value` failure.
- `FDR-162` An unresolved value does not violate `targets`; existence is governed by `validate_exists`.
- `FDR-163` For values stored in a field declaring `targets`, the id, name, and alias passes of name-based resolution consider only managed notes whose concrete note type satisfies `targets`; path-formed targets resolve normally and are then validated against `targets`.
- `FDR-164` A relationship-bearing field MAY declare `targets`; its declared targets SHOULD be consistent with the type-level relationship declarations, and a resolved typed relationship instance is validated against both.

### `not_empty`

Rules:

- `FDR-168` `not_empty` MUST be used only on `object` fields.
- `FDR-171` Object `not_empty: true` requires at least one key in the effective mapping.

Text, link, list, and tags fields use `min: 1` for non-emptiness instead.

### `not_blank`

Rules:

- `FDR-175` `not_blank: true` is valid only for `type: text` or `type: link`.
- `FDR-176` `not_blank: true` means the stored string MUST contain at least one non-whitespace character.

### `regex`

Rules:

- `FDR-180` `regex` is valid only for `type: text` or `type: link`.
- `FDR-181` `regex` is matched against the entire stored string value.
- `FDR-182` `regex` patterns use the ECMA-262 regular expression dialect defined in [Foundations](foundations.md).

### `min`

Rules:

- `FDR-184` `min` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- `FDR-185` For `type: text` and `type: link`, `min` constrains string length in Unicode code points and MUST be a non-negative integer.
- `FDR-186` For `type: list` and `type: tags`, `min` constrains item count and MUST be a non-negative integer.
- `FDR-187` For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `min` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- `FDR-188` For `type: date`, `type: time`, and `type: datetime`, `min` comparison uses temporal ordering, not raw string comparison.

### `max`

Rules:

- `FDR-190` `max` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- `FDR-191` For `type: text` and `type: link`, `max` constrains string length in Unicode code points and MUST be a non-negative integer.
- `FDR-192` For `type: list` and `type: tags`, `max` constrains item count and MUST be a non-negative integer.
- `FDR-193` For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `max` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- `FDR-194` For `type: date`, `type: time`, and `type: datetime`, `max` comparison uses temporal ordering, not raw string comparison.
- `FDR-195` If both `min` and `max` are present, `min` MUST be less than or equal to `max`.

### `allowed_values`

Rules:

- `FDR-197` `allowed_values` MUST be a non-empty list of unique scalar values.
- `FDR-198` For scalar field types, `allowed_values` entries MUST be compatible with the declared property `type`.
- `FDR-199` For `type: list`, `allowed_values` is valid only when `items.type` is one of `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, or `link`, and each `allowed_values` entry MUST be compatible with that item type.
- `FDR-200` For `type: list`, every stored item value MUST be one of the declared `allowed_values`.
- `FDR-201` `allowed_values` MUST NOT be used with `type: tags`, `type: object`, or `type: any`.
- `FDR-202` Text and link `allowed_values` comparisons use the Field Value Equality rules on this page.
- `FDR-203` Non-text scalar `allowed_values` comparisons use the Field Value Equality rules after normal YAML parsing and type validation.

### `allowed_values_from`

Rules:

- `FDR-205` If present, `allowed_values_from` MUST be a non-empty slug naming a vocabulary defined in `typedmark.md` `vocabularies`, as defined in [Collection Model](collection-model.md); a reference that does not resolve makes the declaring artifact invalid.
- `FDR-206` `allowed_values_from` and `allowed_values` MUST NOT both be present on the same field definition.
- `FDR-207` `allowed_values_from` is valid wherever `allowed_values` is valid, and additionally on `type: tags`.
- `FDR-208` For every type except `tags`, `allowed_values_from` has the same semantics as declaring `allowed_values` with the referenced vocabulary's values.
- `FDR-209` For `type: tags`, every stored entry MUST equal a vocabulary value or be a descendant of one under the tag hierarchy rules; an entry outside the vocabulary is an `invalid_field_value` failure.

### `const_value`

Rules:

- `FDR-211` `const_value` MUST conform to the declared property type.
- `FDR-213` A non-null effective value constrained by `const_value` MUST equal it under Field Value Equality.

### `value_from_schema`

This former property is removed. Core supplies the associated `note_type`
without a redundant field declaration.
