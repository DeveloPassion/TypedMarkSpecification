---
specification_version: 0.0.1
dataset: duplicate-identity
description: A dataset whose selected identity values are not unique at evaluation time.
row_identity: status
query:
  specification_version: 0.0.1
  note_types: [project]
  select:
    - {kind: field, field: status, as: status}
    - {kind: field, field: title, as: title}
---
