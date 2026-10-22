---
specification_version: 0.1.0
note_type: decision
description: Decision record with described sections and a capture heading.
storage:
  folder_pattern: decisions
  note_name_pattern: "{title}"
headings:
  required_h2:
    - text: Context
      description: Why this decision was needed.
    - Decision
  optional_h2: [Notes]
  capture_h2: Notes
---

Valid concrete note-type schema mixing string and described heading entries.
This body is non-normative documentation; tools ignore it for structural reasoning.
