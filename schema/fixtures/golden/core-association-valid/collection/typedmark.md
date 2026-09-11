---
specification_version: 0.1.0
name: core-association-valid
description: Ordered association, stored predicates, and untyped notes.
exclude_paths: ["**/Excluded.md"]
note_type_mappings:
  - kind: fixed
    note_type: other
    when: {path: {equals: Preferred.md}}
  - {kind: frontmatter_field, field: note_type}
  - kind: fixed
    note_type: note
    when:
      path: {regex: 'Selected.*\.md'}
      frontmatter:
        description: {regex: "é"}
        sample: {equals: {second: [1, 2], first: "é"}}
        tags: {contains_all: [alpha, beta]}
  - kind: fixed
    note_type: note
    when:
      path: {regex: 'Empty.*\.md'}
      frontmatter: {description: {exists: false}}
  - {kind: tag, tag: topic, note_type: note}
  - kind: fixed
    note_type: note
    when: {path: {equals: Preferred.md}}
---
