---
specification_version: 0.1.0
automation: archive-old-tasks
description: Demonstrate an unsupported compound duration.
trigger:
  kind: schedule
  schedule:
    cadence: daily
    at: "02:00"
scope:
  note_types:
    - task
when:
  completed_on:
    older_than: P1M15D
actions:
  - kind: archive_note
---

INVALID SHAPE: `older_than` takes one non-zero year, month, week, or day component.
