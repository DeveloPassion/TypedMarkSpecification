---
specification_version: 0.1.0
description: Task whose vocabulary-backed states are valid.
storage: {folder_pattern: tasks, note_name_pattern: "{title}"}
frontmatter:
  status:
    type: text
    allowed_values_from: lifecycle
    states:
      open: {role: active}
      closed: {done: true}
---
