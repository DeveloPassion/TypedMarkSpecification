---
specification_version: 0.1.0
description: Daily notes naming their ISO week note and their month note.
frontmatter:
  date: {type: date, nullable: false}
  iso_year: {type: text, from_date: {field: date, part: GGGG}}
  week: {type: text, from_date: {field: date, part: WW}}
  week_note: {type: text, computed: '${iso_year}-W${week}'}
  month_note: {type: text, from_date: {field: date, part: YYYY-MM}}
storage:
  folder_pattern: "Daily/{date:GGGG}"
  note_name_pattern: "{date:YYYY-MM-DD}"
---
