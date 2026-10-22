---
specification_version: 0.1.0
automation: archive-finished-tasks
description: Archive tasks thirty days after completion.
trigger:
  kind: schedule
  schedule:
    cadence: daily
    at: "02:00"
scope:
  note_types:
    - task
when:
  status:
    equals: done
  completed_on:
    older_than: P30D
actions:
  - kind: archive_note
---

A grace period before archiving, evaluated at each scheduled instant.
