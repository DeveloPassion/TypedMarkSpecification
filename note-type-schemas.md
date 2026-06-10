---
title: Note Type Schemas
parent: TypedMark
nav_order: 4
---

# Note Type Schemas

This page is authoritative for note type registration, abstract note types, note-type inheritance through `extends`, the required top-level contract of `<metadata_directory>/schemas/<note_type>.md`, the effective note-type schema, optional property-set composition references, schema kinds, and storage rules. Field semantics and managed-note note-type association live in [Managed Notes and Properties](managed-notes-and-properties.md), relationship, heading, and template semantics live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md), and default property sets, property-set definitions, and property-set composition live in [Collection Model](collection-model.md).

## Note Type Registry

The note type registry is implicit.

Rules:

- Every Markdown file directly under `<metadata_directory>/schemas/` defines one note type; its frontmatter is the note-type schema, per the governed artifact format in [Foundations](foundations.md).
- No separate registry file is maintained for note types.
- A note type MUST NOT be defined in more than one schema file.
- The schema file name without the `.md` extension MUST equal the schema's `note_type` value.
- Every schema file MUST physically declare `abstract`.
- If `abstract: true`, the schema defines an abstract note type.
- If `abstract: false`, the schema defines a concrete note type.
- A managed note MUST conform to exactly one concrete note type.
- The conformance requirements that determine when schema files MUST exist are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

## Effective Note-Type Schema

A managed note is evaluated against one effective note-type schema.

The effective note-type schema is not a separate stored artifact. It is the normative result of taking one concrete note-type schema file, its abstract ancestor chain, and the default-property-set, property-set composition, and block-merge rules defined by this specification before evaluating note conformance.

A note type's own `frontmatter`, `relationships`, and `headings` blocks are not a separate kind of definition. They are the note type's inline, note-type-scoped property set, and they participate in the same composition as named property sets, applied last as its highest-precedence layer. Reusable fields belong in named property sets; one-off fields belong inline.

### Normative Evaluation Pipeline

Rules:

1. A tool or validator MUST resolve the note's note type using the note-type association rules defined in [Managed Notes and Properties](managed-notes-and-properties.md) and MUST select exactly one concrete note-type schema file from `<metadata_directory>/schemas/` using that resolved identifier.
2. If the selected concrete note type declares `extends`, the tool or validator MUST load the full abstract ancestor chain, starting with the farthest abstract ancestor and ending with the selected concrete note type.
3. The selected concrete note-type schema file provides the direct top-level values for `specification_version`, `note_type`, `abstract`, `label`, `icon`, and `description`.
4. For `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, and `count`, note-type inheritance uses whole-key replacement along the abstract ancestor chain. The last schema in that chain order that physically defines one of those keys determines the effective value of that key.
5. The tool or validator MUST determine which property sets apply to the selected concrete note type by taking the `default_property_sets` declared in `typedmark.md`, removing any named in the concrete note type's `exclude_property_sets`, and then appending the property sets named in the concrete note type's `property_sets`, using the composition rules in [Collection Model](collection-model.md).
6. The `frontmatter`, `relationships`, and `headings` blocks contributed by the applied default property sets MUST be applied first, in `default_property_sets` order.
7. Local `frontmatter`, `relationships`, and `headings` blocks declared by abstract ancestors, if any, MUST be applied next in abstract-ancestor order using the merge rules defined in [Collection Model](collection-model.md).
8. If `frontmatter_remove` is present on the selected concrete note type, it MUST be applied next to the accumulated inherited frontmatter.
9. The `frontmatter`, `relationships`, and `headings` blocks contributed by the opt-in property sets named in `property_sets`, if any, MUST be applied next in the selected concrete schema's declared `property_sets` order, as defined in [Collection Model](collection-model.md).
10. Local `frontmatter`, `relationships`, and `headings` definitions in the selected concrete note-type schema file MUST be applied last.
11. The resulting `frontmatter`, `relationships`, and `headings` blocks, together with the direct top-level values from the selected concrete schema file and the effective inherited values of `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, and `count`, are the effective note-type schema for that note type.
12. Managed-note, relationship, heading, template, and storage conformance MUST be evaluated against that effective note-type schema using the rule pages linked from this page.
13. This specification MUST NOT be interpreted as requiring a separate serialized effective-schema artifact on disk.

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

