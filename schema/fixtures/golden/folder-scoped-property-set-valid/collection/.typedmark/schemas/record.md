---
specification_version: 0.0.1
note_type: record
label: Record
icon: file-text
kind: entity
description: A record stored in its category folder.
storage:
  folder_pattern: "{category}"
  note_name_pattern: "{title}"
frontmatter:
  note_type:
    type: text
    const_value: record
  title:
    type: text
    nullable: false
    not_blank: true
  category:
    type: text
    nullable: false
    not_blank: true
---

The path-dependent `location` field is intentionally absent from this schema.
