---
specification_version: 0.1.0
description: A task belonging to a project.
storage: {folder_pattern: tasks}
relationships:
  belongs_to: {allowed_note_types: {project: {}}}
  related_to: {allowed_note_types: {}}
frontmatter:
  project:
    type: link
    format: note_link
    targets: [project]
    relationship_kind: belongs_to
    nullable: true
---
