---
specification_version: 0.1.0
note_type: meeting-record
description: A meeting record explicitly requiring location metadata.
property_sets: [location-context]
storage:
  folder_pattern: Meetings
  note_name_pattern: "{title}"
frontmatter:
  title:
    type: text
    nullable: false
  category:
    type: text
    nullable: false
---
