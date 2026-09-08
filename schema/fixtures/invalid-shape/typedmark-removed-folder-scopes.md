---
specification_version: 0.1.0
name: folder-scoped-notes
description: Collection with path-selected property sets.
folder_scopes:
  - path:
      under: Meetings/
    property_sets:
      - meeting-base
  - path:
      regex: "^Archive/[0-9]{4}/.*\\.md$"
    property_sets:
      - archive-metadata
---

Invalid in 0.1.0: folder_scopes is a removed structural key.
