---
specification_version: 0.1.0
description: Meeting with two related_to fields admitting person.
storage: {folder_pattern: meeting, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to: {allowed_note_types: {person: {}}}
frontmatter:
  attendees:
    type: list
    items: {type: link, format: note_link, targets: [person]}
    relationship_kind: related_to
    default_value: []
  organizers:
    type: list
    items: {type: link, format: note_link, targets: [person]}
    relationship_kind: related_to
    default_value: []
---
