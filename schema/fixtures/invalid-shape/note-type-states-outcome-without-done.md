---
specification_version: 0.1.0
note_type: project
description: Project with an inconsistent state annotation.
storage:
  folder_pattern: projects
  note_name_pattern: "{title}"
frontmatter:
  status:
    type: text
    allowed_values: [backlog, completed]
    states:
      backlog: {outcome: success}
---

INVALID SHAPE: `outcome` requires `done: true` (FDR-290).
This body is non-normative documentation; tools ignore it for structural reasoning.
