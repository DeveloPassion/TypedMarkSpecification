---
specification_version: 0.1.0
description: Computed fields remain stored fields.
storage:
  folder_pattern: People
  note_name_pattern: "{title}"
frontmatter:
  first: {type: text}
  full: {type: text, computed: '${uppercase(first)}'}
---
