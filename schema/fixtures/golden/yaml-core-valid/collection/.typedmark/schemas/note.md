---
%YAML 1.1
--- # YAML document marker, not the frontmatter closer.
specification_version: 0.1.0
description: no
storage: {folder_pattern: Notes, note_name_pattern: '{title}'}
frontmatter:
  status: {type: text, allowed_values: [yes, no, on, off]}
  amount: {type: integer, default_value: 012, allowed_values: [12]}
  date: {type: date}
  enabled: {type: checkbox}
---

Core words and numeric forms retain their declared meanings.
