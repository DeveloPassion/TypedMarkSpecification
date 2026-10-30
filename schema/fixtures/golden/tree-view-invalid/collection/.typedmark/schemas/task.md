---
specification_version: 0.1.0
description: A task under one parent, optionally listed under several.
storage: {folder_pattern: Tasks}
frontmatter:
  status: {type: text, allowed_values: [todo, done], default_value: todo}
  parent: {type: link, format: note_link, nullable: true}
  parents:
    type: list
    items: {type: link, format: note_link}
    nullable: true
  origins:
    type: list
    items: {type: link, format: note_link}
    nullable: true
    immutable: true
---
