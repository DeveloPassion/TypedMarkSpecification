---
specification_version: 0.1.0
description: URI fields and an internal note reference.
storage: {folder_pattern: Notes, note_name_pattern: '{title}'}
frontmatter:
  reference: {type: link, format: note_link, validate_exists: true}
  homepage: {type: link, format: uri}
  authority_uri: {type: link, format: uri}
  raw_uri: {type: link, format: uri}
  relative_uri: {type: link, format: uri}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to:
    allowed_note_types:
      target: {min: 1, max: 1}
---
