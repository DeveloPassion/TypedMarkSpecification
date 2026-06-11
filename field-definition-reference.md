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
- every field-definition property: human-facing metadata, constraints, generation, uniqueness, immutability, relationship contribution, and vocabulary references

See also:

- [Foundations](foundations.md): the shared expression language, parsing baselines, and string comparison
- [Managed Notes and Properties](managed-notes-and-properties.md): the managed note contract, field names, core-defined fields, materialization, and optionality
- [Note Links](note-links.md): the link forms and resolution used by `format: note_link` fields
- [Collection Model](collection-model.md): property sets and vocabularies

## Frontmatter Property Types

Every field definition is a YAML mapping. Every field definition MUST declare `type`, and it MAY declare additional field-definition properties such as `label`, `description`, `icon`, `format`, `generated`, `computed`, `unique`, `deprecated`, `immutable`, `optional`, `nullable`, `default_value`, `validate_exists`, `not_empty`, `not_blank`, `regex`, `min`, `max`, and `allowed_values`.

## Field Definition Property Reference

Rules:

- `FDR-1` Field-definition properties apply to top-level fields, to `list.items`, and recursively to nested fields inside `object.fields` unless a type-specific rule says otherwise.
- `FDR-2` Human-facing field metadata MUST NOT change field identity, storage keys, type validation, optionality semantics, relationship semantics, or materialization behavior.
- `FDR-3` Constraint properties other than `nullable` and `optional` are evaluated only when the stored value is non-null.
- `FDR-4` A non-null `default_value` MUST satisfy all declared field constraints.

### `type`

Rules:

- `FDR-5` `type` is REQUIRED on every field definition.
- `FDR-6` Supported `type` values are `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, `link`, `list`, `tags`, `object`, and `any`.
- `FDR-7` Field definitions MUST NOT use unknown property types.
- `FDR-8` `text` values MUST be YAML strings.
- `FDR-9` `integer` values MUST be YAML numbers with no fractional component.
- `FDR-10` Markdown syntax inside property values has no special meaning.
- `FDR-11` `number` values MUST be YAML numbers.
- `FDR-12` `checkbox` values MUST be either `true` or `false`.
- `FDR-13` `date` MUST use RFC 3339 full-date format `YYYY-MM-DD`.
- `FDR-14` `time` values MUST be YAML strings and MUST match the declared time `format`.
- `FDR-15` `datetime` MUST use RFC 3339 date-time format with seconds and an explicit timezone designator such as `Z` or `+02:00`.
- `FDR-16` `date` and `time` values are floating: they carry no timezone and denote a calendar date or wall-clock time as written; when a rule needs to place them in time, they are interpreted in the collection timezone defined in [Collection Model](collection-model.md).
- `FDR-17` `datetime` values denote exact instants: two `datetime` values are equal when they denote the same instant regardless of offset notation, and temporal ordering compares instants.
- `FDR-18` Because stored `datetime` values carry explicit offsets and `date` and `time` values are floating, no daylight-saving disambiguation is required; the only conversions this specification defines are instant-to-collection-timezone conversions, which are always well defined.
- `FDR-19` `link` values MUST be YAML strings and MUST follow the declared link `format`.
- `FDR-20` Stored `list` values MUST be YAML sequences.
- `FDR-21` `tags` values MUST be YAML sequences of tag strings.
- `FDR-22` `tags` entries MUST be non-empty strings.
- `FDR-23` A `tags` entry is one or more segments joined by single `/` separators; each segment MUST consist of Unicode letters, digits, underscores, and hyphens, and MUST NOT start with a hyphen. In the ECMA-262 dialect with the `u` flag: `^[\p{L}\p{N}_][\p{L}\p{N}_-]*(?:\/[\p{L}\p{N}_][\p{L}\p{N}_-]*)*$`.
- `FDR-24` `tags` entries MUST NOT include a leading `#`; the `#` prefix belongs to inline body syntax, which carries no structural meaning.
- `FDR-25` The `/` separator expresses hierarchy: `project/alpha` is a descendant of `project`. This specification assigns the separator that meaning but does not define controlled vocabularies or validate entries against a taxonomy.
- `FDR-26` Entries within one stored `tags` value MUST be unique under the string comparison rules defined in [Foundations](foundations.md); a duplicate entry is an `invalid_field_value` failure.
- `FDR-27` A `tags` entry that violates this grammar is an `invalid_field_value` failure.
- `FDR-28` Stored `object` values MUST be YAML mappings.
- `FDR-29` `any` values MAY be any non-null YAML value, and MAY be `null` only when `nullable: true`.
- `FDR-30` YAML scalar, sequence, and mapping values are all supported when they satisfy the declared property type.
- `FDR-31` A core-defined managed-note field name MAY still use a dedicated structured value only when this specification explicitly defines that field's contract.

