---
specification_version: 0.0.1
name: invalid-folder-scope
description: A folder scope must select exactly one path matcher.
folder_scopes:
  - path:
      under: Meetings/
      regex: "^Meetings/"
    property_sets:
      - meeting-base
---

Invalid because one scope declares both `under` and `regex`.
