---
specification_version: 0.1.0
description: A task under one or more parents, with an estimate, progress and a status.
storage: {folder_pattern: Tasks}
frontmatter:
  parent:
    type: list
    items: {type: link, format: note_link}
    nullable: true
  estimate: {type: number, nullable: true}
  progress: {type: number, nullable: true}
  status:
    type: text
    allowed_values: [todo, done]
    default_value: todo
    states:
      done: {done: true, outcome: success}
---