### `items`

Rules:

- `FDR-32` `items` MAY appear only when `type: list`.
- `FDR-33` A field definition with `type: list` MUST declare `items`.
- `FDR-34` `items` MUST be a valid field definition.
- `FDR-35` `items` MUST NOT declare `default_value` because anonymous list elements are not materialized independently.
- `FDR-36` `items` MUST NOT declare `nullable` because list elements are not materialized independently.
- `FDR-37` `items` MUST NOT declare `immutable` because anonymous list elements are not tracked individually.
- `FDR-38` `items` MAY use any supported property type.
- `FDR-39` Fields with `type: tags` MUST NOT declare `items`.
- `FDR-40` Fields with `type: object` MUST NOT declare `items`.

### `fields`

Rules:

- `FDR-41` `fields` MAY appear only when `type: object`.
- `FDR-42` A field definition with `type: object` MUST declare `fields`.
- `FDR-43` `fields` MUST be a mapping, even when it is empty.
- `FDR-44` Nested field definitions inside `object.fields` follow the same type, materialization, and value-requirement rules as top-level field definitions unless a type-specific rule says otherwise.
- `FDR-45` Nested list and object properties are supported.

### `label`

Rules:

- `FDR-46` `label` MAY be omitted.
- `FDR-47` `label` is the human-facing name of the field and MUST NOT change the stored field key.
- `FDR-48` If present, `label` MUST be a non-empty string.

### `description`

Rules:

- `FDR-49` `description` MAY be omitted.
- `FDR-50` `description` is human-facing explanatory metadata for generated references, forms, and authoring interfaces.
- `FDR-51` If present, `description` MUST be a non-empty string.

### `icon`

Rules:

- `FDR-52` `icon` MAY be omitted.
- `FDR-53` `icon` is human-facing field metadata for generated references and applications.
- `FDR-54` If present, `icon` MUST be a non-empty string.
- `FDR-55` The core specification treats `icon` as opaque and does not standardize icon libraries or rendering behavior.

### `generated`

Rules:

- `FDR-56` `generated` MAY be omitted.
- `FDR-57` `generated` MUST be `false`, `true`, or a generation strategy.
- `FDR-58` If omitted, `generated` defaults to `false`.
- `FDR-59` A field is generated when `generated` is `true` or declares a generation strategy.
- `FDR-60` `generated: true` marks a field whose values are produced by tool-defined means this specification does not standardize, such as AI-written summaries.
- `FDR-61` A generation strategy makes value production portable: every conforming tool MUST produce values as the strategy defines.
- `FDR-62` `generated` does not make a field virtual. Generated fields still follow the same type validation, optionality, stored-frontmatter, and canonical materialization rules as other declared fields.
- `FDR-63` A generation strategy does not constrain stored values; validation of stored values uses only the field's declared type and constraints.
- `FDR-64` A field declaring a generation strategy MUST NOT declare `default_value`, `const_value`, or `value_from_schema`; the strategy is the field's defaulting behavior.
- `FDR-65` A generated value MUST satisfy the field's declared type and constraints; a schema MUST NOT combine a strategy with constraints the strategy's values cannot satisfy.
- `FDR-66` `items` MUST NOT declare a generation strategy, because anonymous list elements are not materialized independently; `generated` on `items` MUST be a boolean.
- `FDR-67` Deriving a value from other fields is not a generation strategy on `generated`; sibling-field derivation uses `computed`, defined below.

