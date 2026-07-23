---
specification_version: 0.0.1
name: example-system
description: Example system with an invalid scaffold note path.
version: 1.0.0
scaffold:
  notes:
    - path: Home
      note_type: home
      from_template: home.md
---

Invalid: `scaffold.notes[].path` must end in `.md`.
