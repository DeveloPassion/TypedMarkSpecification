---
specification_version: 0.1.0
note_type: concept
description: Concept notes whose suffix is a decoration.
storage:
  folder_pattern: notes
  note_name_suffix:
    pattern: " (Permanent)"
    optional: true
  archive:
    folder_pattern: Archive/notes
    note_name_suffix: {pattern: " (Permanent)", optional: true}
headings:
  require_h1_title: true
---

Valid concrete note-type schema with an optional suffix: `notes/Growth mindset.md`
and `notes/Growth mindset (Permanent).md` both conform, and both default their
title to `Growth mindset`.
This body is non-normative documentation; tools ignore it for structural reasoning.
