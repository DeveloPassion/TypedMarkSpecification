---
specification_version: 0.1.0
description: A source with nested note-link fields and body links.
storage: {folder_pattern: Notes, note_name_pattern: '{title}'}
frontmatter:
  details:
    type: object
    fields:
      references:
        type: list
        items: {type: link, format: note_link, validate_exists: true}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to:
    allowed_note_types:
      target: {min: 1, max: 1}
---
