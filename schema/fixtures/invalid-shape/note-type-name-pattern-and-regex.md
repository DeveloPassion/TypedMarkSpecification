---
specification_version: 0.1.0
note_type: concept
description: Note type mixing a derived name with a free-name constraint.
storage:
  folder_pattern: notes
  note_name_pattern: "{title}"
  note_name_regex: "^[a-z]+$"
---

INVALID SHAPE: note_name_regex constrains a free name and cannot accompany note_name_pattern.
This body is non-normative documentation; tools ignore it for structural reasoning.
