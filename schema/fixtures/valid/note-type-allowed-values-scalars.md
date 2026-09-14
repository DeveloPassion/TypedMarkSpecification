---
specification_version: 0.1.0
description: Scalar allowed values use their declared field types.
abstract: true
frontmatter:
  status:
    type: text
    nullable: true
    allowed_values: [null, draft, ready]
  count:
    type: integer
    allowed_values: [-1, 0, 2]
  score:
    type: number
    allowed_values: [0, 1.5]
  enabled:
    type: checkbox
    allowed_values: [false, true]
  choices:
    type: list
    items: {type: text}
    allowed_values: [draft, ready]
---

Valid scalar declarations. Nullability and field-type compatibility remain
semantic constraints beyond the scalar item shape.
