---
specification_version: 0.1.0
view: plan
description: Tasks on their start and due days.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: start, as: start}
    - {kind: field, field: due, as: due}
presentation:
  layout: calendar
  fields:
    - {column: title}
  calendar:
    dates:
      - {column: start, label: Start}
      - {column: due}
    backlog: true
    writable: true
---
