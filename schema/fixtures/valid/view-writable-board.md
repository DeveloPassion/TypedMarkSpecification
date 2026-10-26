---
specification_version: 0.1.0
view: task-board
description: Tasks moved between columns and ordered by hand.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: status, as: status}
    - {kind: field, field: manual_order, as: manual_order}
presentation:
  layout: board
  fields:
    - {column: title}
  board:
    column: status
    columns:
      - {value: todo}
      - {value: done}
    writable: true
    rank: manual_order
---

A writable board with a rank field.
