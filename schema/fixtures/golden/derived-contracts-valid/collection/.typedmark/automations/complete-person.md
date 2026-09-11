---
specification_version: 0.1.0
automation: complete-person
description: A valid declaration, never executed during validation.
trigger:
  kind: event
  event: note.updated
scope:
  note_types: [person]
when:
  status: {equals: open}
actions:
  - {kind: set_field, field: status, value: done}
  - {kind: archive_note}
---
