---
specification_version: 0.0.1
note_type: project
label: Project
icon: folder-kanban
description: A project tracked by the collection.
kind: entity
mandatory_tags:
  - type/project
  - managed
storage:
  folder_pattern: Projects
  note_name_pattern: "{title}"
frontmatter:
  note_type:
    type: text
    const_value: project
  title:
    type: text
    nullable: false
  tags:
    type: tags
    nullable: false
---

Projects carry collection, folder, and note-type mandatory tags.
