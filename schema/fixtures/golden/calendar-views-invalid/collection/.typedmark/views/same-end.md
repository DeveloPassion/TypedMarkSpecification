---
specification_version: 0.1.0
view: same-end
description: A timeline ending on its own start column.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: start, as: start}
presentation:
  layout: timeline
  fields:
    - {column: path}
  timeline:
    start: start
    end: start
---
