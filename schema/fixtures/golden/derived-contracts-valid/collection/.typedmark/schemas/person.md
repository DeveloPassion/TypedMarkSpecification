---
specification_version: 0.1.0
description: A person with a stored computed name.
storage:
  folder_pattern: People
  note_name_pattern: "{title}"
frontmatter:
  first: {type: text, default_value: Ada}
  last: {type: text}
  full: {type: text, computed: '${first} ${last}'}
  status: {type: text, allowed_values: [open, done], default_value: open}
---
