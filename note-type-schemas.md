---
title: Note Type Schemas
parent: TypedMark
nav_order: 5
audience: essentials
---

# Note Type Schemas

Audience: collection authors.

Authoritative for:

- note type registration, abstract note types, and inheritance through `extends`
- the schema file contract, the effective note-type schema, and the evaluation pipeline
- conditional field constraints, schema kinds, note counts, and storage rules

See also:

- [Field Definition Reference](field-definition-reference.md): field-definition semantics
- [Managed Notes and Properties](managed-notes-and-properties.md): note-type association and the managed note contract
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationship, heading, and template semantics
- [Collection Model](collection-model.md): property-set definitions and composition

## Note Type Registry

The note type registry is implicit.

Rules:

- `NTS-1` Every Markdown file directly under `<metadata_directory>/schemas/` defines one note type; its frontmatter is the note-type schema, per the governed artifact format in [Foundations](foundations.md).
- `NTS-2` No separate registry file is maintained for note types.
- `NTS-3` A note type MUST NOT be defined in more than one schema file.
- `NTS-4` The schema file name without the `.md` extension MUST equal the schema's `note_type` value.
- `NTS-5` Every schema file MUST physically declare `abstract`.
- `NTS-6` If `abstract: true`, the schema defines an abstract note type.
- `NTS-7` If `abstract: false`, the schema defines a concrete note type.
- `NTS-8` A managed note MUST conform to exactly one concrete note type.
- `NTS-9` The conformance requirements that determine when schema files MUST exist are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

## Effective Note-Type Schema

A managed note is evaluated against one effective note-type schema.

The effective note-type schema is not a separate stored artifact. It is the normative result of taking one concrete note-type schema file, its abstract ancestor chain, and the default-property-set, property-set composition, and block-merge rules defined by this specification before evaluating note conformance.

A note type's own `frontmatter`, `relationships`, and `headings` blocks are not a separate kind of definition. They are the note type's inline, note-type-scoped property set, and they participate in the same composition as named property sets, applied last as its highest-precedence layer. Reusable fields belong in named property sets; one-off fields belong inline.

### Normative Evaluation Pipeline

Rules:

1. `NTS-10` A tool or validator MUST resolve the note's note type using the note-type association rules defined in [Managed Notes and Properties](managed-notes-and-properties.md) and MUST select exactly one concrete note-type schema file from `<metadata_directory>/schemas/` using that resolved identifier.
2. `NTS-11` If the selected concrete note type declares `extends`, the tool or validator MUST load the full abstract ancestor chain, starting with the farthest abstract ancestor and ending with the selected concrete note type.
3. `NTS-12` The selected concrete note-type schema file provides the direct top-level values for `specification_version`, `note_type`, `abstract`, `label`, `icon`, and `description`.
4. `NTS-13` For `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, and `count`, note-type inheritance uses whole-key replacement along the abstract ancestor chain. The last schema in that chain order that physically defines one of those keys determines the effective value of that key.
5. `NTS-14` The tool or validator MUST determine which property sets apply to the selected concrete note type by taking the `default_property_sets` declared in `typedmark.md`, removing any named in the concrete note type's `exclude_property_sets`, and then appending the property sets named in the concrete note type's `property_sets`, using the composition rules in [Collection Model](collection-model.md).
6. `NTS-15` The `frontmatter`, `relationships`, and `headings` blocks contributed by the applied default property sets MUST be applied first, in `default_property_sets` order.
7. `NTS-16` Local `frontmatter`, `relationships`, and `headings` blocks declared by abstract ancestors, if any, MUST be applied next in abstract-ancestor order using the merge rules defined in [Collection Model](collection-model.md).
8. `NTS-17` If `frontmatter_remove` is present on the selected concrete note type, it MUST be applied next to the accumulated inherited frontmatter.
9. `NTS-18` The `frontmatter`, `relationships`, and `headings` blocks contributed by the opt-in property sets named in `property_sets`, if any, MUST be applied next in the selected concrete schema's declared `property_sets` order, as defined in [Collection Model](collection-model.md).
10. `NTS-19` Local `frontmatter`, `relationships`, and `headings` definitions in the selected concrete note-type schema file MUST be applied last.
11. `NTS-20` The resulting `frontmatter`, `relationships`, and `headings` blocks, together with the direct top-level values from the selected concrete schema file and the effective inherited values of `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, and `count`, are the effective note-type schema for that note type.
12. `NTS-21` Managed-note, relationship, heading, template, and storage conformance MUST be evaluated against that effective note-type schema using the rule pages linked from this page.
13. `NTS-22` This specification MUST NOT be interpreted as requiring a separate serialized effective-schema artifact on disk.