- Every top-level key listed for every schema MUST be physically present in each note-type schema.
- `abstract` MUST be a boolean.
- The effective note-type schema MUST be computed using the normative evaluation pipeline defined above.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- In schema files, `note_type` is the identifier of the note type being defined.
- In managed notes, `note_type`, when stored, is the core-defined frontmatter field that records the concrete note type resolved for that note and may participate in explicit mapping rules.
- `label` is the human-facing name of the note type. MUST be a non-empty string.
- `description` is concise human-facing explanatory metadata for generated references and applications. MUST be a non-empty string.
- `icon` MUST be a non-empty string.
- `label`, `description`, and `icon` are flat human-facing metadata keys on the note-type schema; this specification does not define a separate display block for them.
- `icon` is human-facing note-type metadata for generated references and applications.
- The core specification treats `icon` as an opaque presentation token and does not standardize icon libraries or rendering behavior.
- `extends` MAY be omitted.
- If present, `extends` MUST be a non-empty slug and MUST resolve to exactly one abstract note type under `<metadata_directory>/schemas/`.
- A note type MUST NOT extend itself directly or transitively.
- Because `extends` is singular, a note type MUST inherit from at most one parent.
- Abstract note types MAY declare `kind`, `storage`, `template`, `frontmatter`, `relationships`, `headings`, `guidance`, `unknown_field`, `conditions`, and `count` to contribute reusable structure, but they are not required to declare them.
- If an abstract note type declares the core-defined `note_type` field in `frontmatter`, it MUST use `value_from_schema: note_type`.
- Concrete note types MAY inherit `kind`, `storage`, `template`, `guidance`, `unknown_field`, `conditions`, `count`, `frontmatter`, `relationships`, and `headings` from abstract ancestors and therefore MAY omit those keys locally.
- A concrete note type's effective schema MUST contain every top-level key listed above as required for concrete note types.
- All templates live under `<metadata_directory>/templates/`; `template.file` is resolved from within that folder.
- If a schema physically declares `template`, `template.file` MUST be a relative path resolved against `<metadata_directory>/templates/`; the referenced template file is located at `<metadata_directory>/templates/` plus the `template.file` value.
- `template.file` MUST NOT restate the metadata directory or the `templates/` folder, MUST NOT be an absolute path, and MUST NOT contain `..` segments.
- `template.file` MAY include subfolders and MUST use forward slashes when it does.
- If a schema physically declares `template`, `template.file` MUST end in `.md`.
- The effective `template.file` of a concrete note type defines the canonical template for that note type.
- The `frontmatter` block semantics are defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- If a schema physically declares `frontmatter`, it MUST be a field-definition mapping, even when it is empty.
- Field definitions inside `frontmatter` MAY declare flat human-facing keys such as `label`, `description`, and `icon`, as defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- A note-type schema MAY declare `id` when that note type uses stable note-level identifiers.
- Frontmatter field names declared in a note-type schema MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The `relationships` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- If a schema physically declares `relationships`, it MUST contain both `belongs_to.allowed_note_types` and `related_to.allowed_note_types`, even when those mappings are empty.
- An effective schema without `relationships` is equivalent to one declaring empty `belongs_to.allowed_note_types` and `related_to.allowed_note_types`: no documented relationships and no relationship constraints.
- The `headings` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- If a schema physically declares `headings`, it MUST follow the heading shape required by [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- An effective schema without `headings` is equivalent to one declaring `required_h2: []`, `optional_h2: []`, `allow_other_h2: true`, `require_order: false`, and `require_h1_title: false`: no heading constraints.
- An effective schema without `guidance` simply provides no usage guidance; this has no structural effect.
- `guidance` is human-facing explanatory content and MUST NOT override structural rules.
- If a schema physically declares `guidance`, it MUST be a mapping that physically contains `when_to_use` and `when_not_to_use`.
- `guidance.when_to_use` and `guidance.when_not_to_use` MUST be non-empty strings.
- This specification version defines no other `guidance` keys; an undeclared key inside `guidance` is evaluated under `unknown_field`.
- `unknown_field` MAY be declared on a note-type schema to override the collection's `validation_defaults.unknown_field` severity for managed notes of that type.
- If present, `unknown_field` MUST be one of the validation severities `error`, `warn`, `info`, or `off`.
- The effective `unknown_field` severity for a managed note is its note type's effective `unknown_field` value when declared, and the collection's `validation_defaults.unknown_field` value otherwise.
- A note-type `unknown_field` declaration applies to managed-note frontmatter only; it does not change how unknown fields are evaluated in governed artifacts.
- `count` MAY be declared on a note-type schema to constrain how many managed notes of that type the collection may contain.
- If present, `count` MAY declare `min` and `max`; each MUST be a non-negative integer, and `max` MUST be greater than or equal to `min` when both are present.
- If `count.min` is omitted, it defaults to `0`; if `count.max` is omitted, the count is unbounded.
- A collection whose managed-note count for a note type violates that type's effective `count` is reported as `invalid_note_count`, as defined in [Collection Model](collection-model.md).
- `property_sets`, `exclude_property_sets`, and `frontmatter_remove` MAY each be omitted.
- Only concrete note types MAY declare `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `property_sets` is the opt-in part of the single property-set composition mechanism; property sets named in `default_property_sets` apply without being restated here.
- Property sets MAY contribute `frontmatter`, `relationships`, and `headings`; the effective `frontmatter` block remains mandatory.
- `exclude_property_sets` opts the concrete note type out of specific default property sets; each named identifier MUST appear in `typedmark.md` `default_property_sets`.
- `frontmatter_remove` subtracts individual frontmatter fields contributed by applied default property sets or abstract ancestors, before opt-in property sets and local concrete schema definitions are applied.
- Property-set definitions, default property sets, composition, and merge rules are defined in [Collection Model](collection-model.md).
- Note-type inheritance is defined only by `extends`; `property_sets`, `exclude_property_sets`, and `frontmatter_remove` do not affect the abstract ancestor chain.
- A concrete note type MAY omit individual inherited field definitions, relationship target definitions, or heading settings that remain unchanged.

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

- `conditions` MAY be omitted.
- If present, `conditions` MUST be a non-empty ordered list of condition rules.
- Each condition rule MUST physically contain `when` and `then`, and MAY contain `description`, a non-empty string used for reporting.
- `when` is a frontmatter predicate mapping with the same shape and semantics as `when.frontmatter` in `note_type_mappings`, defined in [Collection Model](collection-model.md), evaluated against the managed note's stored frontmatter.
- `then` MUST contain at least one of `require` or `require_null`; each, when present, MUST be a non-empty list of unique top-level effective frontmatter field names.
- Each field named in `require` or `require_null`, and each field named in `when`, MUST resolve to a field declared in the effective frontmatter; a condition naming an unresolved field makes the schema invalid.
- A field named in `require` MUST NOT be declared `optional: true` in the effective schema and SHOULD be nullable, so it can remain `null` while no condition requires it.
- When a condition's `when` predicate matches a managed note, every field named in `require` MUST hold a concrete non-null stored value, and every field named in `require_null` MUST be stored as `null`.
- A `require` violation is reported as `missing_required_field`; a `require_null` violation is reported as `invalid_field_value`.
- Condition rules are evaluated independently; every matching rule applies, and a note MUST satisfy all of them.
- A field MUST NOT be named in `require` by one matching rule and in `require_null` by another matching rule for the same note; condition sets that allow this are invalid for that note and MUST be reported.
- `conditions` participates in note-type inheritance through whole-key replacement, like `guidance`; property sets MUST NOT declare `conditions` in this specification version.

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

- If an abstract note type physically declares `kind`, it MUST use one of the values listed above.
- A `singleton` note type has an implicit effective `count` of `max: 1`; it MAY declare `count` with `min: 1` to require the note to exist.
- A `singleton` note type's storage patterns MUST NOT contain placeholders, so its note resolves to one fixed path.

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

- If a schema physically declares `storage`, it MUST physically contain `folder_pattern`, `note_name_pattern`, and `archive.policy`.
- Note-type inheritance uses whole-block replacement for `storage`. A descendant schema that physically defines `storage` replaces any inherited `storage` block completely.
- `folder_pattern` is the collection-relative folder rule for active notes of that type.
- `note_name_pattern` is the file-name rule for active notes of that type, without the `.md` extension.
- `folder_pattern`, `note_name_pattern`, and any archive storage patterns are authoritative for both storage conformance and note creation.
- `folder_pattern` MAY be the empty string to represent the collection root.
- `folder_pattern` MUST use forward slashes when it contains subfolders.
- `folder_pattern` MUST NOT start or end with `/`.
- `folder_pattern` and `archive.folder_pattern` MUST NOT contain `.` or `..` path segments.
- `note_name_pattern` MUST be a non-empty string.
- `note_name_pattern` MUST NOT contain `/` or `\`.
- `note_name_pattern` MUST NOT include the `.md` extension.
- `note_name_prefix` and `note_name_suffix` MAY each be declared to govern an affix around the resolved `note_name_pattern`.
- If present, `note_name_prefix` and `note_name_suffix` MUST each be a mapping that physically contains `pattern`.
- An affix `pattern` MUST be a non-empty string and follows the same syntax, placeholder, and resolution rules as `note_name_pattern`, including the prohibition of `/` and `\` and of the `.md` extension.
- An affix mapping MAY declare `required`; if present, `required` MUST be a boolean, and if omitted, `required` defaults to `true`.
- The conforming active note name is the resolved `note_name_pattern`, preceded by the resolved `note_name_prefix` when that affix is applied, and followed by the resolved `note_name_suffix` when that affix is applied.
- A required affix MUST be applied: the active note name MUST include the resolved affix in its position.
- An optional affix, declared with `required: false`, MAY be applied: the active note name conforms both with and without the resolved affix.
- Storage patterns are template strings composed of literal text plus zero or more placeholders.
- A placeholder has the form `{field_name}`, `{field_name:format}`, or the current-time form `{now:format}`.
- `now` is a reserved placeholder name for the current time; a frontmatter field named `now` MUST NOT be referenced in storage patterns.
- `{now:format}` is valid in every storage pattern, and its `format` MUST be one of `YYYY`, `MM`, `DD`, `YYYY-MM`, `YYYY-MM-DD`, `Q`, `WW`, or `GGGG`.
- `Q` is the quarter number `1` through `4`, `WW` is the zero-padded ISO 8601 week number `01` through `53`, and `GGGG` is the four-digit ISO 8601 week-numbering year; week-based patterns SHOULD pair `WW` with `GGGG` rather than `YYYY`.
- A tool that creates a managed note MUST resolve each `{now:format}` placeholder from the current instant in the collection timezone defined in [Collection Model](collection-model.md).
- For storage conformance, a `{now:format}` placeholder matches any text that is a syntactically valid value of its format; the concrete value was fixed when the note was created and is not re-resolved.
- Because `{now:format}` conformance is shape-only, note types SHOULD use it for coarse grouping such as year, quarter, or week folders, and SHOULD keep exact dates in stored fields, consistent with the `dated_record` guidance on this page.
- `field_name` in a storage placeholder MUST refer to a top-level effective frontmatter field name.
- Nested field references are not supported in storage patterns in this specification version.
- `{field_name}` inserts the concrete stored scalar value of that field.
- `{field_name:format}` is valid only when the stored value is a `date` or `datetime` field and `format` is one of `YYYY`, `MM`, `DD`, `YYYY-MM`, or `YYYY-MM-DD`.
- When a `{field_name:format}` placeholder references a `datetime` field, the date components are taken from the stored instant expressed in the collection timezone defined in [Collection Model](collection-model.md); for `date` fields, they are taken from the stored value as written.
- Storage placeholders MUST resolve from physically stored frontmatter values, not from note body content, inferred values, or template prose.
- A field used in a storage pattern MUST resolve to a concrete non-null scalar value when the managed note path is evaluated.
- A field referenced by any storage pattern, including archive patterns and affixes, MUST NOT declare `optional: true`, and SHOULD be non-nullable or declare a non-null `default_value`, so that storage paths are resolvable at note creation.
- List, tags, object, and `any` values MUST NOT be used in storage patterns.
- A resolved placeholder value MUST NOT contain `/`, `\`, or control characters, and MUST NOT equal `.` or `..`; folder structure comes from the pattern, never from resolved values.
- A resolved active or archived note name MUST NOT begin with `.`.
- A managed note whose resolved storage path violates these value-safety rules is a `path` failure, and a tool MUST NOT create a managed note whose resolved path would violate them; it MUST obtain conforming values instead.
- Fields referenced by storage patterns SHOULD declare value constraints, such as `regex`, that prevent path-hostile values.
- The active managed-note path is the resolved `folder_pattern` plus `/` plus the conforming active note name plus `.md`, unless `folder_pattern` is empty, in which case the active managed-note path is the conforming active note name plus `.md`.
- A managed note is active or archived according to its stored `archived` value, the core-defined field contract defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- Validators MUST ensure an active managed note's path matches the resolved active storage path for its note type.
- If `archive.policy` is `mirror_under_archives` or `fixed`, the schema MUST also define `archive.folder_pattern` and `archive.note_name_pattern`.
- `archive.folder_pattern` and `archive.note_name_pattern` follow the same syntax and resolution rules as the active storage patterns.
- The `archive` block MAY declare `archive.note_name_prefix` and `archive.note_name_suffix`, which follow the same affix rules as `note_name_prefix` and `note_name_suffix` and govern the archived note name.
- If `archive.policy` is `in_place_historical`, `archive.folder_pattern` and `archive.note_name_pattern` MUST be omitted.
- If a note is archived under `mirror_under_archives` or `fixed`, its archived path is resolved using `archive.folder_pattern` and `archive.note_name_pattern`, and validators MUST ensure the archived note's path matches that resolved archived path.
- If a note is archived under `in_place_historical`, it remains at its resolved active storage path, and validators MUST ensure its path still matches that active path.
- A managed note whose path does not match the storage path required by its archived state violates the `path` rule defined in [Collection Model](collection-model.md).
- Archiving a note means setting `archived: true` and, under `mirror_under_archives` or `fixed`, moving the note to its resolved archived path.
- Tools that create managed notes MUST derive the initial note folder and note name from `storage.folder_pattern` and `storage.note_name_pattern` using the stored frontmatter values they are writing.
- A tool that creates a managed note MUST apply every required affix to the created note name and MAY apply each optional affix, for example based on user choice.
- A tool that creates a managed note MUST obtain every concrete value needed to resolve the storage patterns before writing the note.
- If required storage-pattern values are not yet known, a tool MUST ask for them or otherwise obtain them before claiming the created note conforms.
- A tool MUST NOT create or move a managed note onto a path already occupied by another note or governed artifact; an occupied resolved path MUST be reported rather than overwritten.
- Authors SHOULD design storage patterns so that no two managed notes can resolve to the same path.
- Tools SHOULD report two managed notes whose resolved paths differ only by letter case, because case-insensitive filesystems cannot store both.
- Tools SHOULD report resolved path segments that are reserved on common filesystems, such as the Windows device names `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, and `LPT1` through `LPT9`, and segments ending with a dot or a space.
- If a note is archived, its `note_type` MUST remain unchanged.
- If a note declares `id`, its `id` MUST remain unchanged when the note is archived.
- `dated_record` note types SHOULD encode the date in both storage patterns and metadata when practical.

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
