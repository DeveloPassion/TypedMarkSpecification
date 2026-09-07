---
specification_version: 0.1.0
automation: invalid-empty-transition
description: A transition needs a target predicate to cross.
trigger:
  kind: event
  event: note.updated
  scope_transition: enters
actions:
  - kind: add_tag
    tag: state/entered
---

INVALID SHAPE: `enters` requires `scope`, `when`, or both.
