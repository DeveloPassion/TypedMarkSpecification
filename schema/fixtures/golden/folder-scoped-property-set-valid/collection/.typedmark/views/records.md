---
specification_version: 0.1.0
view: records
description: Records ordered by category and title.
query:
  specification_version: 0.1.0
  note_types: [record]
  select:
    - kind: field
      field: title
      as: title
    - kind: field
      field: category
      as: category
  order_by:
    - column: category
      direction: asc
    - column: title
      direction: asc
presentation:
  layout: table
  fields:
    - column: title
      label: Record
    - column: category
      label: Category
---

Grouped record index.
