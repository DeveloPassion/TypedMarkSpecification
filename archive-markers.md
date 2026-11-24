---
title: Archive Markers
parent: TypedMark
nav_order: 21
audience: tool-authors
---

# Archive Markers

Audience: collection authors and tool authors whose collections mark archived notes by folder or by a stored value other than `archived`.

Authoritative for:

- the `typedmark:archive-markers` extension and the `archive_markers` collection key
- the effective `archived` value of a note that does not store `archived`
- the writer obligations that keep a marker-archived note archived when it moves

See also:

- [Managed Notes and Properties](managed-notes-and-properties.md#logical-deletion-and-archiving): the core `archived` field and its states
- [Note Type Schemas](note-type-schemas.md#storage-rules): the active and archive storage contracts
- [Collection Model](collection-model.md#note-type-mappings): the `when` blocks that markers reuse
- [Edits and Renames](edits-and-renames.md): moves and re-filing by writers
- [Extensions](extensions.md#standard-contracts): declaration and dependencies

Many vaults mark an archived note only by where it is: a tool moves a done
note into an archive folder and stores no flag. Without this contract, such a
note falls back to `archived: false`, fails its active storage pattern, and
shows up in every view of active notes. An archive marker says which notes are
archived without a stored `archived` value. It reuses the `when` blocks of
note-type mappings, so it reads only the note's path and stored frontmatter.

## Declaring Markers

The collection lists its markers in `typedmark.md`. This collection treats
every note under `Archives/`, and every note tagged `archived`, as archived:

<!-- typedmark-example: artifact=typedmark -->
```yaml
specification_version: 0.1.0
name: archived-by-folder
description: A collection whose tools archive notes by moving them.
extensions:
  typedmark:archive-markers: 0.1.0
archive_markers:
  - path:
      under: "Archives/"
  - frontmatter:
      tags:
        contains_any: [archived]
```

Rules:

- `ARC-1` `typedmark.md` MAY declare `archive_markers`.
- `ARC-2` A present `archive_markers` MUST be a non-empty list, and each entry MUST be a `when` block that satisfies `CM-94` to `CM-113`, `CM-101`, and `CM-102`.
- `ARC-3` A collection that declares `archive_markers` MUST declare `typedmark:archive-markers`.
- `ARC-4` An entry matches a note when every condition in its `when` block matches the note under `CM-96` to `CM-113`.
- `ARC-5` Marker evaluation MUST read only the normalized collection-relative note path and the stored frontmatter physically present in the note file.

## Effective Archived State

A marker supplies the value of `archived` only when the note does not store
one. A stored value always wins, so an author can keep one note in the archive
folder as active with `archived: false`. The derived value is the effective
value: it selects the storage contract, and query predicates, the views built
on them, and automation conditions read it like a stored one. A `field`
projection still shows only stored values (`CM-365`), so it gives null for an
unstored `archived`.

For example, with the markers above and a project type whose archive block
files notes by the year of `date_archived`, this note is archived because of
its folder. Its path is still checked: `Archives/Projects/2025/` would fail,
because the note stores a 2026 date.

<!-- typedmark-example: fragment: Frontmatter of Archives/Projects/2026/Launch.md, archived by its folder. -->
```yaml
note_type: project
status: done
date_archived: 2026-11-04
```

Rules:

- `ARC-6` If a managed note does not store `archived`, its effective `archived` MUST be `true` when at least one entry of `archive_markers` matches the note, and `false` otherwise.
- `ARC-7` A stored `archived` value MUST take precedence over every marker.
- `ARC-8` Storage selection under `NTS-138`, query field predicates, and automation conditions MUST read the effective `archived` value that `ARC-6` and `ARC-7` give.
- `ARC-9` Markers MUST be evaluated on the note's current path and stored frontmatter, before the note's storage contract is selected.

## Writers

This contract adds no write operation. Writers archive and unarchive notes as
before, by storing `archived` or by an `archive_note` action. They do not copy
a derived value into the note. A move can change which markers match, so a
writer keeps an archived note archived when it moves the note out of every
marker.

For example, when a caller moves `Archives/Projects/2026/Launch.md` to
`Projects/Launch.md` and does not ask to unarchive it, the writer stores
`archived: true` in the note. The path check then reports that the note is
outside its archive folder, instead of silently treating it as active.

Rules:

- `ARC-10` A writer MUST NOT store `archived` only because a marker matches the note.
- `ARC-11` A writer computing a note's target path MUST select the storage contract from the note's effective `archived` value before the move.
- `ARC-12` A writer moving a note whose effective `archived` is `true` only through a marker MUST store `archived: true` when no marker matches the note at its target path, unless its caller explicitly asks to unarchive the note.
