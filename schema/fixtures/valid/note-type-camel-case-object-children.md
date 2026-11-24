---
specification_version: 0.1.0
note_type: task
label: Task
icon: check
description: A task with time entries in the format that some editors write.
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
  note_name_pattern: "{title}"
---

Valid because a field declared in an `object.fields` mapping may use lower
camel case (`MN-322`).
