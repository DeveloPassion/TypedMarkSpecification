---
specification_version: 0.1.0
description: A task with dates, one of them fixed.
storage: {folder_pattern: Tasks}
frontmatter:
  scheduled: {type: date, nullable: true}
  due: {type: datetime, nullable: true}
  start: {type: date, nullable: true}
  end: {type: date, nullable: true}
  kickoff: {type: date, nullable: true, const_value: 2026-01-05}
---
