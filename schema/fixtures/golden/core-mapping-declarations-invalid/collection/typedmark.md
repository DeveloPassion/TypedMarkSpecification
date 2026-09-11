---
specification_version: 0.1.0
name: core-mapping-declarations-invalid
description: Mapping declarations are checked even with no notes.
note_type_mappings:
  - kind: fixed
    note_type: note
    when: {path: {regex: "["}}
  - {kind: folder, folder: Notes/, note_type: missing}
---
