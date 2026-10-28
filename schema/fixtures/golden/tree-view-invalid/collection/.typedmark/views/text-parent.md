---
specification_version: 0.1.0
view: text-parent
description: A tree whose parent column is text.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: status, as: status}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: status
---
