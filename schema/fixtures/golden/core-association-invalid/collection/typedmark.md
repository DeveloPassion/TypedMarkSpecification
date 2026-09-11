---
specification_version: 0.1.0
name: core-association-invalid
description: Invalid winners never fall back and stored types cannot disagree.
note_type_mappings:
  - kind: fixed
    note_type: other
    when: {path: {equals: Mismatch.md}}
  - {kind: frontmatter_field, field: note_type}
  - kind: fixed
    note_type: note
    when: {path: {regex: '.*'}}
---
