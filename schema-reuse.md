---
title: Schema Reuse
parent: TypedMark
nav_order: 31
audience: advanced
---

# Schema Reuse

Audience: collection authors reusing schema structure or conditional constraints.

Authoritative for:

- the abstract schema inheritance contract
- conditional field constraints

See also:

- [Note Type Schemas](note-type-schemas.md): local schema shape and effective-schema construction
- [Property Sets](property-sets.md): reusable field, relationship, and heading bundles
- [Field Definition Reference](field-definition-reference.md): field constraints and equality

Reuse adds shared structure and conditional constraints without requiring those
mechanisms in a collection that defines only local concrete schemas.

## Abstract Schema Inheritance

An abstract schema contributes structure to concrete descendants rather than
being the type of a managed note itself.

Rules:

- `NTS-35` `extends` MAY be omitted.
- `NTS-36` If present, `extends` MUST be a non-empty slug and MUST resolve to exactly one abstract note type under `<metadata_directory>/schemas/`.
- `NTS-37` A note type MUST NOT extend itself directly or transitively.
- `NTS-38` Because `extends` is singular, a note type MUST inherit from at most one parent.
- `NTS-39` Abstract note types MAY declare `kind`, `storage`, `template`, `mandatory_tags`, `frontmatter`, `relationships`, `headings`, `guidance`, `unknown_field`, `conditions`, and `count` to contribute reusable structure, but they are not required to declare them.
- `NTS-40` If an abstract note type declares the core-defined `note_type` field in `frontmatter`, it MUST use `value_from_schema: note_type`.
- `NTS-41` Concrete note types MAY inherit `kind`, `storage`, `template`, `mandatory_tags`, `guidance`, `unknown_field`, `conditions`, `count`, `frontmatter`, `relationships`, and `headings` from abstract ancestors and therefore MAY omit those keys locally.

## Abstract Inheritance Example

<!-- typedmark-example: artifact=note-type -->
```yaml
# <metadata_directory>/schemas/person.md
specification_version: 0.1.0
note_type: person
abstract: true
label: Person
icon: user
description: Shared structure for person-like notes.

kind: entity

template:
  file: "person.md"

frontmatter:
  note_type:
    type: text
    value_from_schema: note_type
  title:
    type: text
    not_blank: true
    nullable: false
  email:
    type: text
    optional: true
    nullable: true
    default_value: null

headings:
  required_h2: []
  optional_h2:
    - Notes
  allow_other_h2: true
  require_order: false

guidance:
  when_to_use: "Use as a reusable base for person-like note types."
  when_not_to_use: "Do not map notes directly to this abstract type."
```

<!-- typedmark-example: artifact=note-type -->
```yaml
# <metadata_directory>/schemas/customer.md
specification_version: 0.1.0
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
```

In that example, `customer` inherits `kind`, `template`, `guidance`, `note_type`, `title`, `email`, and `headings` from `person`, while adding its own concrete storage rule and local `customer_tier` field. Because no schema in the chain declares `relationships`, the effective relationships take the empty defaults.

## Conditional Field Constraints

A note-type schema can declare `conditions` to express cross-field requirements that unconditional field definitions cannot: a field that needs a value only when another field has a given value, or a field that stays empty in certain states.

Example:

<!-- typedmark-example: fragment: Note-type conditional validation declarations. -->
```yaml
conditions:
  - description: Archived topics need a reason.
    when:
      status:
        equals: archived
    then:
      require:
        - archived_reason
  - description: Draft topics have no publication date.
    when:
      status:
        equals: draft
    then:
      require_null:
        - published_on
```

Rules:

- `NTS-82` `conditions` MAY be omitted.
- `NTS-83` If present, `conditions` MUST be a non-empty ordered list of condition rules.
- `NTS-84` Each condition rule MUST physically contain `when` and `then`, and MAY contain `description`, a non-empty string used for reporting.
- `NTS-85` `when` is a frontmatter predicate mapping with the same shape and semantics as `when.frontmatter` in `note_type_mappings`, defined in [Collection Model](collection-model.md), evaluated against the managed note's stored frontmatter.
- `NTS-86` `then` MUST contain at least one of `require` or `require_null`; each, when present, MUST be a non-empty list of unique top-level effective frontmatter field names.
- `NTS-87` Each field named in `require` or `require_null`, and each field named in `when`, MUST resolve to a field declared in the effective frontmatter; a condition naming an unresolved field makes the schema invalid.
- `NTS-88` A field named in `require` MUST NOT be declared `optional: true` in the effective schema and SHOULD be nullable, so it can remain `null` while no condition requires it.
- `NTS-89` When a condition's `when` predicate matches a managed note, every field named in `require` MUST hold a concrete non-null stored value, and every field named in `require_null` MUST be stored as `null`.
- `NTS-90` A `require` violation is reported as `missing_required_field`; a `require_null` violation is reported as `invalid_field_value`.
- `NTS-91` Condition rules are evaluated independently; every matching rule applies, and a note MUST satisfy all of them.
- `NTS-92` A field MUST NOT be named in `require` by one matching rule and in `require_null` by another matching rule for the same note; condition sets that allow this are invalid for that note and MUST be reported.
- `NTS-93` `conditions` participates in note-type inheritance through whole-key replacement, like `guidance`; property sets MUST NOT declare `conditions` in this specification version.
