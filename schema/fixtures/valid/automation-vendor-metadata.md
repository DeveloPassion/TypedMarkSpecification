---
specification_version: 0.1.0
automation: daily-review
description: An automation with an inert editor preference.
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
x_editor: false
---
