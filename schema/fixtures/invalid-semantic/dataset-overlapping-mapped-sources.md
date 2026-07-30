---
specification_version: 0.0.1
dataset: ambiguous-actions
description: A mapped column with overlapping source domains.
row_identity: path
query:
  specification_version: 0.0.1
  note_types: [project]
  select:
    - {kind: path, as: path}
    - kind: mapped_field
      as: status
      definition: {type: text}
      sources:
        - {note_types: [project], field: status}
        - {note_types: [project], field: action_status}
---
