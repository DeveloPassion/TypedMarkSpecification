---
specification_version: 0.0.1
automation: daily-review
description: Create one daily review note at the configured local time.
trigger:
  kind: schedule
  schedule:
    cadence: daily
    at: "18:00"
actions:
  - kind: create_note
    note_type: daily-review
    values:
      title: Daily review
---

Valid schedule-triggered automation.
