---
specification_version: 0.1.0
automation: stamp-text
description: Demonstrate a trigger date written to a text field.
trigger:
  kind: event
  event: note.updated
scope:
  note_types:
    - project
actions:
  - kind: set_field
    field: status
    value_from: trigger_date
---

INVALID SEMANTIC: `trigger_date` needs a `date` field; `status` is text (`CM-563`).
