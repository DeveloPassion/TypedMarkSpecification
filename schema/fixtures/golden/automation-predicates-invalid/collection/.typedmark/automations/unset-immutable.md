---
specification_version: 0.1.0
automation: unset-immutable
description: A field removal on an immutable field.
trigger:
  kind: event
  event: note.updated
scope:
  note_types: [item]
actions:
  - kind: unset_field
    field: acquired_on
---
