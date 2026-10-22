---
specification_version: 0.1.0
description: Task whose project field admits an undeclared target.
storage: {folder_pattern: task, note_name_pattern: "{title}"}
relationships:
  belongs_to: {allowed_note_types: {project: {}}}
  related_to: {allowed_note_types: {}}
frontmatter:
  related_projects:
    type: list
    items: {type: link, format: note_link, targets: [project, person]}
    relationship_kind: belongs_to
    default_value: []
---
