---
specification_version: 0.0.1
note_type: reading-list
abstract: false
label: Reading List
icon: book
kind: entity
description: Curated reading list.
storage:
  folder_pattern: "Lists"
  note_name_pattern: "{title}"
  archive:
    policy: in_place_historical
template:
  file: "reading-list.md"
frontmatter:
  entries:
    type: list
    nullable: false
relationships:
  belongs_to:
    allowed_note_types: {}
  related_to:
    allowed_note_types: {}
headings:
  required_h2: []
  optional_h2: []
  allow_other_h2: true
  require_order: false
guidance:
  when_to_use: "Use for curated reading lists."
  when_not_to_use: "Do not use for individual sources."
---

INVALID SHAPE: a field definition with type: list must declare items.
This body is non-normative documentation; tools ignore it for structural reasoning.
