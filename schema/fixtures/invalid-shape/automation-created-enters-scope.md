---
specification_version: 0.0.1
automation: invalid-created-enters
description: A created event cannot express an enters transition.
trigger:
  kind: event
  event: note.created
  scope_transition: enters
scope:
  note_types:
    - project
actions:
  - kind: add_tag
    tag: state/new
---

INVALID SHAPE: `enters` requires an event kind with both before and after
snapshots, while `note.created` has only an after snapshot.
