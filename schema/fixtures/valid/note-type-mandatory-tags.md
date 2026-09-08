---
specification_version: 0.1.0
note_type: project
label: Project
icon: folder-kanban
description: A project with type-specific mandatory tags.
mandatory_tags:
  - type/project
  - actionable
storage:
  folder_pattern: Projects
  note_name_pattern: "{title}"
---

Valid because a note-type schema may declare an ordered list of unique
mandatory tags.
