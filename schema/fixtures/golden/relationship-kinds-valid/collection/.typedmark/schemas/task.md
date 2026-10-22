---
specification_version: 0.1.0
description: Task with prerequisite tasks.
storage: {folder_pattern: tasks, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to: {allowed_note_types: {}}
  depends_on: {allowed_note_types: {task: {}}}
frontmatter:
  blocked_by:
    type: list
    items: {type: link, format: note_link, targets: [task]}
    relationship_kind: depends_on
    default_value: []
---
