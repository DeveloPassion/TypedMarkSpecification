---
specification_version: 0.1.0
description: A collectible item that can be lent or sold.
frontmatter:
  copies: {type: integer, nullable: true}
  lent_to: {type: text, nullable: true}
  lent_on: {type: date, nullable: true}
  acquired_on: {type: date, nullable: true, immutable: true}
  sale_stage: {type: text, nullable: true, allowed_values: [keep, listed, sold]}
  ownership:
    type: list
    items: {type: text, allowed_values: [owned, for_sale, sold]}
    default_value: [owned]
storage:
  folder_pattern: Items
---
