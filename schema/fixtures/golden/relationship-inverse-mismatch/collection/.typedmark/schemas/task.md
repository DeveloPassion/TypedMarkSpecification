---
specification_version: 0.1.0
description: Task belonging to projects.
storage: {folder_pattern: tasks, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {project: {}}}
  related_to: {allowed_note_types: {}}
frontmatter:
  related_projects:
    type: list
    items: {type: link, format: note_link, targets: [project]}
    relationship_kind: belongs_to
    inverse: related_tasks
    default_value: []
---
