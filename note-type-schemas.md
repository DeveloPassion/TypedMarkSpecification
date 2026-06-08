---
title: Note Type Schemas
parent: TypedMark
nav_order: 4
---

# Note Type Schemas

This page is authoritative for note type registration, the required top-level contract of `<metadata_directory>/schemas/<note_type>.yaml`, the effective note-type schema, optional property-set references, schema kinds, and storage rules. Field semantics and managed-note note-type association live in [Managed Notes and Properties](managed-notes-and-properties.md), relationship, heading, and template semantics live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md), and collection-level inheritance and property-set application live in [Collection Model](collection-model.md).

## Note Type Registry

The note type registry is implicit.

Rules:

- Every YAML file directly under `<metadata_directory>/schemas/` defines one note type.
- No separate registry file is maintained for note types.
- A note type MUST NOT be defined in more than one schema file.
- The schema file basename MUST equal the schema's `note_type` value.
- A managed note MUST conform to exactly one primary note type.
- The conformance requirements that determine when schema files MUST exist are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

## Effective Note-Type Schema

A managed note is evaluated against one effective note-type schema.

The effective note-type schema is not a separate stored artifact. It is the normative result of taking one note-type schema file and applying the collection-level inheritance, property-set, and block-merge rules defined by this specification before evaluating note conformance.

### Normative Evaluation Pipeline

Rules:

1. A tool or validator MUST resolve the note's note type using the note-type association rules defined in [Managed Notes and Properties](managed-notes-and-properties.md) and MUST select exactly one note-type schema file from `<metadata_directory>/schemas/` using that resolved identifier.
2. The selected note-type schema file provides the direct top-level values for `specification_version`, `note_type`, `label`, `icon`, `kind`, `description`, `storage`, `template`, and `guidance`.
3. The tool or validator MUST determine whether `global_properties.frontmatter`, `global_properties.relationships`, and `global_properties.headings` apply to that note type using the inheritance rules in [Collection Model](collection-model.md).
4. Enabled global blocks from `typedmark.yaml` MUST be applied first.
5. Referenced property sets, if any, MUST be applied next in the schema's declared `property_sets` order, and they affect only `frontmatter`, as defined in [Collection Model](collection-model.md).
6. Local `frontmatter`, `relationships`, and `headings` definitions in the note-type schema file MUST be applied last.
7. The resulting `frontmatter`, `relationships`, and `headings` blocks, together with the direct top-level values from the note-type schema file, are the effective note-type schema for that note type.
8. Managed-note, relationship, heading, template, and storage conformance MUST be evaluated against that effective note-type schema using the rule pages linked from this page.
9. This specification MUST NOT be interpreted as requiring a separate serialized effective-schema artifact on disk.

### Schema File Contract

Each `<metadata_directory>/schemas/<note_type>.yaml` MUST define one concrete note type and MUST follow this shape:

```yaml
specification_version: 0.0.1
note_type: topic
label: Topic
icon: note
kind: entity
description: Durable note about a specific topic.

property_sets:
  - workflow

storage:
  path_pattern: "Topics/{title}.md"
  archive:
    policy: mirror_under_archives
    archived_path_pattern: "Archives/Topics/{title}.md"

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

Required top-level keys:

- `specification_version`
- `note_type`
- `label`
- `icon`
- `kind`
- `description`
- `storage`
- `template`
- `frontmatter`
- `relationships`
- `headings`
- `guidance`

Rules:

- Every top-level key listed above MUST be physically present in each note-type schema.
- The effective note-type schema MUST be computed using the normative evaluation pipeline defined above.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- In schema files, `note_type` is the identifier of the note type being defined.
- In managed notes, `note_type`, when stored, is the core-defined frontmatter field that records the note type resolved for that note and may participate in explicit mapping rules.
- `label` is the human-facing name of the note type. MUST be a non-empty string.
- `description` is concise human-facing explanatory metadata for generated references and applications. MUST be a non-empty string.
- `icon` MUST be a non-empty string.
- `label`, `description`, and `icon` are flat human-facing metadata keys on the note-type schema; this specification does not define a separate display block for them.
- `icon` is human-facing note-type metadata for generated references and applications.
- The core specification treats `icon` as an opaque presentation token and does not standardize icon libraries or rendering behavior.
- Note-type schemas MUST declare a `template` block.
- `template.file` MUST be a relative path under `<metadata_directory>/templates/`.
- `template.file` MUST end in `.md`.
- `template.file` defines the canonical template for that note type.
- The `frontmatter` block semantics are defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The `frontmatter` block MUST be a field-definition mapping, even when it is empty.
- Field definitions inside `frontmatter` MAY declare flat human-facing keys such as `label`, `description`, and `icon`, as defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- A note-type schema MAY declare `id` when that note type uses stable note-level identifiers.
- Frontmatter field names declared in a note-type schema MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The `relationships` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- The `relationships` block MUST contain both `belongs_to.allowed_note_types` and `related_to.allowed_note_types`, even when those mappings are empty.
- The `headings` block semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- The `headings` block MUST be present even when the note type imposes no mandatory H2 headings.
- `guidance` is human-facing explanatory content and MUST NOT override structural rules.
- `property_sets` MAY be omitted.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `property_sets` is the opt-in mechanism for named reusable frontmatter field sets.
- Property-set definitions and merge rules are defined in [Collection Model](collection-model.md).
- Property sets affect frontmatter only; they do not make `relationships` or `headings` blocks optional.
- `inheritance` MAY be omitted.
- A note-type schema MAY include an `inheritance` block to disable global inheritance entirely or for specific blocks.
- Collection-level merge and override rules are defined in [Collection Model](collection-model.md).
- Inheritance affects the contents of `frontmatter`, `relationships`, and `headings`; property sets affect only `frontmatter`; neither mechanism makes required blocks optional.
- A note-type schema MAY omit individual inherited field definitions, relationship target definitions, or heading settings that remain unchanged.

## Allowed Schema Kinds

Each note type MUST declare one of these `kind` values:

- `singleton`
- `entity`
- `dated_record`
- `rule_set`

Definitions:

- `singleton`: one canonical fixed-path note
- `entity`: durable note for a long-lived thing
- `dated_record`: time-based note whose path includes a date
- `rule_set`: conventions, rules, style, or governance note

Special-case guidance:

- Fixed-path notes SHOULD be modeled as `singleton` note types.
- Examples include `Home.md`, `Guide.md`, and `Glossary.md`.
- A fixed-path singleton MAY omit `title` if the title is implied by the schema.
- A fixed-path singleton MAY omit stored `note_type` when the collection's mapping rules and effective schema do not require it to be present.

## Storage Rules

Every note type schema MUST define storage rules.

Required storage fields:

- `path_pattern`
- `archive.policy`

Allowed archive policies:

- `mirror_under_archives`
- `in_place_historical`
- `fixed`

Rules:

- `path_pattern` and `archived_path_pattern`, when present, are relative to the collection root.
- Validators MUST ensure a managed note path matches its schema `path_pattern`.
- If `archive.policy` is `mirror_under_archives`, the schema MUST also define `archived_path_pattern`.
- If a note is archived, its `note_type` MUST remain unchanged.
- If a note declares `id`, its `id` MUST remain unchanged when the note is archived.
- `dated_record` note types SHOULD encode the date in both path and metadata when practical.
