---
specification_version: 0.1.0
note_type: project
description: Projects that may live in a folder of their own.
storage:
  folder_pattern: Projects
  note_name_suffix:
    pattern: " (Project)"
  note_folder: optional
  archive:
    folder_pattern: Archive/Projects
    note_name_suffix: {pattern: " (Project)"}
    note_folder: required
headings:
  require_h1_title: true
---

Valid concrete note-type schema with a note folder: `Projects/Launch/Launch (Project).md`
and `Projects/Launch (Project).md` both conform; an archived project must sit in
its own folder, such as `Archive/Projects/Launch/Launch (Project).md`.
This body is non-normative documentation; tools ignore it for structural reasoning.
