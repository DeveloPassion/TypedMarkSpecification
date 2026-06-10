---
specification_version: 0.0.1
note_type: customer
abstract: false
extends: person
label: Customer
icon: badge
description: Customer-specific person record.
storage:
  folder_pattern: "Customers"
  note_name_pattern: "{title}"
  archive:
    policy: in_place_historical
frontmatter:
  customer_tier:
    type: text
    nullable: false
---

VALID SHAPE, INVALID SEMANTICS: extends must resolve to exactly one abstract note type under <metadata_directory>/schemas/; no person.yaml exists in this fixture set.
This body is non-normative documentation; tools ignore it for structural reasoning.