Supported generation strategies:

- `FDR-68` `now` is valid for `date`, `time`, and `datetime` fields. When a tool creates the note, or first materializes the field without a concrete value, it MUST set the field to the current instant in the collection timezone defined in [Collection Model](collection-model.md), rendered according to the field's type and declared `format`; generated `datetime` values SHOULD carry the collection timezone's offset at that instant. The value is produced once: a tool MUST NOT overwrite an existing concrete non-null value.
- `FDR-69` `now_on_write` is valid for `date`, `time`, and `datetime` fields. Every tool that writes changes to the managed note MUST set the field to the current instant in the collection timezone as part of that write; the refresh itself does not count as a further change. A field with `now_on_write` MUST NOT declare `immutable: true`.
- `FDR-70` `uuid` is valid for `text` fields. The tool MUST generate an RFC 4122 version 4 UUID in lowercase form, once; it MUST NOT overwrite an existing concrete non-null value. Lowercase UUIDs satisfy `format: slug`, so `uuid` MAY be used for the core-defined `id` field.
- `FDR-71` `ulid` is valid for `text` fields. The tool MUST generate a ULID written in lowercase, so the value satisfies `format: slug`, once; it MUST NOT overwrite an existing concrete non-null value.
- `FDR-72` `{ random: n }` is valid for `text` fields. `random` MUST be a positive integer. The tool MUST generate `n` characters drawn uniformly from the lowercase letters `a` through `z` and the digits `0` through `9`, once; it MUST NOT overwrite an existing concrete non-null value.
- `FDR-73` `{ sequence: { start, scope } }` is valid for `integer` fields. `start` MAY be omitted and defaults to `1`; `scope` MAY be omitted, MUST be `note_type` or `collection` when present, and defaults to `note_type`. The generated value is one greater than the highest stored value of this field across the managed notes in scope, or `start` when no stored value exists; `note_type` scope spans managed notes of the same note type and `collection` scope spans all managed notes. The value is produced once: a tool MUST NOT overwrite an existing concrete non-null value.

Generation behavior rules:

- `FDR-74` Tools that create, scaffold, or import managed notes MUST apply every declared generation strategy before writing the note.
- `FDR-75` Generation alone guarantees no uniqueness: random values MAY collide and hard deletion MAY free sequence values. When the field also declares `unique`, the tool MUST verify the generated value against the field's uniqueness scope and regenerate on collision.
- `FDR-76` A note authored without a tool MAY lack generated values; the field's normal optionality and nullability rules decide whether the note conforms, and a tool that later normalizes the note MUST generate the missing values of once-produced strategies.
- `FDR-77` The once-produced strategies pair naturally with `immutable: true` when manual edits should be prevented as well.

### `computed`

`computed` defines a stored text field whose value is derived from sibling frontmatter fields instead of being authored directly. Unlike `generated`, it is not about value origination from time, randomness, identity, or tool-specific automation; it is the single schema-defined mechanism for sibling-field derivation in this specification version. It uses the shared text-template expression context defined in [Foundations](foundations.md).

Example:

```yaml
first_name:
  type: text
  nullable: false
last_name:
  type: text
  nullable: false
full_name:
  type: text
  computed: '${capitalize(first_name)} ${capitalize(last_name)}'
  nullable: false
```

Rules:

