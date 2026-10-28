---
specification_version: 0.1.0
description: Monthly notes.
frontmatter:
  month_start: {type: date, nullable: false}
storage:
  folder_pattern: "Monthly/{month_start:YYYY}"
  note_name_pattern: "{month_start:YYYY-MM}"
---
