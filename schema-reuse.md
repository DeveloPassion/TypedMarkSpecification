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

- `NTS-11` If the selected concrete type declares `extends`, the tool MUST load its abstract ancestor chain from farthest ancestor to the selected type.
- `NTS-13` Inheritance of `storage`, `template`, `mandatory_tags`, `guidance`, `unknown_field`, `conditions`, and `count` uses whole-key replacement; the last declaration in ancestor-to-concrete order wins.
- `NTS-14` Property-set selection MUST use collection defaults, concrete exclusions, and concrete opt-in property sets under [Property Sets](property-sets.md).
- `NTS-98` A descendant's explicit storage block replaces its inherited storage block completely.
- `NTS-171` The last schema in ancestor-to-concrete order declaring `mandatory_tags` supplies the type-level policy, or an empty list applies when none declares it.
- `NTS-35` `extends` MAY be omitted.
- `NTS-36` If present, `extends` MUST be a non-empty slug and MUST resolve to exactly one abstract note type under `<metadata_directory>/schemas/`.
- `NTS-37` A note type MUST NOT extend itself directly or transitively.
- `NTS-38` Because `extends` is singular, a note type MUST inherit from at most one parent.
- `NTS-39` Abstract note types MAY contribute storage, templates, mandatory tags, fields, relationships, headings, guidance, unknown-field policy, conditions, and counts.
- `NTS-41` Concrete types MAY omit locally any reusable definitions they inherit under this contract.

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

template:
  file: "person.md"

frontmatter:
  title:
    type: text
    not_blank: true
    nullable: false
  email:
    type: text
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
- `NTS-85` `when` uses the frontmatter predicate grammar in [Collection Model](collection-model.md), with value comparisons against the effective record and existence tests against stored presence.
- `NTS-86` `then` MUST contain at least one of `require` or `require_null`; each, when present, MUST be a non-empty list of unique top-level effective frontmatter field names.
- `NTS-87` A field used by a condition MUST resolve to a declared effective field or Core field.
- `NTS-88` A conditionally required field SHOULD be nullable when no matching condition requires a concrete value.
- `NTS-89` A matching condition MUST enforce concrete non-null effective values for `require` and null effective values for `require_null`.
- `NTS-90` A `require` violation is reported as `missing_required_field`; a `require_null` violation is reported as `invalid_field_value`.
- `NTS-91` Condition rules are evaluated independently; every matching rule applies, and a note MUST satisfy all of them.
- `NTS-92` A field MUST NOT be named in `require` by one matching rule and in `require_null` by another matching rule for the same note; condition sets that allow this are invalid for that note and MUST be reported.
- `NTS-93` `conditions` participates in note-type inheritance through whole-key replacement, like `guidance`; property sets MUST NOT declare `conditions` in this specification version.

## Abstract Relationship Targets

Abstract relationship targets reuse the resolved ancestor chain.

Rules:

- `RHT-16` An abstract declared target means any concrete note type that extends it directly or transitively; a resolved target satisfies an abstract declared target when its concrete note type is such a descendant.
- `RHT-17` A target note type is declared when it appears directly in `allowed_note_types` or is a concrete descendant of a declared abstract target.
- `RHT-18` Cardinality for an abstract declared target counts the union of resolved targets across all of its concrete descendants.
- `RHT-19` When a resolved target's concrete note type matches more than one declared target within the same relationship kind, the instance counts toward the most specific declared target only: the concrete type itself when declared, and otherwise the nearest declared abstract ancestor.
