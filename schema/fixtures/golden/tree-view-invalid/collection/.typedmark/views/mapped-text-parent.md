---
specification_version: 0.1.0
view: mapped-text-parent
description: A mapped parent that is not a link.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - kind: mapped_field
      as: parent
      definition: {type: text, nullable: true}
      sources:
        - {note_types: [task], field: status}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: parent
---
