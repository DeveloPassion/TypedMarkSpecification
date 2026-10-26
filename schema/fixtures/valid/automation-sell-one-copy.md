---
specification_version: 0.1.0
automation: sell-one-copy
description: Stop offering an item for sale when one of several copies sells.
trigger:
  kind: event
  event: note.updated
  changed:
    sale_stage:
      to: sold
scope:
  note_types:
    - item
when:
  copies:
    greater_than: 1
    less_than_or_equal: 10
actions:
  - kind: remove_list_item
    field: ownership
    value: for_sale
---

Ordering predicates over an effective integer value.
