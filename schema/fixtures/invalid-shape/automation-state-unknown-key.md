---
specification_version: 0.1.0
automation: unknown-state-key
description: Demonstrate an unsupported state predicate key.
trigger:
  kind: event
  event: note.updated
scope:
  note_types:
    - project
when:
  status:
    state: {finished: true}
actions:
  - kind: archive_note
---

INVALID SHAPE: `state` predicates accept only `done`, `outcome`, and `role`.
