---
specification_version: 0.0.1
automation: project-completed
description: Archive a project when its status becomes done.
priority: 100
trigger:
  kind: event
  event: note.updated
  changed:
    status:
      to: done
scope:
  note_types:
    - project
when:
  archived:
    equals: false
actions:
  - kind: set_field
    field: review_needed
    value: false
  - kind: add_tag
    tag: state/completed
  - kind: archive_note
failure: abort
---

This automation applies one ordered, atomic action list to projects whose
stored status changes to `done`.
