---
specification_version: 0.1.0
note_type: task
description: A task with time entries.
frontmatter:
  time_entries:
    type: list
    nullable: true
    items:
      type: object
      fields:
        startTime:
          type: datetime
        endTime:
          type: datetime
          nullable: true
storage:
  folder_pattern: Tasks
---
