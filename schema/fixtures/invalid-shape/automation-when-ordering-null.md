---
specification_version: 0.1.0
automation: null-bound
description: An ordering predicate with a null operand.
trigger:
  kind: event
  event: note.updated
when:
  copies:
    greater_than: null
actions:
  - kind: archive_note
---

INVALID SHAPE: ordering operands are non-null.
