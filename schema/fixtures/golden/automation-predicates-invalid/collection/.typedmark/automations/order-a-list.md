---
specification_version: 0.1.0
automation: order-a-list
description: An ordering predicate on a list field.
trigger:
  kind: event
  event: note.updated
scope:
  note_types: [item]
when:
  ownership:
    greater_than: owned
actions:
  - kind: unset_field
    field: lent_on
---
