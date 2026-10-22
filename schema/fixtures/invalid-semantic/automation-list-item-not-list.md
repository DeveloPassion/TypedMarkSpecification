---
specification_version: 0.1.0
automation: add-item-to-scalar
description: Demonstrate a list-item action on a scalar field.
trigger:
  kind: event
  event: note.updated
scope:
  note_types:
    - project
actions:
  - kind: add_list_item
    field: status
    value: done
---

INVALID SEMANTIC: `status` is a scalar field, so `add_list_item` has no list to
append to (`MN-311`).
