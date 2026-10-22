---
specification_version: 0.1.0
note_type: project
description: Project whose status values carry lifecycle meaning.
storage:
  folder_pattern: projects
  note_name_pattern: "{title}"
frontmatter:
  status:
    type: text
    allowed_values: [backlog, active, waiting, completed, cancelled]
    states:
      backlog: {role: backlog}
      active: {role: active}
      waiting: {role: waiting}
      completed: {done: true, outcome: success}
      cancelled: {done: true, outcome: failure}
---

Valid concrete note-type schema with lifecycle states on its status field.
This body is non-normative documentation; tools ignore it for structural reasoning.
