---
specification_version: 0.0.1
name: golden-folder-scoped-property-set
description: Valid collection with path-selected reusable structure.
folder_scopes:
  - path:
      under: Meetings/
    property_sets:
      - location-context
---

# Golden Folder Scope Collection

Records under `Meetings/` receive location metadata; records elsewhere do not.
