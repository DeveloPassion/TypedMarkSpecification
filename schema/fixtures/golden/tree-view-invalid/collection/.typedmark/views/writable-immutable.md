---
specification_version: 0.1.0
view: writable-immutable
description: Moves would rewrite an immutable list of parents.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: origins, as: origins}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: origins
    writable: true
---
