---
specification_version: 0.1.0
description: A project, filed under Archives by the year it was archived.
storage:
  folder_pattern: Projects
  archive:
    folder_pattern: "Archives/Projects/{date_archived:YYYY}"
frontmatter:
  status: {type: text, nullable: false, allowed_values: [active, done]}
  date_archived: {type: date, nullable: true}
---
