---
specification_version: 0.1.0
view: work-breakdown
description: A tree layout without its tree block.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
presentation:
  layout: tree
  fields:
    - {column: title}
---
