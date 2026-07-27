---
specification_version: 0.0.1
view: broken-project-list
description: Shape-valid view with an unresolved visible column.
query:
  specification_version: 0.0.1
  select:
    - kind: field
      field: title
      as: title
presentation:
  layout: list
  fields:
    - column: missing
---

INVALID SEMANTIC: `presentation.fields[0].column` does not resolve to a query projection alias.
