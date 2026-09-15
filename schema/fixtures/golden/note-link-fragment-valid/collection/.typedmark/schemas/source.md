---
specification_version: 0.1.0
description: Internal Markdown fragment encoding.
storage: {folder_pattern: Notes, note_name_pattern: '{title}'}
frontmatter:
  references:
    type: list
    items: {type: link, format: note_link, validate_exists: true}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to:
    allowed_note_types:
      target: {min: 1, max: 1}
---
