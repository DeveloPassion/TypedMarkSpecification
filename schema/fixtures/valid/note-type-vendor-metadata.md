---
specification_version: 0.1.0
note_type: topic
label: Topic
icon: file
description: A topic with an inert editing preference.
storage:
  folder_pattern: Topics
  note_name_pattern: "{title}"
frontmatter:
  title:
    type: text
  x_notes:
    type: text
x_editor:
  color: blue
---

The top-level `x_editor` is metadata. The declared field `x_notes` is still a
normal managed-note field whose value is governed by its field definition.
