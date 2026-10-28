---
specification_version: 0.1.0
description: A task with scheduled, due, start and end dates.
storage: {folder_pattern: Tasks}
frontmatter:
  scheduled: {type: date, nullable: true}
  due: {type: datetime, nullable: true}
  start: {type: date, nullable: true}
  end: {type: date, nullable: true}
---
