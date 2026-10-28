---
specification_version: 0.1.0
view: stateless-done
description: A done value read from a column without states.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: parent, as: parent}
    - {kind: field, field: estimate, as: estimate}
    - {kind: field, field: progress, as: progress}
presentation:
  layout: tree
  fields:
    - {column: path}
    - {column: progress}
  tree:
    parent: parent
    rollups:
      - {column: progress, aggregate: max, state: parent, done_value: 100}
---
