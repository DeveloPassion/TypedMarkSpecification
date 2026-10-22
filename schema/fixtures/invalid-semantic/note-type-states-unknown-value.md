---
specification_version: 0.1.0
note_type: note-type-states-unknown-value
description: Project whose state annotation names a value that is not allowed.
storage:
  folder_pattern: projects
  note_name_pattern: "{title}"
frontmatter:
  status:
    type: text
    allowed_values: [active, completed]
    states:
      done: {done: true}
---

VALID SHAPE, INVALID SEMANTICS: `done` is not an allowed value of `status` (FDR-288).
This body is non-normative documentation; tools ignore it for structural reasoning.
