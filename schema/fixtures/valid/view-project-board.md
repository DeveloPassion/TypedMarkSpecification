---
specification_version: 0.0.1
view: project-board
label: Project Board
description: Active projects arranged by workflow state.
query:
  specification_version: 0.0.1
  note_types: [project]
  where:
    kind: field
    field: archived
    operator: equals
    value: false
  select:
    - kind: field
      field: title
      as: title
    - kind: field
      field: status
      as: status
    - kind: field
      field: due
      as: due
  order_by:
    - column: due
      direction: asc
      nulls: last
    - column: title
      direction: asc
  group_by: [status]
presentation:
  layout: board
  fields:
    - column: title
      label: Project
    - column: due
      label: Due
  board:
    column: status
    columns:
      - value: backlog
        label: Backlog
      - value: active
        label: Active
      - value: done
        label: Done
    unmapped_label: Other
---

This saved view is reusable by dashboards and tools.
