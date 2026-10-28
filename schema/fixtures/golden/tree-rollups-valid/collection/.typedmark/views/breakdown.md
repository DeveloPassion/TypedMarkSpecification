---
specification_version: 0.1.0
view: breakdown
description: Tasks with estimates summed and progress weighted by estimate.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: parent, as: parent}
    - {kind: field, field: estimate, as: estimate}
    - {kind: field, field: progress, as: progress}
    - {kind: field, field: status, as: status}
  order_by:
    - {column: path, direction: asc}
presentation:
  layout: tree
  fields:
    - {column: path}
    - {column: estimate}
    - {column: progress}
    - {column: status}
  tree:
    parent: parent
    rollups:
      - {column: path, aggregate: count}
      - {column: estimate, aggregate: sum}
      - {column: progress, aggregate: weighted_mean, weight: estimate, state: status, done_value: 100}
---