### Schema File Contract

Each `<metadata_directory>/schemas/<note_type>.md` MUST define exactly one note type and MUST follow this shape when it defines a concrete note type:

```yaml
specification_version: 0.0.1
note_type: topic
abstract: false
label: Topic
icon: note
kind: entity
description: Durable note about a specific topic.

property_sets:
  - workflow

storage:
  folder_pattern: "Topics"
  note_name_pattern: "{title}"
  archive:
    policy: mirror_under_archives
    folder_pattern: "Archives/Topics"
    note_name_pattern: "{title}"

template:
  file: "topic.md"

frontmatter:
  note_type:
    type: text
    const_value: topic
  title:
    label: Title
    description: Human-readable note title.
    icon: text
    type: text
    not_blank: true
    nullable: false
  domain:
    label: Domain
    description: Domain note this topic belongs to.
    icon: folder
    type: link
    format: note_link
    nullable: false
    default_value: ""
    relationship_kind: belongs_to
  sources:
    label: Sources
    description: Supporting source notes for this topic.
    icon: book
    type: list
    items:
      type: link
      format: note_link
    nullable: false
    relationship_kind: related_to
  status:
    label: Status
    description: Lifecycle state of the note.
    icon: badge
    type: text
    allowed_values: [draft, active, archived]
    nullable: true
    default_value: null
  description:
    label: Description
    description: Human-readable note description used in previews and references.
    icon: paragraph
    type: text
    optional: true
    nullable: true
    default_value: ""
  summary:
    label: Summary
    description: Short overview used in generated references and previews.
    icon: paragraph
    type: text
    generated: true
    optional: true
    nullable: true
    default_value: ""

relationships:
  belongs_to:
    allowed_note_types:
      domain:
        min: 1
        max: 1
  related_to:
    allowed_note_types:
      source:
        min: 1
      concept:
        min: 0
      topic:
        min: 0

headings:
  required_h2:
    - Summary
    - Key Ideas
    - Sources
    - Related
    - References
  optional_h2:
    - Context
    - Notes
  allow_other_h2: true
  require_order: false

guidance:
  when_to_use: "Use for a durable note about a specific topic."
  when_not_to_use: "Do not use for broad groupings, source material, or dated logs."
```

Required top-level keys in every schema:

- `specification_version`
- `note_type`
- `abstract`
- `label`
- `icon`
- `description`

Required effective keys for concrete note types:

- `kind`
- `storage`
- `template`
- `frontmatter`

`relationships`, `headings`, and `guidance` MAY be absent from a concrete note type's effective schema; an absent block takes the empty defaults defined below.

Rules:

