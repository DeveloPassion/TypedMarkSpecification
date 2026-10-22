---
specification_version: 0.1.0
description: Project whose done state is not an allowed value.
storage: {folder_pattern: projects, note_name_pattern: "{title}"}
frontmatter:
  status:
    type: text
    allowed_values: [active, completed]
    states:
      done: {done: true, outcome: success}
---
