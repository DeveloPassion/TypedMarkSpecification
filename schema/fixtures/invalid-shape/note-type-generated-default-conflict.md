---
specification_version: 0.0.1
note_type: ticket
abstract: false
label: Ticket
icon: hash
kind: entity
description: Ticket with a conflicting generated field.
storage:
  folder_pattern: "Tickets"
  note_name_pattern: "{title}"
  archive:
    policy: in_place_historical
template:
  file: "ticket.md"
frontmatter:
  ticket_id:
    type: text
    generated: uuid
    default_value: "manual"
    nullable: false
---

INVALID SHAPE: a field declaring a generation strategy must not declare default_value;
the strategy is the field's defaulting behavior.
This body is non-normative documentation; tools ignore it for structural reasoning.
