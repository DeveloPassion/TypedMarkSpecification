---
specification_version: 0.1.0
view: plan
description: Tasks as spans from start to end.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: start, as: start}
    - {kind: field, field: end, as: end}
presentation:
  layout: timeline
  fields:
    - {column: path}
  timeline:
    start: start
    end: end
    backlog: true
    writable: true
---