- `FDR-218` `computed` MAY be omitted.
- `FDR-219` If present, `computed` MUST be a non-empty string in the shared text-template expression context defined in [Foundations](foundations.md).
- `FDR-220` `computed` MAY be declared only on top-level frontmatter fields.
- `FDR-221` `computed` is the single schema-defined mechanism for deriving a field value from sibling fields of the same managed note.
- `FDR-222` `generated` and `computed` are distinct: `generated` covers value origination without sibling-field inputs; `computed` covers sibling-field derivation.
- `FDR-223` A field declaring `computed` MUST declare `type: text`.
- `FDR-224` A field declaring `computed` MUST NOT declare `generated`, `default_value`, `const_value`, or `value_from_schema`; the computed expression is the field's materialization behavior.
- `FDR-225` A field declaring `computed` MUST NOT declare `immutable: true`, because its stored value is recomputed from its dependencies.
- `FDR-226` `computed` does not make a field virtual. Computed fields still follow the same type validation, optionality, stored-frontmatter, and canonical materialization rules as other declared fields.
- `FDR-227` For `computed`, the shared expression-language scope is the managed note's sibling top-level fields in the effective `frontmatter`.
- `FDR-228` Every reference name used by a `computed` expression MUST resolve to a sibling top-level field declared in the same effective `frontmatter`, and MUST NOT resolve to the declaring field itself or to a field that itself declares `computed`.
- `FDR-229` Every field referenced by a `computed` expression MUST declare `type: text`.
- `FDR-230` `computed` uses the shared expression-language syntax and shared transform semantics defined in [Foundations](foundations.md); it defines no local syntax extensions.
- `FDR-231` A `computed` expression is evaluated against the managed note's materialized sibling-field values after non-computed defaults, schema-derived values, and generation strategies have been applied.
- `FDR-232` Every referenced field MUST hold a concrete non-null string when the `computed` expression is evaluated; otherwise the computed field has no conforming value and MUST be reported as `invalid_field_value`.
- `FDR-233` Tools that create, scaffold, import, normalize, or otherwise write managed-note frontmatter MUST evaluate every `computed` expression and store the resulting value before writing the note.
- `FDR-234` A stored computed value MUST equal the result of its `computed` expression; a mismatch is an `invalid_field_value` failure.
- `FDR-235` The computed result MUST satisfy the field's declared constraints; a schema MUST NOT combine `computed` with constraints its expression cannot satisfy.
- `FDR-236` `computed` MUST NOT depend on the note body, resolved note links, query results, collection-global state, or any data outside the sibling-field scope defined above.
- `FDR-237` A `computed` field whose stored value disagrees with its evaluated expression is a note-level `invalid_field_value` failure, not a schema-shape failure.
- `FDR-238` A syntactically invalid shared expression, an unresolved sibling-field reference, a type-incompatible reference, or an unknown transform name makes the declaring artifact invalid.

### `unique`

Rules:

