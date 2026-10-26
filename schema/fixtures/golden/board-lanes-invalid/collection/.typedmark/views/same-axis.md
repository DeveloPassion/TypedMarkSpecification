---
specification_version: 0.1.0
view: same-axis
description: Lanes over the board column itself.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: status, as: status}
presentation:
  layout: board
  fields:
    - {column: path}
  board:
    column: status
    columns:
      - {value: todo}
    lanes: {column: status}
---
