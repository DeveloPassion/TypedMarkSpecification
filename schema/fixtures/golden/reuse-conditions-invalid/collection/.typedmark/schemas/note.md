---
specification_version: 0.1.0
description: Conditions use effective comparisons and stored presence.
storage:
  folder_pattern: Notes
  note_name_pattern: "{title}"
frontmatter:
  status: {type: text, default_value: ready}
  reason: {type: text, nullable: true}
conditions:
  - when:
      status: {equals: ready}
    then:
      require: [reason]
  - when:
      status: {exists: false}
    then:
      require_null: [reason]
---
