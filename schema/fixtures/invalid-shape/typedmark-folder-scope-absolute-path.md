---
specification_version: 0.0.1
name: invalid-folder-scope
description: Folder-scope paths are collection-relative.
folder_scopes:
  - path:
      under: /Meetings/
    property_sets:
      - meeting-base
---

Invalid because `under` starts with `/`.
