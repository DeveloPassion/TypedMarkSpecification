---
specification_version: 0.1.0
dataset: people
description: Stored computed names in deterministic path order.
row_identity: path
query:
  specification_version: 0.1.0
  note_types: [person]
  select:
    - {kind: path, as: path}
    - {kind: field, field: full, as: full}
  order_by:
    - {column: path}
---
