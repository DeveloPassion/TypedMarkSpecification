---
specification_version: 0.0.1
name: unresolved-folder-scope
description: Folder scope with an unresolved property-set reference.
folder_scopes:
  - path:
      under: Meetings/
    property_sets:
      - missing-property-set
---

Shape-valid but semantically invalid because `missing-property-set` does not
resolve under the collection's metadata directory.
