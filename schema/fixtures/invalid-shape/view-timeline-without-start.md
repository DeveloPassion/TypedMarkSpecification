---
specification_version: 0.1.0
view: plan
description: A timeline without a start column.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: start, as: start}
    - {kind: field, field: due, as: due}
presentation:
  layout: timeline
  fields:
    - {column: title}
  timeline:
    end: due
---
