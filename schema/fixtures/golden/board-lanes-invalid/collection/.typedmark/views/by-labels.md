---
specification_version: 0.1.0
view: by-labels
description: Lanes over a list column.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: status, as: status}
    - {kind: field, field: labels, as: labels}
presentation:
  layout: board
  fields:
    - {column: path}
  board:
    column: status
    columns:
      - {value: todo}
    lanes: {column: labels}
---
