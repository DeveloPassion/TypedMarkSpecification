---
specification_version: 0.0.1
view: ambiguous-source
description: A view cannot own and reference a row source simultaneously.
dataset: actions
query:
  specification_version: 0.0.1
  select:
    - {kind: path, as: path}
presentation:
  layout: table
  fields:
    - {column: path}
---
