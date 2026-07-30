---
specification_version: 0.0.1
view: actions-board
description: Shared actions arranged by status.
dataset: actions
presentation:
  layout: board
  fields:
    - {column: title, label: Action}
    - {column: type, label: Type}
  board:
    column: status
    columns:
      - {value: backlog, label: Backlog}
      - {value: active, label: Active}
      - {value: done, label: Done}
---
