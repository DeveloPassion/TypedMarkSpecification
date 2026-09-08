---
specification_version: 0.1.0
note_type: ticket
abstract: false
label: Ticket
icon: hash
description: Ticket with a conflicting computed field.
storage:
  folder_pattern: "Tickets"
  note_name_pattern: "{title}"
template:
  file: "ticket.md"
frontmatter:
  title:
    type: text
    nullable: false
  display_title:
    type: text
    computed: '${title}'
    default_value: "Fallback"
    nullable: false
---

INVALID SHAPE: a field declaring `computed` must not also declare `default_value`;
the computed expression is the field's materialization behavior.
This body is non-normative documentation; tools ignore it for structural reasoning.
