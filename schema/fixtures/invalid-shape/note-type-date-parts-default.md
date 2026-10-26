---
specification_version: 0.1.0
note_type: weekly
description: A derived date part that also declares a default.
frontmatter:
  week_start: {type: date}
  year: {type: integer, default_value: 2026, from_date: {field: week_start, part: GGGG}}
storage:
  folder_pattern: Weekly
---

INVALID SHAPE: `from_date` excludes `default_value`.
This body is non-normative documentation; tools ignore it for structural reasoning.
