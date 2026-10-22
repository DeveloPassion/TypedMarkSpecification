---
specification_version: 0.1.0
description: Dated entries with a field-derived prefix and a free remainder.
frontmatter:
  day: {type: date}
storage:
  folder_pattern: journal
  note_name_prefix: {pattern: "{day:YYYY-MM-DD} "}
  note_name_regex: "^\\S.*$"
---
