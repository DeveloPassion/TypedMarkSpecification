---
title: Relationships, Headings, and Templates
parent: TypedMark
nav_order: 6
---

# Relationships, Headings, and Templates

This page is authoritative for relationship kinds, relationship constraints, heading rules, and template requirements. Internal note-link syntax and resolution are defined in [Managed Notes and Properties](managed-notes-and-properties.md), and note-type schema top-level contract is defined in [Note Type Schemas](note-type-schemas.md).

## Relationship Model

The schema system defines only two relationship kinds:

- `belongs_to`
- `related_to`

Definitions:

- `belongs_to`: primary type-level ownership, parent, container, or governing context
- `related_to`: secondary type-level semantic or operational association

The relationship model has two layers:

- type-level relationship declarations on note-type schemas
- concrete note-to-note relationship instances realized through internal note links in managed notes

Rules:

- Relationship declarations are part of note-type schemas.
- Relationship declarations relate one source note type to one or more target note types.
- Concrete note-to-note relationship instances are part of instantiated collection conformance.
- Concrete relationship instances are computed from resolved internal note links using the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- Metadata properties contribute typed relationship instances only when their field definitions declare `relationship_kind`.
- Body internal note links participate only in the `related_to` relationship model.
- Body note links are navigational and relational.
- `belongs_to` relationship instances MUST be represented in relationship-bearing metadata properties and MUST NOT be satisfied only by body links.
- Inverse views MAY be derived by tooling and MUST NOT require duplicate schema declarations.

## Relationship Constraints

Each concrete note type's effective schema MUST define `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`. Each mapping MAY be empty.

Rules:

- `relationships.belongs_to.allowed_note_types` defines the note types that MAY appear under `belongs_to`.
- `relationships.related_to.allowed_note_types` defines the note types that MAY appear under `related_to`.
- Constraints are declared per target note type.
- If a schema file physically declares `relationships`, it MUST define both `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`.
- Every referenced target note type MUST be a concrete note type defined in the same system.
- Within a single relationship kind, a target note type identifier MUST appear at most once.
- The target note type sets for `belongs_to` and `related_to` MUST be disjoint for a given source note type.
- Each target note type MAY declare `min` and `max`.
- `min` defaults to `0`.
- If `max` is omitted, the cardinality is unbounded.
- If present, `min` and `max` MUST be non-negative integers.
- If both are present, `max` MUST be greater than or equal to `min`.
- If a target note type is omitted, it is not allowed.
- Cardinality is defined per source note type and target note type pair.
- Schema-definition validation MUST validate declaration shape, referenced note types, cardinality values, and disjointness of relationship kinds.
- Concrete relationship instance validation MUST validate resolved targets against the source note type schema.
- For `belongs_to`, concrete relationship instances are the unique resolved targets referenced by frontmatter fields with `relationship_kind: belongs_to`.
- For `related_to`, concrete relationship instances are the union of:
  - unique resolved targets referenced by frontmatter fields with `relationship_kind: related_to`
  - unique resolved targets referenced by internal note links in the note body
- Only resolved managed-note targets create concrete relationship instances.
- Unresolved placeholders do not satisfy minimum-cardinality requirements until they resolve to concrete targets.
- Duplicate concrete links from the same source note to the same target note under the same relationship kind are semantically idempotent and count once.
- The same source note and target note pair MUST NOT be counted under both `belongs_to` and `related_to`.
- Link validity failures are reported as `invalid_note_link`; target-type and cardinality failures are reported as `invalid_relationship_instance`, as defined in [Collection Model](collection-model.md).
- A Markdown link in body content with a destination that is not a supported internal note-link form does not participate in typed relationship conformance.
- Temporary draft states during authoring or UI workflows are outside persisted conformance.
- Applications MAY allow transient draft states during authoring, but a persisted note or instantiated collection claimed as conforming MUST satisfy the cardinality rules derived from its note type.

Using the `topic` schema example in [Note Type Schemas](note-type-schemas.md), the relationship block yields these conformance rules:

- a `topic` MUST belong to exactly one `domain`
- a `topic` MUST include at least one concrete `related_to` link to a `source`, whether in relationship-bearing metadata, in the body, or both
- a `topic` MAY be related to any number of `concept` and `topic` notes

## Heading Rules

Each concrete note type's effective schema MUST define a `headings` block. That block MAY impose no mandatory H2 headings.

Rules:

- Heading validation applies to H2 headings only.
- `required_h2` entries MUST appear exactly once unless a future specification version says otherwise.
- `optional_h2` entries MAY appear zero or one time.
- If `allow_other_h2` is `false`, undeclared H2 headings MUST NOT appear.
- If `allow_other_h2` is `true`, undeclared H2 headings MAY appear.
- If `require_order` is `true`, declared H2 headings MUST appear in declared order.
- If `require_order` is `false`, declared H2 headings MAY appear in any order.
- H3 and deeper headings are unconstrained by this version of the specification.

## Templates

Each concrete note type's effective schema MUST define a template reference.

Rules:

- The effective `template.file` of a concrete note type MUST point to the canonical template for that note type.
- `template.file` MUST be a relative path under `<metadata_directory>/templates/`.
- `template.file` MUST end in `.md`.
- The template path referenced by a schema need not equal `<metadata_directory>/templates/<note_type>.md`.
- Templates MUST include valid starter frontmatter in canonical materialized form.
- A template's starter frontmatter MUST conform to the effective note-type schema of the note type that references the template, under the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- A template whose starter frontmatter declares a field absent from the effective schema, omits a declared field, or violates a field's type or value constraints is invalid, independently of the optional `template_drift` comparison.
- Template-frontmatter conformance is part of system-definition validity; an invalid template makes its referencing note type non-conforming.
- Templates MUST NOT introduce managed-note frontmatter fields solely to mirror schema-level `relationships` declarations.
- Templates SHOULD include the canonical required H2 headings.
- System-definition conformance requires every referenced template to exist and be valid; see [Conformance and Roadmap](conformance-and-roadmap.md).
- Validators MAY warn when a note drifts materially from the canonical template structure.
