---
specification_version: 0.1.0
description: Weekly notes with their ISO year, quarter and week.
frontmatter:
  week_start: {type: date, nullable: false}
  year: {type: integer, from_date: {field: week_start, part: GGGG}}
  quarter: {type: integer, from_date: {field: week_start, part: Q}}
  week: {type: text, from_date: {field: week_start, part: WW}}
storage:
  folder_pattern: "Weekly/{week_start:GGGG}"
  note_name_pattern: "{week_start:GGGG}-W{week_start:WW}"
---
