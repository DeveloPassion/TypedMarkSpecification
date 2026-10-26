---
specification_version: 0.1.0
view: lanes-without-column
description: Lanes without a column.
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
    lanes:
      empty_label: No project
---

INVALID SHAPE: `lanes` requires `column`.
