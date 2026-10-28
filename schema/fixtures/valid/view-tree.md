---
specification_version: 0.1.0
view: work-breakdown
description: Tasks under their parents, with filtered-out ancestors as context.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: parent, as: parent}
presentation:
  layout: tree
  fields:
    - {column: title}
  tree:
    parent: parent
    context: ancestors
    writable: true
---

A writable tree with context ancestors.
