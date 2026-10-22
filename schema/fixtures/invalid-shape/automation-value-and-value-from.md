---
specification_version: 0.1.0
automation: double-stamp
description: Demonstrate a set_field with both a literal and a derived value.
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
    value_from: trigger_date
---

INVALID SHAPE: `set_field` declares exactly one of `value` or `value_from` (`CM-270`).
