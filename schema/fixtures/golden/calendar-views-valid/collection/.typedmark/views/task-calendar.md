---
specification_version: 0.1.0
view: task-calendar
description: Tasks on their scheduled and due days.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: scheduled, as: scheduled}
    - {kind: field, field: due, as: due}
  order_by:
    - {column: path, direction: asc}
presentation:
  layout: calendar
  fields:
    - {column: path}
  calendar:
    dates:
      - {column: scheduled, label: Scheduled}
      - {column: due, label: Due}
    backlog: true
    writable: true
---
