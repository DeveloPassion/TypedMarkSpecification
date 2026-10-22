---
specification_version: 0.1.0
note_type: concept
description: Subject-first note whose filename is author-chosen.
storage:
  folder_pattern: notes
  note_name_regex: "^[a-z0-9]+(?:[.-][a-z0-9]+)*$"
  archive:
    folder_pattern: Archive/notes
frontmatter:
  title: {type: text, nullable: false}
---

Valid concrete note-type schema with a free name: `notes/net.proto.bgp.md` conforms
whatever its stored `title`, and archiving keeps the name in the archive folder.
This body is non-normative documentation; tools ignore it for structural reasoning.
