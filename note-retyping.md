---
title: Note Re-typing
parent: TypedMark
nav_order: 9
audience: advanced
---

# Note Re-typing

Audience: tool authors converting existing notes between note types.

Authoritative for:

- converting one managed note from its concrete note type to another
- the preservation block that keeps information the target type cannot hold

See also:

- [Field Compatibility and Conversion](field-conversions.md): which values carry over
- [Note Type Schemas](note-type-schemas.md#storage-rules): target paths and writer obligations
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md#heading-rules): heading contracts
- [Migration Effects](migration-effects.md): changing a schema, as opposed to converting one note

This is an optional writer contract. Read-only validators never re-type notes,
and a collection needs no declaration for its notes to contain preservation
blocks: a block is ordinary fenced code, which validators already ignore.

## Re-typing a Note

Re-typing turns, say, an `idea` into a `project` without losing what the idea
recorded. Values the target can hold carry over; everything else moves into a
preservation block appended to the body, so a later conversion back can restore
it. "Lossless" is semantic: every stored value, with its parsed type, and all
body content remain recoverable, while formatting and key order may change.

Rules:

- `RT-1` A re-typing operation MUST name one managed note and one concrete target note type in the same collection.
- `RT-2` Unless the operation maps it explicitly, a stored source field maps to the target field of the same name; this mapping is the declaration `FDR-276` requires.
- `RT-3` A mapped stored value MUST carry over only when it is compatible with the target field under `FDR-257` and `FDR-258`, and it then keeps its parsed value.
- `RT-4` A stored source field that is unmapped, has no target field, or holds an incompatible value MUST move to the preservation block with its original value.
- `RT-5` The written note MUST store `note_type` as the target type and keep its effective `id`.
- `RT-6` The writer MUST add the target's effective mandatory tags that the note lacks.
- `RT-7` A body H2 section whose heading the target does not permit MUST move to the preservation block, together with its content up to the next H2.
- `RT-8` The writer MUST append any missing required target H2 as an empty section, in declared order.
- `RT-9` The written note's path MUST follow the target's effective storage rules, keeping a free name under `NTS-183`, and a path change MUST apply the link-preserving behavior of `MN-171`.
- `RT-10` Before writing, the writer MUST report what carries over, what is preserved, and every requirement it cannot satisfy, such as a required target value without a default.
- `RT-11` A writer MUST write nothing when the result would not conform to the target type, and MUST NOT invent values to make it conform.
- `RT-12` Re-typing MUST be atomic: either the note and every link update it needs are written, or nothing is.

## Preservation Block

The block is the last fenced code block in the body, with the info string
`typedmark-preserved`. Its content is YAML: a list of entries, oldest first, one
per re-typing that preserved something.

<!-- typedmark-example: body: Managed-note body ending with a preservation block. -->
`````markdown
## Notes

Ongoing work.

````typedmark-preserved
- from: task
  fields:
    priority: 2
    blocked_by:
      - "[[Design]]"
  sections:
    - heading: Checklist
      markdown: |
        - [x] draft
````
`````

Links and headings inside the block are inert, so preserved content never
creates relationships or breaks heading rules.

Rules:

- `RT-13` A preservation block is a fenced code block whose info string is exactly `typedmark-preserved`, and a note has at most one.
- `RT-14` Its content MUST be a YAML list of entries, each with the source type as `from` and at least one of `fields` and `sections`.
- `RT-15` `fields` maps each preserved field name to its original value, written as plain data as `SCE-159` defines it, with its parsed type unchanged.
- `RT-16` `sections` lists preserved H2 sections in body order, each with its `heading` text and its exact `markdown` content.
- `RT-17` The block's fence MUST be longer than any backtick run in its content.
- `RT-18` A later re-typing MUST append its entry to the existing block rather than add a second block.
- `RT-19` Re-typing back to an entry's `from` type MAY restore that entry's fields and sections, removing what it restores from the block and the block itself once empty.
- `RT-20` A writer MUST NOT restore an entry it cannot parse, and MUST report it instead.

For example, re-typing a `task` into a `note` and straight back restores the
task's stored values and sections, so the result is equivalent to the original.
