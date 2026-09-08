---
specification_version: 0.1.0
note_type: escapee
abstract: false
label: Escapee
icon: alert
description: Note type whose storage folder tries to escape the collection.
storage:
  folder_pattern: "../Outside"
  note_name_pattern: "{title}"
template:
  file: "escapee.md"
frontmatter: {}
---

INVALID SHAPE: folder_pattern must not contain `.` or `..` path segments.
This body is non-normative documentation; tools ignore it for structural reasoning.
