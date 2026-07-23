---
specification_version: 0.0.1
note_type: project
label: Project
icon: folder-kanban
description: A project with an unsatisfied mandatory-tag contract.
mandatory_tags:
  - type/project
frontmatter:
  title:
    type: text
---

Shape-valid but semantically invalid because a non-empty effective
`mandatory_tags` policy requires an effective top-level `tags` field with
`type: tags`.
