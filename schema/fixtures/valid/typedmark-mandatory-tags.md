---
specification_version: 0.0.1
name: mandatory-tag-fixture
description: Collection with collection-wide and folder-scoped mandatory tags.
mandatory_tags:
  - managed
  - knowledge/base
folder_scopes:
  - path:
      under: Projects/
    mandatory_tags:
      - project
      - managed
---

Valid because mandatory tag policies use valid tag strings and a folder scope
may contribute mandatory tags without contributing a property set.
