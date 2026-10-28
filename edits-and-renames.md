---
title: Edits and Renames
parent: TypedMark
nav_order: 9
audience: advanced
---

# Edits and Renames

Audience: tool authors writing to existing managed notes.

Authoritative for:

- the fidelity of edits to an existing note's frontmatter
- rewriting internal note links when a note is renamed or moved
- re-filing notes whose storage patterns read an edited value

See also:

- [Managed Notes and Properties](managed-notes-and-properties.md#canonical-field-materialization): the baseline every writer follows (`MN-101`, `MN-307`, `MN-308`)
- [Note Links](note-links.md): link forms and target resolution
- [Note Type Schemas](note-type-schemas.md#storage-rules): storage patterns, free names, and notes stored beside a linked note
- [Note Re-typing](note-retyping.md): converting a note to another type
- [Migration Effects](migration-effects.md): moves caused by schema changes

This is an optional writer contract. A tool that claims it gives these
guarantees for every edit, rename, and move it performs on its own. Read-only
validators are unaffected, and a collection declares nothing to benefit.

## Edit Fidelity

Notes stay readable by every tool only if writing through one of them does not
reformat what another wrote. An edit changes the keys it assigns or removes and
nothing else: other keys keep their order, quoting, and comments, and the body
is untouched. A key the edit adds goes where the note type declares it, so
notes written by hand and by tools look alike.

Setting `status` to `done` and adding `date_completed`, which the type
declares right after `status`, leaves the comment, the quoting, and the order
of every other key as they were:

<!-- typedmark-example: body: Frontmatter before and after an edit that assigns one key and adds another. -->
```markdown
---
note_type: task
# Agreed with the client
due: '2026-11-02'
status: active
priority: high
---
```

<!-- typedmark-example: body: The same frontmatter after the edit. -->
```markdown
---
note_type: task
# Agreed with the client
due: '2026-11-02'
status: done
date_completed: 2026-10-28
priority: high
---
```

Rules:

- `ER-1` An edit MUST leave the text of every frontmatter entry it does not assign or remove unchanged, including its position, scalar style, quoting, and the comment lines directly above it.
- `ER-2` An edit assigning an existing key MUST keep that key's position and the comment lines directly above it.
- `ER-3` A key the edit adds MUST follow the nearest present key that precedes it in the effective frontmatter's declared order, or end the frontmatter when no such key is present.
- `ER-4` Removing a key MUST remove its entry and the comment lines directly above it, and nothing else.
- `ER-5` An edit MUST keep the frontmatter delimiters, the line-ending convention, any byte-order mark, and the body unchanged.
- `ER-6` An edit MUST NOT normalize, reorder, or materialize keys it does not assign, unless normalization was explicitly requested.

## Renames and Moves

Renaming or moving a note must not break the links that reach it. Every link
that resolved to the note is rewritten to resolve to its new path, changing
only the target: the link keeps its form, label, anchor, and embed marker. A
name link stays a name when the new name is unambiguous, and becomes a path
otherwise. Links to other notes keep resolving to the notes they reached
before, including relative links inside the moved note itself.

Renaming `Projects/Launch.md` to `Projects/Go-live.md` rewrites
`[[Launch#Scope|the scope]]` to `[[Go-live#Scope|the scope]]` and
`[plan](../Projects/Launch.md)` to `[plan](../Projects/Go-live.md)`, in
frontmatter link fields and bodies alike.

Rules:

- `ER-7` Renaming or moving a note MUST rewrite every internal note link, in frontmatter or in a body, that resolved to the note before the change, so that it resolves to the note at its new path.
- `ER-8` A rewritten link MUST keep its form, display text, anchor, and embed marker, and a path target MUST keep its relative or root-relative style and the presence or absence of its `.md` extension.
- `ER-9` A rewritten name target MUST stay a name when the new name resolves to the note from the containing note, and MUST otherwise become a root-relative path.
- `ER-10` Every other link that resolved before the change MUST still resolve to the same note afterwards, rewritten as `ER-8` and `ER-9` describe when the change would otherwise break or redirect it.
- `ER-11` Links that did not resolve before the change, including ambiguous ones, MUST NOT be rewritten.

## Re-filing

Storage patterns can read a note's own values, such as a date, and the folder
or name of a linked note. When an edit changes such a value, the note moves to
the path its storage rules now give, and notes stored beside it follow. The
whole change is one operation: the edit, every move, and every link rewrite are
written together, or nothing is.

Rules:

- `ER-12` When an edit changes a value its note's effective storage rules read, the writer MUST move the note to the path those rules now resolve, keeping a free name under `NTS-183`.
- `ER-13` Moving a note MUST also move every note whose storage resolves through it by `{field:folder}` or `{field:name}` (`NTS-184`, `NTS-186`), repeating until no further note moves.
- `ER-14` An edit, rename, or move and every move and link rewrite it requires MUST be written atomically; when a target path is taken or any of them cannot be applied safely, the writer MUST write nothing and report why.
- `ER-15` A writer SHOULD offer a preview listing the notes it will move and the links it will rewrite before writing.
