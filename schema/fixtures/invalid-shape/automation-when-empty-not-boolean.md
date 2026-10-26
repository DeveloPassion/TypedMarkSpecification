---
specification_version: 0.1.0
automation: empty-word
description: An emptiness predicate given a word instead of a boolean.
trigger:
  kind: event
  event: note.updated
when:
  lent_to:
    empty: "yes"
actions:
  - kind: unset_field
    field: lent_on
---

INVALID SHAPE: `empty` must be a boolean.
