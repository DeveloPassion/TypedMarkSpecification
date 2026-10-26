---
specification_version: 0.1.0
note_type: task
description: Tasks that ask for their priority and effort when created.
frontmatter:
  priority: {type: text, allowed_values: [high, medium, low], default_value: medium}
  effort: {type: text, allowed_values: [small, large], nullable: true}
storage:
  folder_pattern: Tasks
inputs: [priority, effort]
---

Valid schema with creation inputs: writers ask for priority, then effort.
This body is non-normative documentation; tools ignore it for structural reasoning.
