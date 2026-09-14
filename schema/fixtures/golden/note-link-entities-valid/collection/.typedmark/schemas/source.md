---
specification_version: 0.1.0
description: A source with exactly one parent and body target.
storage: {folder_pattern: Notes, note_name_pattern: '{title}'}
frontmatter:
  parent: {type: link, format: note_link, validate_exists: true, relationship_kind: belongs_to}
relationships:
  belongs_to:
    allowed_note_types:
      parent: {min: 1, max: 1}
  related_to:
    allowed_note_types:
      note: {min: 1, max: 1}
      trap: {max: 0}
---
