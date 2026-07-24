---
specification_version: 0.0.1
automation: set-unknown-project-field
description: Demonstrate an unresolved automation field target.
trigger:
  kind: event
  event: note.updated
scope:
  note_types:
    - project
actions:
  - kind: set_field
    field: missing_field
    value: true
---

INVALID SEMANTIC: `missing_field` is not declared by the effective `project`
frontmatter, so the action target does not resolve for every possible target.
