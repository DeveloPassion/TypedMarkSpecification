---
specification_version: 0.1.0
note_type: project
label: Project
icon: folder-kanban
description: A project whose tags field is supplied by the Core contract.
mandatory_tags:
  - type/project
frontmatter:
  title:
    type: text
storage:
  folder_pattern: Projects
  note_name_pattern: "{title}"
---

Mandatory tags imply the Core tags field; a duplicate field declaration is unnecessary.
