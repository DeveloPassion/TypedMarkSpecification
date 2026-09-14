---
specification_version: 0.1.0
description: Notes with nested links.
storage: {folder_pattern: Notes, note_name_pattern: "{title}"}
frontmatter:
  details:
    type: object
    fields:
      reference: {type: link, format: note_link, validate_exists: true, targets: [project]}
      references:
        type: list
        items: {type: link, format: note_link, targets: [project]}
      defaulted: {type: link, format: note_link, validate_exists: true, default_value: "[[Missing]]"}
      asset: {type: link, format: note_link, nullable: true}
  sections:
    type: list
    items:
      type: object
      fields:
        reference: {type: link, format: note_link, validate_exists: true, default_value: "[[Missing]]"}
relationships:
  belongs_to: {allowed_note_types: {}}
  related_to:
    allowed_note_types:
      project: {max: 0}
---
