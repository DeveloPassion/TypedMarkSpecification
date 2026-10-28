---
specification_version: 0.1.0
view: fixed-date
description: A writable calendar over a constant date.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: kickoff, as: kickoff}
presentation:
  layout: calendar
  fields:
    - {column: path}
  calendar:
    dates:
      - {column: kickoff}
    writable: true
---
