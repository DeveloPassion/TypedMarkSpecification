---
title: Getting Started
parent: TypedMark
nav_order: 3
audience: essentials
---

# Getting Started

Audience: first-time collection authors.

See also:

- [Foundations](foundations.md): core concepts and parsing baselines
- [Collection Model](collection-model.md): the authoritative `typedmark.md` contract
- [Note Type Schemas](note-type-schemas.md): the authoritative schema contract

This non-normative tutorial builds a Core collection from one configuration,
one concrete schema, and one note. A template is optional.

## 1. Create `typedmark.md`

At the root of your notes folder, create `typedmark.md`. The frontmatter is the configuration; the body is yours to use for explanations ([governed artifact format](foundations.md#governed-artifact-format)).

<!-- typedmark-example: artifact=typedmark -->
```markdown
---
specification_version: 0.1.0
name: my-notes
description: My personal notes.
---

# My Notes

Meeting notes live in Meetings/ and are typed as `meeting`.
```

Those keys suffice for the configuration. Defaults include `.typedmark`, Git
exclusion, UTC, validation severities, and stored `note_type` association.

## 2. Define a note type

Create `.typedmark/schemas/meeting.md`. The file name (without `.md`) must equal the `note_type` ([Note Type Schemas](note-type-schemas.md)).

<!-- typedmark-example: artifact=note-type -->
```markdown
---
specification_version: 0.1.0
note_type: meeting
label: Meeting
icon: calendar
description: Notes for one meeting.
storage:
  folder_pattern: "Meetings"
  note_name_pattern: "{meeting_date} - {title}"
frontmatter:
  title:
    type: text
    not_blank: true
    nullable: false
  meeting_date:
    type: date
    generated: now
    nullable: false
---

A meeting note records one meeting: who, what, decisions.
```

This declares where meeting notes live and how they are named ([storage rules](note-type-schemas.md#storage-rules)), and which frontmatter fields they carry ([Field Definition Reference](field-definition-reference.md)). `relationships`, `headings`, and `guidance` are optional and default to "no constraints".

`note_type` can be omitted from the schema because its basename supplies it.
Label and icon are optional. Without archive patterns, active storage applies.

## 3. Optionally add starter content

Without a template file, starter state is derived. To add prose, create
`.typedmark/templates/meeting.md`; its frontmatter can be partial or absent.

<!-- typedmark-example: body: Managed-note template, not a governed frontmatter artifact. -->
```markdown
---
note_type: meeting
title: ""
meeting_date: null
---

## Agenda

## Decisions
```

The empty `title` and `null` `meeting_date` are template placeholders. A tool instantiating the template replaces them with user-provided and generated values before writing a conforming managed note ([template placeholder rules](relationships-headings-and-templates.md#templates)).

## 4. Write a note

Create `Meetings/2026-06-10 - Kickoff.md`:

<!-- typedmark-example: body: Managed note validated against its effective note type, not an artifact schema. -->
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
- Look up everyday tasks: [Quick Reference](quick-reference.md#how-do-i)
- Reuse shared fields across note types: [property sets](property-sets.md#property-set-definitions)
- Share your setup as a versioned system: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- Shape-valid examples of every artifact live in [`schema/fixtures/valid/`](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema/fixtures/valid). Complete collection trees with expected portable validation reports live in [`schema/fixtures/golden/`](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema/fixtures/golden). Both are checked in CI on every change.