- `NTS-23` Every top-level key listed for every schema MUST be physically present in each note-type schema.
- `NTS-24` `abstract` MUST be a boolean.
- `NTS-25` The effective note-type schema MUST be computed using the normative evaluation pipeline defined above.
- `NTS-26` The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `NTS-27` In schema files, `note_type` is the identifier of the note type being defined.
- `NTS-28` In managed notes, `note_type`, when stored, is the core-defined frontmatter field that records the concrete note type resolved for that note and may participate in explicit mapping rules.
- `NTS-29` `label` is the human-facing name of the note type. MUST be a non-empty string.
- `NTS-30` `description` is concise human-facing explanatory metadata for generated references and applications. MUST be a non-empty string.
- `NTS-31` `icon` MUST be a non-empty string.
- `NTS-32` `label`, `description`, and `icon` are flat human-facing metadata keys on the note-type schema; this specification does not define a separate display block for them.
- `NTS-33` `icon` is human-facing note-type metadata for generated references and applications.
- `NTS-34` The core specification treats `icon` as an opaque presentation token and does not standardize icon libraries or rendering behavior.
- `NTS-35` `extends` MAY be omitted.
- `NTS-36` If present, `extends` MUST be a non-empty slug and MUST resolve to exactly one abstract note type under `<metadata_directory>/schemas/`.
- `NTS-37` A note type MUST NOT extend itself directly or transitively.
- `NTS-38` Because `extends` is singular, a note type MUST inherit from at most one parent.
- `NTS-39` Abstract note types MAY declare `kind`, `storage`, `template`, `frontmatter`, `relationships`, `headings`, `guidance`, `unknown_field`, `conditions`, and `count` to contribute reusable structure, but they are not required to declare them.
- `NTS-40` If an abstract note type declares the core-defined `note_type` field in `frontmatter`, it MUST use `value_from_schema: note_type`.
- `NTS-41` Concrete note types MAY inherit `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, `count`, `frontmatter`, `relationships`, and `headings` from abstract ancestors and therefore MAY omit those keys locally.
- `NTS-42` A concrete note type's effective schema MUST contain every top-level key listed above as required for concrete note types.
- `NTS-43` All templates live under `<metadata_directory>/templates/`; `template.file` is resolved from within that folder.
- `NTS-44` If a schema physically declares `template`, `template.file` MUST be a relative path resolved against `<metadata_directory>/templates/`; the referenced template file is located at `<metadata_directory>/templates/` plus the `template.file` value.
- `NTS-45` `template.file` MUST NOT restate the metadata directory or the `templates/` folder, MUST NOT be an absolute path, and MUST NOT contain `..` segments.
- `NTS-46` `template.file` MAY include subfolders and MUST use forward slashes when it does.
- `NTS-47` If a schema physically declares `template`, `template.file` MUST end in `.md`.
- `NTS-48` The effective `template.file` of a concrete note type defines the canonical template for that note type.
- `NTS-49` The `frontmatter` block semantics are defined in [Field Definition Reference](field-definition-reference.md).
- `NTS-50` If a schema physically declares `frontmatter`, it MUST be a field-definition mapping, even when it is empty.
- `NTS-51` Field definitions inside `frontmatter` MAY declare flat human-facing keys such as `label`, `description`, and `icon`, as defined in [Field Definition Reference](field-definition-reference.md).
- `NTS-52` A note-type schema MAY declare `id` when that note type uses stable note-level identifiers.
- `NTS-53` Frontmatter field names declared in a note-type schema MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `NTS-54` The `relationships` block shape and semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `NTS-55` An effective schema without `relationships` is equivalent to one declaring empty `belongs_to.allowed_note_types` and `related_to.allowed_note_types`: no documented relationships and no relationship constraints.
- `NTS-56` The `headings` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `NTS-57` If a schema physically declares `headings`, it MUST follow the heading shape required by [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `NTS-58` An effective schema without `headings` is equivalent to one declaring `required_h2: []`, `optional_h2: []`, `allow_other_h2: true`, `require_order: false`, and `require_h1_title: false`: no heading constraints.
- `NTS-59` An effective schema without `guidance` simply provides no usage guidance; this has no structural effect.
- `NTS-60` `guidance` is human-facing explanatory content and MUST NOT override structural rules.
- `NTS-61` If a schema physically declares `guidance`, it MUST be a mapping that physically contains `when_to_use` and `when_not_to_use`.
- `NTS-62` `guidance.when_to_use` and `guidance.when_not_to_use` MUST be non-empty strings.
- `NTS-63` This specification version defines no other `guidance` keys; an undeclared key inside `guidance` is evaluated under `unknown_field`.
- `NTS-64` `unknown_field` MAY be declared on a note-type schema to override the collection's `validation_defaults.unknown_field` severity for managed notes of that type.
- `NTS-65` If present, `unknown_field` MUST be one of the validation severities `error`, `warn`, `info`, or `off`.
- `NTS-66` The effective `unknown_field` severity for a managed note is its note type's effective `unknown_field` value when declared, and the collection's `validation_defaults.unknown_field` value otherwise.
- `NTS-67` A note-type `unknown_field` declaration applies to managed-note frontmatter only; it does not change how unknown fields are evaluated in governed artifacts.
- `NTS-68` `count` MAY be declared on a note-type schema to constrain how many managed notes of that type the collection may contain.
- `NTS-69` If present, `count` MAY declare `min` and `max`; each MUST be a non-negative integer, and `max` MUST be greater than or equal to `min` when both are present.
- `NTS-70` If `count.min` is omitted, it defaults to `0`; if `count.max` is omitted, the count is unbounded.
- `NTS-71` A collection whose managed-note count for a note type violates that type's effective `count` is reported as `invalid_note_count`, as defined in [Collection Model](collection-model.md).
- `NTS-72` `property_sets`, `exclude_property_sets`, and `frontmatter_remove` MAY each be omitted.
- `NTS-73` Only concrete note types MAY declare `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.
- `NTS-74` If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `NTS-75` `property_sets` is the opt-in part of the single property-set composition mechanism; property sets named in `default_property_sets` apply without being restated here.
- `NTS-76` Property sets MAY contribute `frontmatter`, `relationships`, and `headings`; the effective `frontmatter` block remains mandatory.
- `NTS-77` `exclude_property_sets` opts the concrete note type out of specific default property sets; each named identifier MUST appear in `typedmark.md` `default_property_sets`.
- `NTS-78` `frontmatter_remove` subtracts individual frontmatter fields contributed by applied default property sets or abstract ancestors, before opt-in property sets and local concrete schema definitions are applied.
- `NTS-79` Property-set definitions, default property sets, composition, and merge rules are defined in [Collection Model](collection-model.md).
- `NTS-80` Note-type inheritance is defined only by `extends`; `property_sets`, `exclude_property_sets`, and `frontmatter_remove` do not affect the abstract ancestor chain.
- `NTS-81` A concrete note type MAY omit individual inherited field definitions, relationship target definitions, or heading settings that remain unchanged.

