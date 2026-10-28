---
specification_version: 0.1.0
view: writable-list
description: Moves would rewrite a list of parents.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: parents, as: parents}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: parents
    writable: true
---
