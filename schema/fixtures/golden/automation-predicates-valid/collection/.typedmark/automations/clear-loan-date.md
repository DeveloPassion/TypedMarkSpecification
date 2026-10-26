---
specification_version: 0.1.0
automation: clear-loan-date
description: Remove the loan date once the item is no longer lent.
trigger:
  kind: event
  event: note.updated
  scope_transition: enters
scope:
  note_types:
    - item
when:
  lent_to:
    empty: true
actions:
  - kind: unset_field
    field: lent_on
---

An emptiness predicate and a field removal that restores the absence fallback.
