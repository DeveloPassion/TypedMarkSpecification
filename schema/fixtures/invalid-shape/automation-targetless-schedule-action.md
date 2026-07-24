---
specification_version: 0.0.1
automation: invalid-targetless-schedule
description: A targetless schedule cannot update a field.
trigger:
  kind: schedule
  schedule:
    cadence: daily
    at: "18:00"
actions:
  - kind: set_field
    field: status
    value: done
---

INVALID SHAPE: a schedule without `scope` or `when` can only create notes.