- `FDR-78` `unique` MAY be omitted.
- `FDR-79` `unique` MUST be a boolean or the string `collection`.
- `FDR-80` If omitted, `unique` defaults to `false`.
- `FDR-81` `unique` MAY be declared only on top-level frontmatter fields.
- `FDR-82` `unique: true` and `unique: collection` are valid only for scalar field types: `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, and `link`.
- `FDR-83` `unique: true` means every non-null stored value for that field MUST be distinct across all managed notes of the same note type.
- `FDR-84` `unique: collection` means every non-null stored value for that field MUST be distinct across all managed notes in the collection, regardless of note type, comparing fields that share this field name.
- `FDR-85` Uniqueness is evaluated using exact stored-value equality after normal YAML parsing, under the string comparison rules defined in [Foundations](foundations.md), not by note-link resolution.
- `FDR-86` Multiple `null` values do not violate uniqueness.
- `FDR-87` A repeated non-null value for a field with `unique: true` is a `duplicate_unique_value` validation failure, as defined in [Collection Model](collection-model.md).
- `FDR-88` If a unique value may be assigned later, the RECOMMENDED pattern is `nullable: true` with `default_value: null`.

### `deprecated`

Rules:

- `FDR-89` `deprecated` MAY be omitted.
- `FDR-90` `deprecated` MUST be a boolean.
- `FDR-91` If omitted, `deprecated` defaults to `false`.
- `FDR-92` `deprecated: true` marks a field as discouraged for new use.
- `FDR-93` A deprecated field remains valid and governed by the same type validation, optionality, defaulting, stored-frontmatter, and canonical materialization rules as any other declared field.
- `FDR-94` This specification version does not define replacement mappings, migration behavior, or automatic validator severities for deprecated fields.

### `immutable`

Rules:

- `FDR-95` `immutable` MAY be omitted.
- `FDR-96` `immutable` MUST be a boolean.
- `FDR-97` If omitted, `immutable` defaults to `false`.
- `FDR-98` `immutable: true` means that once the field holds a concrete non-null stored value, that value MUST NOT change.
- `FDR-99` Immutability is an obligation on tools and operations that modify managed notes; because conformance evaluation is stateless, a validator MAY verify immutability only when it has access to historical state.
- `FDR-100` A `rename_field` migration moves an immutable value unchanged; a `change_field` migration MAY change a field's `immutable` declaration.
- `FDR-101` `const_value` and `value_from_schema` are stronger guarantees than `immutable`; a field declaring either need not also declare `immutable`.
- `FDR-102` The core-defined `id` field is immutable whether or not its definition declares it.
- `FDR-103` `immutable` MAY be declared on top-level fields and on nested fields inside `object.fields`; it MUST NOT be declared on `items`.

### `optional`

Rules:

- `FDR-104` `optional` MAY be omitted.
- `FDR-105` `optional` MUST be a boolean.
- `FDR-106` If omitted, `optional` defaults to `false`.
- `FDR-107` `optional` defines value requirements, not sparse-storage behavior.
- `FDR-108` A field with `optional: true` MUST be nullable in the effective schema.
- `FDR-109` A schema MUST NOT yield a field definition with `optional: true` and `nullable: false`.
- `FDR-110` Fields with `optional: true` are semantically OPTIONAL, not sparse.
- `FDR-111` Fields with `optional: true` MAY remain `null` indefinitely when materialized.

### `nullable`

Rules:

- `FDR-112` `nullable` MAY be omitted.
- `FDR-113` `nullable` MUST be a boolean.
- `FDR-114` If `optional: false` and `nullable` is omitted, `nullable` defaults to `false`.
- `FDR-115` If `optional: true` and `nullable` is omitted, `nullable` defaults to `true`.
- `FDR-116` A field with `nullable: true` MAY explicitly use the value `null`.
- `FDR-117` If a field is not nullable and no explicit value or `default_value` is available, the field still MUST be present and the note MUST be treated as non-conforming until a conforming concrete value is supplied.

### `default_value`

Rules:

- `FDR-118` `default_value` MAY be used on any field definition that does not declare a generation strategy, as defined under `generated`.
- `FDR-119` `default_value` MUST conform to the declared field type, or MAY be `null` only when `nullable: true`.
- `FDR-120` `default_value` applies during field materialization when the field has no explicit concrete value.
- `FDR-121` An explicit `null` value is distinct from an absent field and MUST NOT be replaced by `default_value`.
- `FDR-122` `default_value` does not waive the physical presence requirement for declared fields.
- `FDR-123` If `nullable: true` and no explicit `default_value` is provided, the implicit materialization default is `null`.
- `FDR-124` The RECOMMENDED pattern for a field that MUST always be present but MAY have no concrete value is `nullable: true` with `default_value: null`.

### `relationship_kind`

Rules:

- `FDR-125` `relationship_kind` MAY be omitted.
- `FDR-126` If present, `relationship_kind` MUST be either `belongs_to` or `related_to`.
- `FDR-127` `relationship_kind` MAY be declared only on top-level frontmatter fields.
- `FDR-128` A field with `relationship_kind` MUST have `type: link` and `format: note_link`, or `type: list` whose `items.type` is `link` and `items.format` is `note_link`.
- `FDR-129` A field without `relationship_kind` MAY still use `format: note_link`, but it does not contribute to typed relationship conformance.
- `FDR-130` The semantics of `relationship_kind` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### `format`

Rules:

- `FDR-131` `format` MAY be omitted.
- `FDR-132` Supported `format` values are `slug`, `note_link`, `uri`, `hh:mm`, `hh:mm:ss`, and `hh:mm:ss.sss`.
- `FDR-133` `type: link` MUST declare `format`.
- `FDR-134` `type: time` MUST declare `format`.
- `FDR-135` `format: slug` is valid only for `type: text` or `list.items.type: text`.
- `FDR-136` `format: note_link` is valid only for `type: link` or `list.items.type: link`.
- `FDR-137` `format: uri` is valid only for `type: link` or `list.items.type: link`.
- `FDR-138` `format: hh:mm`, `format: hh:mm:ss`, and `format: hh:mm:ss.sss` are valid only for `type: time` or `list.items.type: time`.
- `FDR-139` Values with `format: slug` MUST match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `FDR-140` Values with `format: uri` MUST be absolute URIs with a non-empty scheme and valid syntax according to RFC 3986. Relative references MUST NOT be used.
- `FDR-141` Values with `format: note_link` MAY be the empty string as an explicit placeholder when no concrete link is known.
- `FDR-142` Non-empty values with `format: note_link` MUST use the note-link syntax and resolution rules defined in [Note Links](note-links.md).
- `FDR-143` An empty-string value with `format: note_link` does not resolve to a managed note and does not contribute to relationship conformance.
- `FDR-144` Values with `format: hh:mm` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d$`.
- `FDR-145` Values with `format: hh:mm:ss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$`.
- `FDR-146` Values with `format: hh:mm:ss.sss` on `type: time` or `list.items.type: time` MUST use a 24-hour clock and match `^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$`.

