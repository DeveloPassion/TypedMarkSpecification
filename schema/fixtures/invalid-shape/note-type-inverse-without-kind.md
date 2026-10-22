---
specification_version: 0.1.0
note_type: task
description: Task whose inverse field is not relationship-bearing.
storage:
  folder_pattern: tasks
  note_name_pattern: "{title}"
frontmatter:
  related_projects:
    type: list
    items: {type: link, format: note_link, targets: [project]}
    inverse: related_tasks
---

INVALID SHAPE: `inverse` requires `relationship_kind` on the same field.
This body is non-normative documentation; tools ignore it for structural reasoning.
