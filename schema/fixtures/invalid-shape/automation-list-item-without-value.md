---
specification_version: 0.1.0
automation: add-project-watcher
description: Demonstrate a list-item action without an item value.
trigger:
  kind: event
  event: note.created
scope:
  note_types:
    - project
actions:
  - kind: add_list_item
    field: watchers
---

INVALID SHAPE: `add_list_item` must declare the item `value` it appends.