### `validate_exists`

Rules:

- `FDR-147` `validate_exists` MAY be omitted.
- `FDR-148` `validate_exists` MUST be a boolean.
- `FDR-149` If omitted, `validate_exists` defaults to `false`.
- `FDR-150` `validate_exists` is valid only on field definitions that declare `format: note_link`, including `list.items`.
- `FDR-151` `validate_exists: true` means every non-empty stored note-link value MUST resolve to exactly one existing collection note under the note-link resolution rules defined in [Note Links](note-links.md).
- `FDR-152` An empty-string placeholder value does not violate `validate_exists`; combine it with `not_empty: true` to forbid placeholders entirely.
- `FDR-153` A non-empty value that does not resolve violates `validate_exists` and is reported as `invalid_note_link`.
- `FDR-154` `validate_exists` does not change relationship counting; unresolved placeholders already fail minimum-cardinality requirements.

### `targets`

Rules:

- `FDR-155` `targets` MAY be omitted.
- `FDR-156` If present, `targets` MUST be a non-empty list of unique note-type identifiers.
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

- `FDR-165` `not_empty` MAY be omitted.
- `FDR-166` `not_empty` MUST be a boolean.
- `FDR-167` If omitted, `not_empty` defaults to `false`.
- `FDR-168` `not_empty: true` is valid only for `type: text`, `type: link`, `type: list`, `type: tags`, or `type: object`.
- `FDR-169` For `type: text` and `type: link`, `not_empty: true` means the stored string MUST NOT be `""`.
- `FDR-170` For `type: list` and `type: tags`, `not_empty: true` means the stored sequence MUST contain at least one item.
- `FDR-171` For `type: object`, `not_empty: true` means the stored mapping MUST contain at least one key.

### `not_blank`

Rules:

- `FDR-172` `not_blank` MAY be omitted.
- `FDR-173` `not_blank` MUST be a boolean.
- `FDR-174` If omitted, `not_blank` defaults to `false`.
- `FDR-175` `not_blank: true` is valid only for `type: text` or `type: link`.
- `FDR-176` `not_blank: true` means the stored string MUST contain at least one non-whitespace character.
- `FDR-177` `not_blank: true` is stronger than `not_empty: true`.

### `regex`

Rules:

- `FDR-178` `regex` MAY be omitted.
- `FDR-179` `regex` MUST be a non-empty string.
- `FDR-180` `regex` is valid only for `type: text` or `type: link`.
- `FDR-181` `regex` is matched against the entire stored string value.
- `FDR-182` `regex` patterns use the ECMA-262 regular expression dialect defined in [Foundations](foundations.md).

### `min`

Rules:

