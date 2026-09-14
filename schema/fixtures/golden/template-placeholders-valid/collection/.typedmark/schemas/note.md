---
specification_version: 0.1.0
description: Template target.
storage: {folder_pattern: '', note_name_pattern: '{title}'}
frontmatter:
  details:
    type: object
    not_empty: true
    fields:
      status: {type: text, default_value: open}
  statuses:
    type: list
    items: {type: text}
    allowed_values: [open]
  summary: {type: text}
---
