---
specification_version: 0.1.0
automation: flag-completion-review
description: Ask for a review when a project first becomes done.
trigger:
  kind: event
  event: note.updated
  changed:
    status:
      to_state: {done: true}
scope:
  note_types:
    - project
actions:
  - kind: set_field
    field: review_needed
    value: true
  - kind: add_tag
    tag: state/done
---

Reacts to any done status value, whatever it is called.
