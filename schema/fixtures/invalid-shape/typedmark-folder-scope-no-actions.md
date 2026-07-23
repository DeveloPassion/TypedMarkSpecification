---
specification_version: 0.0.1
name: invalid-empty-folder-scope
description: Invalid folder scope without an action.
folder_scopes:
  - path:
      under: Projects/
---

Invalid because a folder scope must declare `property_sets`, `mandatory_tags`,
or both.
