---
specification_version: 0.1.0
description: Tasks whose inputs name an undeclared and a generated field.
frontmatter:
  priority: {type: text, nullable: true}
  created: {type: datetime, generated: now, nullable: true}
storage: {folder_pattern: Tasks}
inputs: [priority, owner, created]
---
