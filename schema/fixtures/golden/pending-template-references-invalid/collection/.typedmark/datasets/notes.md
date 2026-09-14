---
specification_version: 0.1.0
dataset: notes
description: Published note paths.
row_identity: path
query:
  specification_version: 0.1.0
  note_types: [note]
  select:
    - kind: path
      as: path
    - kind: note_type
      as: type
---
