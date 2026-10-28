---
specification_version: 0.1.0
view: shared-work
description: Tasks under every parent they list, read-only.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: path, as: path}
    - {kind: field, field: parents, as: parents}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: parents
---
