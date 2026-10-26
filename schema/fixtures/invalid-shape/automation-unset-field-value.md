---
specification_version: 0.1.0
automation: clear-with-value
description: An unset_field action that also carries a value.
trigger:
  kind: event
  event: note.updated
actions:
  - kind: unset_field
    field: lent_on
    value: null
---

INVALID SHAPE: `unset_field` declares only `field`.
