---
specification_version: 0.1.0
note_type: weekly
description: Weekly notes that store their ISO year and week.
frontmatter:
  week_start: {type: date, nullable: false}
  year: {type: integer, from_date: {field: week_start, part: GGGG}}
  week: {type: text, from_date: {field: week_start, part: WW}}
storage:
  folder_pattern: "Weekly/{week_start:GGGG}"
  note_name_pattern: "{week_start:GGGG}-W{week_start:WW}"
---

Valid schema with date parts derived from a sibling date.
This body is non-normative documentation; tools ignore it for structural reasoning.
