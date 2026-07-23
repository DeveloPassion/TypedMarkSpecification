---
specification_version: 0.0.1
name: invalid-folder-scope
description: A folder scope must apply at least one property set.
folder_scopes:
  - path:
      under: Meetings/
    property_sets: []
---

Invalid because `property_sets` is empty.
