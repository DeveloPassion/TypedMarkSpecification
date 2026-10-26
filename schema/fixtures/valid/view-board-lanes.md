---
specification_version: 0.1.0
view: task-board-by-project
description: Open tasks by workflow state, one lane per project.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: status, as: status}
    - {kind: field, field: project, as: project}
presentation:
  layout: board
  fields:
    - {column: title}
  board:
    column: status
    columns:
      - {value: todo}
      - {value: done}
    lanes:
      column: project
      empty_label: No project
---

A board with swimlanes per project.