- `FDR-183` `min` MAY be omitted.
- `FDR-184` `min` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- `FDR-185` For `type: text` and `type: link`, `min` constrains string length in Unicode code points and MUST be a non-negative integer.
- `FDR-186` For `type: list` and `type: tags`, `min` constrains item count and MUST be a non-negative integer.
- `FDR-187` For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `min` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- `FDR-188` For `type: date`, `type: time`, and `type: datetime`, `min` comparison uses temporal ordering, not raw string comparison.

### `max`

Rules:

- `FDR-189` `max` MAY be omitted.
- `FDR-190` `max` is valid only for `type: text`, `type: link`, `type: integer`, `type: number`, `type: date`, `type: time`, `type: datetime`, `type: list`, or `type: tags`.
- `FDR-191` For `type: text` and `type: link`, `max` constrains string length in Unicode code points and MUST be a non-negative integer.
- `FDR-192` For `type: list` and `type: tags`, `max` constrains item count and MUST be a non-negative integer.
- `FDR-193` For `type: integer`, `type: number`, `type: date`, `type: time`, and `type: datetime`, `max` constrains the stored value itself and MUST conform to the declared field type and `format` when applicable.
- `FDR-194` For `type: date`, `type: time`, and `type: datetime`, `max` comparison uses temporal ordering, not raw string comparison.
- `FDR-195` If both `min` and `max` are present, `min` MUST be less than or equal to `max`.

### `allowed_values`

Rules:

- `FDR-196` `allowed_values` MAY be omitted.
- `FDR-197` `allowed_values` MUST be a non-empty list of unique scalar values.
- `FDR-198` For scalar field types, `allowed_values` entries MUST be compatible with the declared property `type`.
- `FDR-199` For `type: list`, `allowed_values` is valid only when `items.type` is one of `text`, `integer`, `number`, `checkbox`, `date`, `time`, `datetime`, or `link`, and each `allowed_values` entry MUST be compatible with that item type.
- `FDR-200` For `type: list`, every stored item value MUST be one of the declared `allowed_values`.
- `FDR-201` `allowed_values` MUST NOT be used with `type: tags`, `type: object`, or `type: any`.
- `FDR-202` Text and link `allowed_values` comparisons are case-sensitive and use exact string equality under the string comparison rules defined in [Foundations](foundations.md).
- `FDR-203` Non-text scalar `allowed_values` comparisons use exact scalar equality after normal YAML parsing and type validation.

### `allowed_values_from`

Rules:

- `FDR-204` `allowed_values_from` MAY be omitted.
- `FDR-205` If present, `allowed_values_from` MUST be a non-empty slug naming a vocabulary defined in `typedmark.md` `vocabularies`, as defined in [Collection Model](collection-model.md); a reference that does not resolve makes the declaring artifact invalid.
- `FDR-206` `allowed_values_from` and `allowed_values` MUST NOT both be present on the same field definition.
- `FDR-207` `allowed_values_from` is valid wherever `allowed_values` is valid, and additionally on `type: tags`.
- `FDR-208` For every type except `tags`, `allowed_values_from` has the same semantics as declaring `allowed_values` with the referenced vocabulary's values.
- `FDR-209` For `type: tags`, every stored entry MUST equal a vocabulary value or be a descendant of one under the tag hierarchy rules; an entry outside the vocabulary is an `invalid_field_value` failure.

### `const_value`

Rules:

- `FDR-210` `const_value` MAY be omitted.
- `FDR-211` `const_value` MUST conform to the declared property type.
- `FDR-212` `const_value` and `value_from_schema` MUST NOT both be present on the same field definition.
- `FDR-213` If `const_value` is present, the stored value MUST equal it exactly.

### `value_from_schema`

Rules:

- `FDR-214` `value_from_schema` MAY be omitted.
- `FDR-215` The only supported `value_from_schema` value in this specification version is `note_type`.
- `FDR-216` `value_from_schema: note_type` means the constant value is taken from the note type identifier of the schema currently being evaluated.
- `FDR-217` If `value_from_schema` is present, the stored value MUST equal the derived schema value exactly.

