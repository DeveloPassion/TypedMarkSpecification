---
specification_version: 0.0.1
automation: missing-actions
description: Invalid automation without any actions.
trigger:
  kind: event
  event: note.updated
---

Invalid because every automation must declare a non-empty `actions` list.
