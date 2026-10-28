---
specification_version: 0.1.0
view: work-breakdown
description: Open tasks under their parents, with projects as context rows.
query:
  specification_version: 0.1.0
  note_types: [task]
  where: {kind: field, field: status, operator: equals, value: todo}
  select:
    - {kind: path, as: path}
    - {kind: field, field: parent, as: parent}
  order_by:
    - {column: path, direction: asc}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: parent
    context: ancestors
    writable: true
---
