---
specification_version: 0.1.0
view: task-board
description: A writable switch given as a word.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: status, as: status}
presentation:
  layout: board
  fields:
    - {column: status}
  board:
    column: status
    columns:
      - {value: todo}
    writable: "yes"
---

INVALID SHAPE: `writable` must be a boolean.
