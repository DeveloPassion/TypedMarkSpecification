---
specification_version: 0.1.0
view: work-breakdown
description: A tree context that is not none or ancestors.
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
    context: everything
---
