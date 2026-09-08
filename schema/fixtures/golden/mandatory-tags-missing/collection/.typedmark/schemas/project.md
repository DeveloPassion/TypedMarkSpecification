---
specification_version: 0.1.0
note_type: project
label: Project
icon: folder-kanban
description: A project tracked by the collection.
mandatory_tags:
  - project
  - type/project
  - managed
storage:
  folder_pattern: Projects
  note_name_pattern: "{title}"
frontmatter:
  title:
    type: text
    nullable: false
  tags:
    type: tags
    nullable: false
---

Projects carry collection and note-type mandatory tags.