### Abstract Inheritance Example

```yaml
# <metadata_directory>/schemas/person.md
specification_version: 0.0.1
note_type: person
abstract: true
label: Person
icon: user
description: Shared structure for person-like notes.

kind: entity

template:
  file: "person.md"

frontmatter:
  note_type:
    type: text
    value_from_schema: note_type
  title:
    type: text
    not_blank: true
    nullable: false
  email:
    type: text
    optional: true
    nullable: true
    default_value: null

headings:
  required_h2: []
  optional_h2:
    - Notes
  allow_other_h2: true
  require_order: false

guidance:
  when_to_use: "Use as a reusable base for person-like note types."
  when_not_to_use: "Do not map notes directly to this abstract type."
```

```yaml
# <metadata_directory>/schemas/customer.md
specification_version: 0.0.1
note_type: customer
abstract: false
extends: person
label: Customer
icon: badge
description: Customer-specific person record.

storage:
  folder_pattern: "Customers"
  note_name_pattern: "{title}"
  archive:
    policy: in_place_historical

frontmatter:
  customer_tier:
    type: text
    nullable: false
```

In that example, `customer` inherits `kind`, `template`, `guidance`, `note_type`, `title`, `email`, and `headings` from `person`, while adding its own concrete storage rule and local `customer_tier` field. Because no schema in the chain declares `relationships`, the effective relationships take the empty defaults.

## Conditional Field Constraints

A note-type schema MAY declare `conditions` to express cross-field conditional requirements that unconditional field definitions cannot: a field that must hold a value only when another field has a given value, or a field that must stay empty in certain states.

Example:

```yaml
conditions:
  - description: Archived topics need a reason.
    when:
      status:
        equals: archived
    then:
      require:
        - archived_reason
  - description: Draft topics have no publication date.
    when:
      status:
        equals: draft
    then:
      require_null:
        - published_on
```

Rules:

