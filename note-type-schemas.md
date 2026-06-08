---
title: Note Type Schemas
parent: TypedMark
nav_order: 4
---

# Note Type Schemas

This page is authoritative for note type registration, abstract note types, note-type inheritance, the required top-level contract of `<metadata_directory>/schemas/<note_type>.yaml`, the effective note-type schema, optional property-set references, schema kinds, and storage rules. Field semantics and managed-note note-type association live in [Managed Notes and Properties](managed-notes-and-properties.md), relationship, heading, and template semantics live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md), and collection-level inheritance and property-set application live in [Collection Model](collection-model.md).

## Note Type Registry

The note type registry is implicit.

Rules:

- Every YAML file directly under `<metadata_directory>/schemas/` defines one note type.
- No separate registry file is maintained for note types.
- A note type MUST NOT be defined in more than one schema file.
- The schema file basename MUST equal the schema's `note_type` value.
- Every schema file MUST physically declare `abstract`.
- If `abstract: true`, the schema defines an abstract note type.
- If `abstract: false`, the schema defines a concrete note type.
- A managed note MUST conform to exactly one concrete note type.
- The conformance requirements that determine when schema files MUST exist are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

## Effective Note-Type Schema

A managed note is evaluated against one effective note-type schema.

The effective note-type schema is not a separate stored artifact. It is the normative result of taking one concrete note-type schema file, its abstract ancestor chain, and the collection-level inheritance, property-set, and block-merge rules defined by this specification before evaluating note conformance.

### Normative Evaluation Pipeline

Rules:

1. A tool or validator MUST resolve the note's note type using the note-type association rules defined in [Managed Notes and Properties](managed-notes-and-properties.md) and MUST select exactly one concrete note-type schema file from `<metadata_directory>/schemas/` using that resolved identifier.
2. If the selected concrete note type declares `extends`, the tool or validator MUST load the full abstract ancestor chain, starting with the farthest abstract ancestor and ending with the selected concrete note type.
3. The selected concrete note-type schema file provides the direct top-level values for `specification_version`, `note_type`, `abstract`, `label`, `icon`, and `description`.
4. For `kind`, `storage`, `template`, and `guidance`, note-type inheritance uses whole-key replacement along the abstract ancestor chain. The last schema in that chain order that physically defines one of those keys determines the effective value of that key.
5. The tool or validator MUST determine whether `global_properties.frontmatter`, `global_properties.relationships`, and `global_properties.headings` apply to the selected concrete note type using the inheritance rules in [Collection Model](collection-model.md).
6. Enabled global blocks from `typedmark.yaml` MUST be applied first.
7. Local `frontmatter`, `relationships`, and `headings` blocks declared by abstract ancestors, if any, MUST be applied next in abstract-ancestor order using the merge rules defined in [Collection Model](collection-model.md).
8. If `inheritance.frontmatter_remove` is present on the selected concrete note type, it MUST be applied next to the accumulated inherited frontmatter.
9. Referenced property sets, if any, MUST be applied next in the selected concrete schema's declared `property_sets` order, and they affect only `frontmatter`, as defined in [Collection Model](collection-model.md).
10. Local `frontmatter`, `relationships`, and `headings` definitions in the selected concrete note-type schema file MUST be applied last.
11. The resulting `frontmatter`, `relationships`, and `headings` blocks, together with the direct top-level values from the selected concrete schema file and the effective inherited values of `kind`, `storage`, `template`, and `guidance`, are the effective note-type schema for that note type.
12. Managed-note, relationship, heading, template, and storage conformance MUST be evaluated against that effective note-type schema using the rule pages linked from this page.
13. This specification MUST NOT be interpreted as requiring a separate serialized effective-schema artifact on disk.

### Schema File Contract

