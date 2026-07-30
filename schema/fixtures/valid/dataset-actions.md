---
specification_version: 0.0.1
dataset: actions
label: Actions
description: Projects and tasks exposed through one stable row contract.
row_identity: path
query:
  specification_version: 0.0.1
  note_types: [project, task]
  select:
    - {kind: path, as: path}
    - {kind: note_type, as: type}
    - kind: mapped_field
      as: status
      definition:
        type: text
        nullable: true
      sources:
        - note_types: [project]
          field: status
        - note_types: [task]
          field: action_status
    - {kind: field, field: title, as: title}
  order_by:
    - {column: status, direction: asc}
    - {column: title, direction: asc}
---

The shared action rows can be presented in several ways.
