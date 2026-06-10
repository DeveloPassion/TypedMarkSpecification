---
specification_version: 0.0.1
note_type: topic
abstract: false
label: Topic
icon: note
kind: entity
unknown_field: warn
description: Durable note about a specific topic.

property_sets:
  - workflow

storage:
  folder_pattern: "Topics"
  note_name_pattern: "{title}"
  note_name_suffix:
    pattern: " (Topic)"
    required: false
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
    targets: [domain]
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
      validate_exists: true
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
  created_on:
    label: Created On
    description: Creation date; never changes once set.
    icon: calendar
    type: date
    immutable: true
    nullable: true
    default_value: null
  summary:
    label: Summary
    description: Short overview used in generated references and previews.
    icon: paragraph
    type: text
    generated: true
    optional: true
    nullable: true
    default_value: ""
  details:
    label: Details
    description: Nested structured metadata.
    icon: package
    type: object
    optional: true
    nullable: true
    default_value: null
    fields:
      reviewed_on:
        type: date
        optional: true
        nullable: true

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
  optional_h2:
    - Context
    - Notes
  allow_other_h2: true
  require_order: false

guidance:
  when_to_use: "Use for a durable note about a specific topic."
  when_not_to_use: "Do not use for broad groupings, source material, or dated logs."
---

Valid concrete note-type schema (the topic example from note-type-schemas.md). In a real collection this file lives at <metadata_directory>/schemas/topic.yaml.
This body is non-normative documentation; tools ignore it for structural reasoning.
