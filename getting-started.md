---
title: Getting Started
parent: TypedMark
nav_order: 3
audience: essentials
---

# Getting Started

This page is a non-normative tutorial. It shows how little is needed to turn a folder of Markdown notes into a typed collection: one configuration file, one note type, one template, one note. Every step links to the section that governs it.

## 1. Create `typedmark.md`

At the root of your notes folder, create `typedmark.md`. The frontmatter is the configuration; the body is yours to use for explanations ([governed artifact format](foundations.md#governed-artifact-format)).

```markdown
---
specification_version: 0.0.1
name: my-notes
description: My personal notes.
metadata_directory: .typedmark
exclude_paths:
  - .git/**
validation_defaults: {}
---

# My Notes

Meeting notes live in Meetings/ and are typed as `meeting`.
```

Those six frontmatter keys are the only required ones ([Collection Model](collection-model.md)). An empty `validation_defaults` mapping uses the core default severities.

## 2. Define a note type

Create `.typedmark/schemas/meeting.md`. The file name (without `.md`) must equal the `note_type` ([Note Type Schemas](note-type-schemas.md)).

```markdown
---
specification_version: 0.0.1
note_type: meeting
abstract: false
label: Meeting
icon: calendar
kind: dated_record
description: Notes for one meeting.
storage:
  folder_pattern: "Meetings"
  note_name_pattern: "{meeting_date} - {title}"
  archive:
    policy: in_place_historical
template:
  file: "meeting.md"
frontmatter:
  note_type:
    type: text
    const_value: meeting
  title:
    type: text
    not_blank: true
    nullable: false
  meeting_date:
    type: date
    generated: now
    immutable: true
    nullable: false
---

A meeting note records one meeting: who, what, decisions.
```

This declares where meeting notes live and how they are named ([storage rules](note-type-schemas.md#storage-rules)), and which frontmatter fields they carry ([Field Definition Reference](field-definition-reference.md)). `relationships`, `headings`, and `guidance` are optional and default to "no constraints".

## 3. Create the template

Create `.typedmark/templates/meeting.md` with valid starter frontmatter ([Templates](relationships-headings-and-templates.md#templates)):

```markdown
---
note_type: meeting
title: ""
meeting_date: null
---

## Agenda

## Decisions
```

## 4. Write a note

Create `Meetings/2026-06-10 - Kickoff.md`:

```markdown
---
note_type: meeting
title: Kickoff
meeting_date: 2026-06-10
---

## Agenda

Project kickoff.

## Decisions

We ship.
```

That note is a conforming managed note: its `note_type` maps it to the `meeting` schema ([note-type mapping](collection-model.md#note-type-mappings)), its path matches the storage pattern, and every declared field is present with a valid value ([managed note contract](managed-notes-and-properties.md)).

## Where to go next

- Link notes together and document relationships between types: [Note Links](note-links.md) and [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- Reuse shared fields across note types: [property sets](collection-model.md#property-set-definitions)
- Share your setup as a versioned system: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- A complete, machine-validated example of every artifact lives in [`schema/fixtures/valid/`](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema/fixtures/valid) — those files are checked against the JSON Schemas in CI on every change.
