---
specification_version: 0.1.0
view: project-board
description: Board layout without its required board configuration.
query:
  specification_version: 0.1.0
  select:
    - kind: field
      field: title
      as: title
presentation:
  layout: board
  fields:
    - column: title
---

INVALID SHAPE: a board layout requires a board configuration.
