---
specification_version: 0.1.0
description: A task with a status, a fixed stage and a manual order.
storage: {folder_pattern: Tasks}
frontmatter:
  status: {type: text, allowed_values: [todo, done]}
  stage: {type: text, nullable: true, const_value: open}
  manual_order: {type: number, nullable: true}
---
