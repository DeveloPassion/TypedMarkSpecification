---
specification_version: 0.1.0
view: board
description: Tasks by status, ordered by hand.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: status, as: status}
    - {kind: field, field: stage, as: stage}
    - {kind: field, field: manual_order, as: manual_order}
presentation:
  layout: board
  fields:
    - {column: path}
  board:
    column: status
    columns:
      - {value: todo}
    writable: true
    rank: manual_order
---
