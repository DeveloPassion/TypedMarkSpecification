---
specification_version: 0.1.0
view: by-area
description: Tasks by status, one lane per area.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: status, as: status}
    - {kind: field, field: area, as: area}
presentation:
  layout: board
  fields:
    - {column: path}
  board:
    column: status
    columns:
      - {value: todo}
      - {value: done}
    lanes: {column: area, empty_label: No area}
---
