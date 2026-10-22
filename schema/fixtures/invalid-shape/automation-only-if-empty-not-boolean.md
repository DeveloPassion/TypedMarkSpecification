---
specification_version: 0.1.0
automation: stamp-completion
description: Demonstrate a non-boolean only_if_empty flag.
trigger:
  kind: event
  event: note.updated
scope:
  note_types:
    - project
actions:
  - kind: set_field
    field: completed_on
    value: 2026-10-22
    only_if_empty: "yes"
---

INVALID SHAPE: `only_if_empty` must be a boolean.
