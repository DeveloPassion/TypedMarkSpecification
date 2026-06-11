---
specification_version: 0.0.1
note_type: ticket
abstract: false
label: Ticket
icon: hash
kind: entity
description: Ticket with an unsupported computed-field transform.
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
    computed: '${upper(title)}'
    nullable: false
---

INVALID SEMANTIC: `upper` is not a supported computed transform in this
specification version.
This body is non-normative documentation; tools ignore it for structural reasoning.
