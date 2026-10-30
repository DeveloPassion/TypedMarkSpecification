---
specification_version: 0.1.0
view: energy-board
description: Moves would write the note's field from an item row.
query:
  specification_version: 0.1.0
  note_types: [daily-note]
  rows: items
  select:
    - {kind: item, property: text, as: item}
    - {kind: field, field: energy, as: energy}
presentation:
  layout: board
  fields:
    - {column: item}
  board:
    column: energy
    columns:
      - {value: 2}
      - {value: 4}
    writable: true
---
