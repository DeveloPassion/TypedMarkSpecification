---
specification_version: 0.1.0
dataset: notes
description: Query concrete descendants through their effective schemas.
row_identity: path
query:
  specification_version: 0.1.0
  note_types: [base]
  where:
    kind: field
    field: status
    operator: equals
    value: null
  select:
    - {kind: path, as: path}
    - {kind: field, field: reason, as: reason}
---
