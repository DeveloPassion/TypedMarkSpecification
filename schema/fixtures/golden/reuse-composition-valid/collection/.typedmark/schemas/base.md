---
specification_version: 0.1.0
abstract: true
description: Reusable structure, not a managed-note identity.
storage:
  folder_pattern: Notes
  note_name_pattern: "{title}"
mandatory_tags: [base]
count: {min: 1}
frontmatter:
  status: {type: text, regex: ready, default_value: ready}
  removed: {type: integer}
conditions:
  - when:
      status: {equals: null}
    then:
      require: [reason]
---