- `NTS-82` `conditions` MAY be omitted.
- `NTS-83` If present, `conditions` MUST be a non-empty ordered list of condition rules.
- `NTS-84` Each condition rule MUST physically contain `when` and `then`, and MAY contain `description`, a non-empty string used for reporting.
- `NTS-85` `when` is a frontmatter predicate mapping with the same shape and semantics as `when.frontmatter` in `note_type_mappings`, defined in [Collection Model](collection-model.md), evaluated against the managed note's stored frontmatter.
- `NTS-86` `then` MUST contain at least one of `require` or `require_null`; each, when present, MUST be a non-empty list of unique top-level effective frontmatter field names.
- `NTS-87` Each field named in `require` or `require_null`, and each field named in `when`, MUST resolve to a field declared in the effective frontmatter; a condition naming an unresolved field makes the schema invalid.
- `NTS-88` A field named in `require` MUST NOT be declared `optional: true` in the effective schema and SHOULD be nullable, so it can remain `null` while no condition requires it.
- `NTS-89` When a condition's `when` predicate matches a managed note, every field named in `require` MUST hold a concrete non-null stored value, and every field named in `require_null` MUST be stored as `null`.
- `NTS-90` A `require` violation is reported as `missing_required_field`; a `require_null` violation is reported as `invalid_field_value`.
- `NTS-91` Condition rules are evaluated independently; every matching rule applies, and a note MUST satisfy all of them.
- `NTS-92` A field MUST NOT be named in `require` by one matching rule and in `require_null` by another matching rule for the same note; condition sets that allow this are invalid for that note and MUST be reported.
- `NTS-93` `conditions` participates in note-type inheritance through whole-key replacement, like `guidance`; property sets MUST NOT declare `conditions` in this specification version.

## Allowed Schema Kinds

Each concrete note type's effective schema MUST declare one of these `kind` values:

- `singleton`
- `entity`
- `dated_record`
- `rule_set`

Definitions:

- `singleton`: one canonical fixed-path note
- `entity`: durable note for a long-lived thing
- `dated_record`: time-based note whose path includes a date
- `rule_set`: conventions, rules, style, or governance note

Rules:

- `NTS-94` If an abstract note type physically declares `kind`, it MUST use one of the values listed above.
- `NTS-95` A `singleton` note type has an implicit effective `count` of `max: 1`; it MAY declare `count` with `min: 1` to require the note to exist.
- `NTS-96` A `singleton` note type's storage patterns MUST NOT contain placeholders, so its note resolves to one fixed path.

Special-case guidance:

- Fixed-path notes SHOULD be modeled as `singleton` note types.
- Examples include `Home.md`, `Guide.md`, and `Glossary.md`.
- A fixed-path singleton MAY omit `title` if the title is implied by the schema.
- A fixed-path singleton that inherits most default-property-set or abstract frontmatter but does not want `title` MAY use `frontmatter_remove: [title]`.
- A fixed-path singleton MAY omit stored `note_type` when the collection's mapping rules and effective schema do not require it to be present.

## Storage Rules

Every concrete note type MUST define storage rules in its effective schema.

Abstract note types MAY declare a `storage` block to contribute reusable storage defaults, but they are not required to.

Required effective storage fields for concrete note types:

- `folder_pattern`
- `note_name_pattern`
- `archive.policy`

Allowed archive policies:

- `mirror_under_archives`
- `in_place_historical`
- `fixed`

Rules:

