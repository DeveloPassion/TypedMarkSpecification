---
specification_version: 0.1.0
view: plan
description: A calendar without date dimensions.
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
    dates: []
---
