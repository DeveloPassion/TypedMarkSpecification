---
specification_version: 0.1.0
description: Weekly notes naming the month note of their first day.
frontmatter:
  week_start: {type: date, nullable: false}
  month_note: {type: text, from_date: {field: week_start, part: YYYY-MM}}
storage:
  folder_pattern: "Weekly/{week_start:GGGG}"
  note_name_pattern: "{week_start:GGGG}-W{week_start:WW}"
---
