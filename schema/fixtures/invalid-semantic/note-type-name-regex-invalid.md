---
specification_version: 0.1.0
note_type: note-type-name-regex-invalid
description: Note type whose free-name constraint is not a valid regular expression.
storage:
  folder_pattern: notes
  note_name_regex: "^[a-z+$"
---

VALID SHAPE, INVALID SEMANTICS: note_name_regex is not a valid ECMA-262 regular expression (FND-31).
This body is non-normative documentation; tools ignore it for structural reasoning.
