---
specification_version: 0.1.0
note_type: task
description: A task belonging to a project.
storage:
  folder_pattern: Tasks
  note_name_pattern: '{title}'
frontmatter:
  status: {type: text, default_value: draft}
  priority: {type: integer, nullable: true}
  estimate: {type: number, nullable: true}
  project: {type: link, format: note_link, nullable: true, relationship_kind: belongs_to}
relationships:
  belongs_to:
    allowed_note_types: {project: {}}
  related_to:
    allowed_note_types: {}
---
