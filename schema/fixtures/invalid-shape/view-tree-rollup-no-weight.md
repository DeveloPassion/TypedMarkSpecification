---
specification_version: 0.1.0
view: breakdown
description: A weighted mean without its weight.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: parent, as: parent}
    - {kind: field, field: estimate, as: estimate}
    - {kind: field, field: progress, as: progress}
    - {kind: field, field: status, as: status}
presentation:
  layout: tree
  fields:
    - {column: title}
    - {column: estimate}
    - {column: progress}
  tree:
    parent: parent
    rollups:
      - {column: progress, aggregate: weighted_mean}
---
