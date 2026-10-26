---
specification_version: 0.1.0
description: A task with a status, an area and labels.
storage: {folder_pattern: Tasks}
frontmatter:
  status: {type: text, allowed_values: [todo, done]}
  area: {type: text, nullable: true}
  labels: {type: list, items: {type: text}, nullable: true}
---
