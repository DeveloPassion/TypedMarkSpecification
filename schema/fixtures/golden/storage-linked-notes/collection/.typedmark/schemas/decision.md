---
specification_version: 0.1.0
description: Decision log stored beside its project.
storage:
  folder_pattern: "{project:folder}/{project:name}"
  note_name_pattern: Decisions
relationships:
  belongs_to: {allowed_note_types: {project: {}}}
  related_to: {allowed_note_types: {}}
frontmatter:
  project:
    type: link
    format: note_link
    targets: [project]
    relationship_kind: belongs_to
    nullable: false
---