- `NTS-97` If a schema physically declares `storage`, it MUST physically contain `folder_pattern`, `note_name_pattern`, and `archive.policy`.
- `NTS-98` Note-type inheritance uses whole-block replacement for `storage`. A descendant schema that physically defines `storage` replaces any inherited `storage` block completely.
- `NTS-99` `folder_pattern` is the collection-relative folder rule for active notes of that type.
- `NTS-100` `note_name_pattern` is the file-name rule for active notes of that type, without the `.md` extension.
- `NTS-101` `folder_pattern`, `note_name_pattern`, and any archive storage patterns are authoritative for both storage conformance and note creation.
- `NTS-102` `folder_pattern` MAY be the empty string to represent the collection root.
- `NTS-103` `folder_pattern` MUST use forward slashes when it contains subfolders.
- `NTS-104` `folder_pattern` MUST NOT start or end with `/`.
- `NTS-105` `folder_pattern` and `archive.folder_pattern` MUST NOT contain `.` or `..` path segments.
- `NTS-106` `note_name_pattern` MUST be a non-empty string.
- `NTS-107` `note_name_pattern` MUST NOT contain `/` or `\`.
- `NTS-108` `note_name_pattern` MUST NOT include the `.md` extension.
- `NTS-109` `note_name_prefix` and `note_name_suffix` MAY each be declared to govern an affix around the resolved `note_name_pattern`.
- `NTS-110` If present, `note_name_prefix` and `note_name_suffix` MUST each be a mapping that physically contains `pattern`.
- `NTS-111` An affix `pattern` MUST be a non-empty string and follows the same syntax, placeholder, and resolution rules as `note_name_pattern`, including the prohibition of `/` and `\` and of the `.md` extension.
- `NTS-112` An affix mapping MAY declare `required`; if present, `required` MUST be a boolean, and if omitted, `required` defaults to `true`.
- `NTS-113` The conforming active note name is the resolved `note_name_pattern`, preceded by the resolved `note_name_prefix` when that affix is applied, and followed by the resolved `note_name_suffix` when that affix is applied.
- `NTS-114` A required affix MUST be applied: the active note name MUST include the resolved affix in its position.
- `NTS-115` An optional affix, declared with `required: false`, MAY be applied: the active note name conforms both with and without the resolved affix.
- `NTS-116` Storage patterns are template strings composed of literal text plus zero or more placeholders.
- `NTS-117` A placeholder has the form `{field_name}`, `{field_name:format}`, or the current-time form `{now:format}`.
- `NTS-118` `now` is a reserved placeholder name for the current time; a frontmatter field named `now` MUST NOT be referenced in storage patterns.
- `NTS-119` `{now:format}` is valid in every storage pattern, and its `format` MUST be one of `YYYY`, `MM`, `DD`, `YYYY-MM`, `YYYY-MM-DD`, `Q`, `WW`, or `GGGG`.
- `NTS-120` `Q` is the quarter number `1` through `4`, `WW` is the zero-padded ISO 8601 week number `01` through `53`, and `GGGG` is the four-digit ISO 8601 week-numbering year; week-based patterns SHOULD pair `WW` with `GGGG` rather than `YYYY`.
- `NTS-121` A tool that creates a managed note MUST resolve each `{now:format}` placeholder from the current instant in the collection timezone defined in [Collection Model](collection-model.md).
- `NTS-122` For storage conformance, a `{now:format}` placeholder matches any text that is a syntactically valid value of its format; the concrete value was fixed when the note was created and is not re-resolved.
- `NTS-123` Because `{now:format}` conformance is shape-only, note types SHOULD use it for coarse grouping such as year, quarter, or week folders, and SHOULD keep exact dates in stored fields, consistent with the `dated_record` guidance on this page.
- `NTS-124` `field_name` in a storage placeholder MUST refer to a top-level effective frontmatter field name.
- `NTS-125` Nested field references are not supported in storage patterns in this specification version.
- `NTS-126` `{field_name}` inserts the concrete stored scalar value of that field.
- `NTS-127` `{field_name:format}` is valid only when the stored value is a `date` or `datetime` field and `format` is one of `YYYY`, `MM`, `DD`, `YYYY-MM`, or `YYYY-MM-DD`.
- `NTS-128` When a `{field_name:format}` placeholder references a `datetime` field, the date components are taken from the stored instant expressed in the collection timezone defined in [Collection Model](collection-model.md); for `date` fields, they are taken from the stored value as written.
- `NTS-129` Storage placeholders MUST resolve from physically stored frontmatter values, not from note body content, inferred values, or template prose.
- `NTS-130` A field used in a storage pattern MUST resolve to a concrete non-null scalar value when the managed note path is evaluated.
- `NTS-131` A field referenced by any storage pattern, including archive patterns and affixes, MUST NOT declare `optional: true`, and SHOULD be non-nullable or declare a non-null `default_value`, so that storage paths are resolvable at note creation.
- `NTS-132` List, tags, object, and `any` values MUST NOT be used in storage patterns.
- `NTS-133` A resolved placeholder value MUST NOT contain `/`, `\`, or control characters, and MUST NOT equal `.` or `..`; folder structure comes from the pattern, never from resolved values.
- `NTS-134` A resolved active or archived note name MUST NOT begin with `.`.
- `NTS-135` A managed note whose resolved storage path violates these value-safety rules is a `path` failure, and a tool MUST NOT create a managed note whose resolved path would violate them; it MUST obtain conforming values instead.
- `NTS-136` Fields referenced by storage patterns SHOULD declare value constraints, such as `regex`, that prevent path-hostile values.
- `NTS-137` The active managed-note path is the resolved `folder_pattern` plus `/` plus the conforming active note name plus `.md`, unless `folder_pattern` is empty, in which case the active managed-note path is the conforming active note name plus `.md`.
- `NTS-138` A managed note is active or archived according to its stored `archived` value, the core-defined field contract defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `NTS-139` Validators MUST ensure an active managed note's path matches the resolved active storage path for its note type.
- `NTS-140` If `archive.policy` is `mirror_under_archives` or `fixed`, the schema MUST also define `archive.folder_pattern` and `archive.note_name_pattern`.
- `NTS-141` `archive.folder_pattern` and `archive.note_name_pattern` follow the same syntax and resolution rules as the active storage patterns.
- `NTS-142` The `archive` block MAY declare `archive.note_name_prefix` and `archive.note_name_suffix`, which follow the same affix rules as `note_name_prefix` and `note_name_suffix` and govern the archived note name.
- `NTS-143` If `archive.policy` is `in_place_historical`, `archive.folder_pattern` and `archive.note_name_pattern` MUST be omitted.
- `NTS-144` If a note is archived under `mirror_under_archives` or `fixed`, its archived path is resolved using `archive.folder_pattern` and `archive.note_name_pattern`, and validators MUST ensure the archived note's path matches that resolved archived path.
- `NTS-145` If a note is archived under `in_place_historical`, it remains at its resolved active storage path, and validators MUST ensure its path still matches that active path.
- `NTS-146` A managed note whose path does not match the storage path required by its archived state violates the `path` rule defined in [Collection Model](collection-model.md).
- `NTS-147` Archiving a note means setting `archived: true` and, under `mirror_under_archives` or `fixed`, moving the note to its resolved archived path.
- `NTS-148` Tools that create managed notes MUST derive the initial note folder and note name from `storage.folder_pattern` and `storage.note_name_pattern` using the stored frontmatter values they are writing.
- `NTS-149` A tool that creates a managed note MUST apply every required affix to the created note name and MAY apply each optional affix, for example based on user choice.
- `NTS-150` A tool that creates a managed note MUST obtain every concrete value needed to resolve the storage patterns before writing the note.
- `NTS-151` If required storage-pattern values are not yet known, a tool MUST ask for them or otherwise obtain them before claiming the created note conforms.
- `NTS-152` A tool MUST NOT create or move a managed note onto a path already occupied by another note or governed artifact; an occupied resolved path MUST be reported rather than overwritten.
- `NTS-153` Authors SHOULD design storage patterns so that no two managed notes can resolve to the same path.
- `NTS-154` Tools SHOULD report two managed notes whose resolved paths differ only by letter case, because case-insensitive filesystems cannot store both.
- `NTS-155` Tools SHOULD report resolved path segments that are reserved on common filesystems, such as the Windows device names `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, and `LPT1` through `LPT9`, and segments ending with a dot or a space.
- `NTS-156` If a note is archived, its `note_type` MUST remain unchanged.
- `NTS-157` If a note declares `id`, its `id` MUST remain unchanged when the note is archived.
- `NTS-158` `dated_record` note types SHOULD encode the date in both storage patterns and metadata when practical.

Example creation-oriented storage rules:

```yaml
storage:
  folder_pattern: "Meetings/{meeting_date:YYYY}/{meeting_date:MM}"
  note_name_pattern: "{meeting_date:YYYY-MM-DD} - {title}"
  note_name_suffix:
    pattern: " (Meeting)"
    required: false
  archive:
    policy: in_place_historical
```

Using that storage block, a tool creating a `meeting` note with `meeting_date: 2026-06-08` and `title: foo` MUST create the note at `Meetings/2026/06/2026-06-08 - foo.md`, and MAY instead create it at `Meetings/2026/06/2026-06-08 - foo (Meeting).md`, because the suffix is optional; both paths conform.
