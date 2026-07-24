---
specification_version: 0.0.1
automation: invalid-weekly-schedule
description: Invalid weekly schedule without a weekday.
trigger:
  kind: schedule
  schedule:
    cadence: weekly
    at: "18:00"
actions:
  - kind: set_field
    field: review_needed
    value: true
---

Invalid because a weekly schedule must declare `weekday`.
