---
specification_version: 0.1.0
description: Strict note type that forbids other headings and links to notes.
storage: {folder_pattern: Notes, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to: {allowed_note_types: {note: {max: 0}}}
headings:
  required_h2: [Notes]
  allow_other_h2: false
---