Each `<metadata_directory>/schemas/<note_type>.yaml` MUST define exactly one note type and MUST follow this shape when it defines a concrete note type:

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
  file: "<metadata_directory>/templates/topic.md"

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
- `relationships`
- `headings`
- `guidance`

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
- Abstract note types MAY declare `kind`, `storage`, `template`, `frontmatter`, `relationships`, `headings`, and `guidance` to contribute reusable structure, but they are not required to declare them.
- If an abstract note type declares the core-defined `note_type` field in `frontmatter`, it MUST use `value_from_schema: note_type`.
- Concrete note types MAY inherit `kind`, `storage`, `template`, `guidance`, `frontmatter`, `relationships`, and `headings` from abstract ancestors and therefore MAY omit those keys locally.
- A concrete note type's effective schema MUST contain every top-level key listed above as required for concrete note types.
- If a schema physically declares `template`, `template.file` MUST be a relative path under `<metadata_directory>/templates/`.
- If a schema physically declares `template`, `template.file` MUST end in `.md`.
- The effective `template.file` of a concrete note type defines the canonical template for that note type.
- The `frontmatter` block semantics are defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- If a schema physically declares `frontmatter`, it MUST be a field-definition mapping, even when it is empty.
- Field definitions inside `frontmatter` MAY declare flat human-facing keys such as `label`, `description`, and `icon`, as defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- A note-type schema MAY declare `id` when that note type uses stable note-level identifiers.
- Frontmatter field names declared in a note-type schema MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The `relationships` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- If a schema physically declares `relationships`, it MUST contain both `belongs_to.allowed_note_types` and `related_to.allowed_note_types`, even when those mappings are empty.
- The `headings` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- If a schema physically declares `headings`, it MUST follow the heading shape required by [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `guidance` is human-facing explanatory content and MUST NOT override structural rules.
- `property_sets` MAY be omitted.
- Only concrete note types MAY declare `property_sets`.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `property_sets` is the opt-in mechanism for named reusable frontmatter field sets.
- Property-set definitions and merge rules are defined in [Collection Model](collection-model.md).
- Property sets affect frontmatter only; they do not make `relationships` or `headings` blocks optional.
- `inheritance` MAY be omitted.
- Only concrete note types MAY declare `inheritance`.
- A concrete note type MAY include an `inheritance` block to disable global inheritance entirely, to disable specific inherited global blocks, or to subtract individual inherited frontmatter fields.
- Collection-level merge and override rules are defined in [Collection Model](collection-model.md).
- The `inheritance` block affects collection-level `global_properties` inheritance only; note-type inheritance is defined only by `extends`.
- `inheritance.frontmatter_remove` can subtract frontmatter inherited from `global_properties` or abstract ancestors before property sets and local concrete schema definitions are applied.
- A concrete note type MAY omit individual inherited field definitions, relationship target definitions, or heading settings that remain unchanged.

### Abstract Inheritance Example

```yaml
# <metadata_directory>/schemas/person.yaml
specification_version: 0.0.1
note_type: person
abstract: true
label: Person
icon: user
description: Shared structure for person-like notes.

kind: entity

template:
  file: "<metadata_directory>/templates/person.md"

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

relationships:
  belongs_to:
    allowed_note_types: {}
  related_to:
    allowed_note_types: {}

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
# <metadata_directory>/schemas/customer.yaml
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

In that example, `customer` inherits `kind`, `template`, `guidance`, `note_type`, `title`, `email`, `relationships`, and `headings` from `person`, while adding its own concrete storage rule and local `customer_tier` field.

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

Special-case guidance:

- Fixed-path notes SHOULD be modeled as `singleton` note types.
- Examples include `Home.md`, `Guide.md`, and `Glossary.md`.
- A fixed-path singleton MAY omit `title` if the title is implied by the schema.
- A fixed-path singleton that inherits most global or abstract frontmatter but does not want `title` MAY use `inheritance.frontmatter_remove: [title]`.
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
- `note_name_pattern` MUST be a non-empty string.
- `note_name_pattern` MUST NOT contain `/` or `\`.
- `note_name_pattern` MUST NOT include the `.md` extension.
- Storage patterns are template strings composed of literal text plus zero or more placeholders.
- A placeholder has the form `{field_name}` or `{field_name:format}`.
- `field_name` in a storage placeholder MUST refer to a top-level effective frontmatter field name.
- Nested field references are not supported in storage patterns in this specification version.
- `{field_name}` inserts the concrete stored scalar value of that field.
- `{field_name:format}` is valid only when the stored value is a `date` or `datetime` field and `format` is one of `YYYY`, `MM`, `DD`, `YYYY-MM`, or `YYYY-MM-DD`.
- Storage placeholders MUST resolve from physically stored frontmatter values, not from note body content, inferred values, or template prose.
- A field used in a storage pattern MUST resolve to a concrete non-null scalar value when the managed note path is evaluated.
- List, tags, object, and `any` values MUST NOT be used in storage patterns.
- The active managed-note path is the resolved `folder_pattern` plus `/` plus the resolved `note_name_pattern` plus `.md`, unless `folder_pattern` is empty, in which case the active managed-note path is the resolved `note_name_pattern` plus `.md`.
- Validators MUST ensure a managed note path matches the resolved active storage path for its note type.
- If `archive.policy` is `mirror_under_archives` or `fixed`, the schema MUST also define `archive.folder_pattern` and `archive.note_name_pattern`.
- `archive.folder_pattern` and `archive.note_name_pattern` follow the same syntax and resolution rules as the active storage patterns.
- If `archive.policy` is `in_place_historical`, `archive.folder_pattern` and `archive.note_name_pattern` MUST be omitted.
- If a note is archived under `mirror_under_archives` or `fixed`, its archived path is resolved using `archive.folder_pattern` and `archive.note_name_pattern`.
- Tools that create managed notes MUST derive the initial note folder and note name from `storage.folder_pattern` and `storage.note_name_pattern` using the stored frontmatter values they are writing.
- A tool that creates a managed note MUST obtain every concrete value needed to resolve the storage patterns before writing the note.
- If required storage-pattern values are not yet known, a tool MUST ask for them or otherwise obtain them before claiming the created note conforms.
- If a note is archived, its `note_type` MUST remain unchanged.
- If a note declares `id`, its `id` MUST remain unchanged when the note is archived.
- `dated_record` note types SHOULD encode the date in both storage patterns and metadata when practical.

Example creation-oriented storage rules:

```yaml
storage:
  folder_pattern: "Meetings/{meeting_date:YYYY}/{meeting_date:MM}"
  note_name_pattern: "{meeting_date:YYYY-MM-DD} - Meeting - {title}"
  archive:
    policy: in_place_historical
```

Using that storage block, a tool creating a `meeting` note with `meeting_date: 2026-06-08` and `title: foo` MUST create the note at `Meetings/2026/06/2026-06-08 - Meeting - foo.md`.
