---
specification_version: 0.1.0
automation: archive-by-text
description: Demonstrate older_than on a non-temporal field.
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
    older_than: P30D
actions:
  - kind: archive_note
---

INVALID SEMANTIC: `status` is a text field; `older_than` needs a top-level
`date` or `datetime` field (`CM-557`).
