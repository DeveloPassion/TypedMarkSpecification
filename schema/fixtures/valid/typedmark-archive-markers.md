---
specification_version: 0.1.0
name: archived-by-folder
description: Collection whose notes are archived by folder or by tag.
extensions:
  typedmark:archive-markers: 0.1.0
archive_markers:
  - path:
      under: "Archives/"
  - frontmatter:
      tags:
        contains_any: [archived]
---

Valid archive markers: a folder entry and a stored-frontmatter entry.
