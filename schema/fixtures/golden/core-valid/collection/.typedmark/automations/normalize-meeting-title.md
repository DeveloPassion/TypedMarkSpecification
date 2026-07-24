---
specification_version: 0.0.1
automation: normalize-meeting-title
description: Give newly created meeting notes a stable initial title.
trigger:
  kind: event
  event: note.created
scope:
  note_types:
    - meeting
actions:
  - kind: set_field
    field: title
    value: Untitled meeting
---

This automation demonstrates a valid governed automation artifact.
