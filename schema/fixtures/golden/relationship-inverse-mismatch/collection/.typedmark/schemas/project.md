---
specification_version: 0.1.0
description: Project listing its tasks.
storage: {folder_pattern: projects, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to: {allowed_note_types: {}}
  contains: {allowed_note_types: {task: {}}}
frontmatter:
  related_tasks:
    type: list
    items: {type: link, format: note_link, targets: [task]}
    relationship_kind: contains
    inverse: related_projects
    default_value: []
---
