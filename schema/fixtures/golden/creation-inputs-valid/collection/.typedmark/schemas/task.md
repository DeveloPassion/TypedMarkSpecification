---
specification_version: 0.1.0
description: Tasks that ask for priority and effort.
frontmatter:
  priority: {type: text, allowed_values: [high, medium, low], default_value: medium}
  effort: {type: text, allowed_values: [small, large], nullable: true}
storage: {folder_pattern: Tasks}
inputs: [priority, effort, title]
---
