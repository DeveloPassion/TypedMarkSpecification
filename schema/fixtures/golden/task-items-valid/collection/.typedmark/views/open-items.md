---
specification_version: 0.1.0
view: open-items
description: Open checklist items of daily notes, read-only.
query:
  specification_version: 0.1.0
  note_types: [daily-note]
  rows: items
  where: {kind: item, property: checked, operator: equals, value: false}
  select:
    - {kind: path, as: note}
    - {kind: item, property: text, as: item}
presentation:
  layout: table
  fields:
    - {column: item}
    - {column: note}
---
