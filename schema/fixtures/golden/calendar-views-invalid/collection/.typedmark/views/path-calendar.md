---
specification_version: 0.1.0
view: path-calendar
description: A calendar over a text column.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: scheduled, as: scheduled}
presentation:
  layout: calendar
  fields:
    - {column: path}
  calendar:
    dates:
      - {column: scheduled}
      - {column: path}
---
