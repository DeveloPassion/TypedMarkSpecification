---
specification_version: 0.1.0
view: constant-column
description: Moves would write a constant field.
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
    column: stage
    columns:
      - {value: open}
    writable: true
    rank: manual_order
---
