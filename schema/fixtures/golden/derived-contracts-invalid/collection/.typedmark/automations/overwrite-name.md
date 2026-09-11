---
specification_version: 0.1.0
automation: overwrite-name
description: Invalid assignment to a computed field.
trigger:
  kind: event
  event: note.updated
scope:
  note_types: [person]
actions:
  - {kind: set_field, field: full, value: Other}
---
