---
specification_version: 0.1.0
note_type: invalid-object-child-name
label: Invalid Object Child Name
icon: check
description: An object child with a hyphen in its name.
frontmatter:
  review:
    type: object
    nullable: true
    fields:
      reviewed-at:
        type: date
---

Invalid because a field name in an `object.fields` mapping must match
`^[a-z][a-zA-Z0-9_]*$` (`MN-322`).
