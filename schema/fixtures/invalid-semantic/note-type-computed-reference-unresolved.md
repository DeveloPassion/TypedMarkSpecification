---
specification_version: 0.0.1
note_type: ticket
abstract: false
label: Ticket
icon: hash
kind: entity
description: Ticket with an unresolved computed-field reference.
storage:
  folder_pattern: "Tickets"
  note_name_pattern: "{title}"
  archive:
    policy: in_place_historical
template:
  file: "ticket.md"
frontmatter:
  title:
    type: text
    nullable: false
  display_title:
    type: text
    computed: '${uppercase(nickname)} - ${lowercase(title)}'
    nullable: false
---

INVALID SEMANTIC: `nickname` is not declared in the effective frontmatter, so the
computed expression has an unresolved field reference.
This body is non-normative documentation; tools ignore it for structural reasoning.
