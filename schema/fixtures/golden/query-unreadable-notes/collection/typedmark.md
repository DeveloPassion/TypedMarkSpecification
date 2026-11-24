---
specification_version: 0.1.0
name: query-unreadable-notes
description: Tasks typed by tag, plus notes whose frontmatter cannot be parsed.
note_type_mappings:
  - {kind: tag, tag: type/task, note_type: task}
  - {kind: folder, folder: Inbox/, note_type: capture}
---
