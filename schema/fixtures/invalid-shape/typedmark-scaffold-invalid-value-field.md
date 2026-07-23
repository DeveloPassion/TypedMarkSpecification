---
specification_version: 0.0.1
name: example-system
description: Example system with an invalid scaffold value field name.
version: 1.0.0
scaffold:
  notes:
    - path: Home.md
      note_type: home
      from_template: home.md
      values:
        Title: Home
---

Invalid: keys in `scaffold.notes[].values` must use the managed-note field-name grammar.
