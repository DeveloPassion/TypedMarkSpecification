---
title: Relationships, Headings, and Templates
parent: TypedMark
nav_order: 9
audience: essentials
---

# Relationships, Headings, and Templates

Audience: collection authors.

Authoritative for:

- relationship kinds, the relationship block shape, and relationship constraints
- heading rules, including the H1 and H2 contracts
- template content obligations

See also:

- [Note Links](note-links.md): how internal note links are parsed and resolved
- [Note Type Schemas](note-type-schemas.md): the schema file contract and `template.file` path rules

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

TypedMark does not constrain which collection notes may link to which. Internal note links between collection notes are always permitted, whether or not the linked note types are declared in any relationship block. Relationship declarations document the expected type-level relationship graph and define how typed relationships between note types are expressed; the constraints they carry apply only to the typed relationship instances derived for declared target note types, never to internal note links as such.

Rules:

- `RHT-1` Relationship declarations are part of note-type schemas.
- `RHT-2` Relationship declarations relate one source note type to one or more target note types.
- `RHT-3` An internal note link between collection notes is never, by itself, a relationship violation.
- `RHT-4` Concrete note-to-note relationship instances are part of instantiated collection conformance.
- `RHT-5` Concrete relationship instances are computed from resolved internal note links using the rules in [Note Links](note-links.md).
- `RHT-6` Metadata properties contribute typed relationship instances only when their field definitions declare `relationship_kind`.
- `RHT-7` Body internal note links participate only in the `related_to` relationship model, and contribute typed relationship instances only for target note types declared under `related_to`; every other body link is purely navigational.
- `RHT-8` Body note links are navigational and relational.
- `RHT-9` `belongs_to` relationship instances MUST be represented in relationship-bearing metadata properties and MUST NOT be satisfied only by body links.
- `RHT-10` Inverse views MAY be derived by tooling and MUST NOT require duplicate schema declarations.

## Relationship Constraints

A concrete note type's effective schema MAY define `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`. Each mapping MAY be empty. An effective schema without a `relationships` block is equivalent to one declaring both mappings empty, as defined in [Note Type Schemas](note-type-schemas.md): no documented relationships and no relationship constraints.

Rules:

- `RHT-11` `relationships.belongs_to.allowed_note_types` declares the documented `belongs_to` target note types for the source note type.
- `RHT-12` `relationships.related_to.allowed_note_types` declares the documented `related_to` target note types for the source note type.
- `RHT-13` Constraints are declared per target note type.
- `RHT-14` If a schema file physically declares `relationships`, it MUST define both `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`.
- `RHT-15` Every referenced target note type MUST be a note type defined in the same collection; it MAY be abstract.
- `RHT-16` An abstract declared target means any concrete note type that extends it directly or transitively; a resolved target satisfies an abstract declared target when its concrete note type is such a descendant.
- `RHT-17` A target note type is declared when it appears directly in `allowed_note_types` or is a concrete descendant of a declared abstract target.
- `RHT-18` Cardinality for an abstract declared target counts the union of resolved targets across all of its concrete descendants.
- `RHT-19` When a resolved target's concrete note type matches more than one declared target within the same relationship kind, the instance counts toward the most specific declared target only: the concrete type itself when declared, and otherwise the nearest declared abstract ancestor.
- `RHT-20` Within a single relationship kind, a target note type identifier MUST appear at most once.
- `RHT-21` The target note type sets for `belongs_to` and `related_to` MUST be disjoint for a given source note type, after expanding abstract targets to their concrete descendants.
- `RHT-22` Each target note type MAY declare `min` and `max`.
- `RHT-23` `min` defaults to `0`.
- `RHT-24` If `max` is omitted, the cardinality is unbounded.
- `RHT-25` If present, `min` and `max` MUST be non-negative integers.
- `RHT-26` If both are present, `max` MUST be greater than or equal to `min`.
- `RHT-27` If a target note type is not declared, no typed-relationship constraint applies to links targeting notes of that type; such links remain valid internal note links and do not create typed relationship instances.
- `RHT-28` A relationship-bearing field whose resolved target's note type is not declared under its relationship kind creates no typed relationship instance; the link itself remains valid.
- `RHT-29` Cardinality is defined per source note type and target note type pair.
- `RHT-30` Schema-definition validation MUST validate declaration shape, referenced note types, cardinality values, and disjointness of relationship kinds.
- `RHT-31` Concrete relationship instance validation MUST evaluate the resolved typed relationship instances against the declared targets and cardinality of the source note type's effective schema.
- `RHT-32` For `belongs_to`, concrete relationship instances are the unique resolved targets referenced by frontmatter fields with `relationship_kind: belongs_to`.
- `RHT-33` For `related_to`, concrete relationship instances are the union of:
  - unique resolved targets referenced by frontmatter fields with `relationship_kind: related_to`
  - unique resolved targets referenced by internal note links in the note body
- `RHT-34` Only resolved managed-note targets create concrete relationship instances.
- `RHT-35` Unresolved placeholders do not satisfy minimum-cardinality requirements until they resolve to concrete targets.
- `RHT-36` Duplicate concrete links from the same source note to the same target note under the same relationship kind are semantically idempotent and count once.
- `RHT-37` A resolved managed-note target that is logically deleted still creates a concrete relationship instance and still counts toward cardinality in this specification version; tools MAY additionally surface links to logically deleted notes as informational diagnostics.
- `RHT-38` The same source note and target note pair MUST NOT be counted under both `belongs_to` and `related_to`.
- `RHT-39` Link validity failures are reported as `invalid_note_link`; cardinality failures on declared targets are reported as `invalid_relationship_instance`, as defined in [Collection Model](collection-model.md).
- `RHT-40` A Markdown link in body content with a destination that is not a supported internal note-link form does not participate in typed relationship conformance.
- `RHT-41` Temporary draft states during authoring or UI workflows are outside persisted conformance.
- `RHT-42` Applications MAY allow transient draft states during authoring, but a persisted note or instantiated collection claimed as conforming MUST satisfy the cardinality rules derived from its note type.

Using the `topic` schema example in [Note Type Schemas](note-type-schemas.md), the relationship block yields these conformance rules:

- `RHT-43` a `topic` MUST belong to exactly one `domain`
- `RHT-44` a `topic` MUST include at least one concrete `related_to` link to a `source`, whether in relationship-bearing metadata, in the body, or both
- `RHT-45` a `topic` MAY be related to any number of `concept` and `topic` notes
- `RHT-46` links from a `topic` to notes of any other note type, or to untyped notes, are ordinary internal note links and are not relationship violations

## Heading Rules

A concrete note type's effective schema MAY define a `headings` block. That block MAY impose no mandatory H2 headings. An effective schema without a `headings` block is equivalent to one declaring `required_h2: []`, `optional_h2: []`, `allow_other_h2: true`, `require_order: false`, and `require_h1_title: false`, as defined in [Note Type Schemas](note-type-schemas.md): no heading constraints.

Rules:

- `RHT-47` Heading detection follows CommonMark; text inside fenced, indented, or inline code is not a heading.
- `RHT-48` H1 headings are ungoverned by default: a managed note MAY contain zero or more H1 headings, and no relationship between an H1 and the `title` field is assumed.
- `RHT-49` A `headings` block MAY declare `require_h1_title` to couple the body H1 to the note's `title` field.
- `RHT-50` `require_h1_title` MUST be a boolean; if omitted, it defaults to `false`.
- `RHT-51` If `require_h1_title` is `true`, the note body MUST contain exactly one H1 heading, that H1 MUST be the first heading in the body, and its text MUST equal the note's stored `title` value under the string comparison rules defined in [Foundations](foundations.md).
- `RHT-52` `require_h1_title: true` is valid only when the effective frontmatter declares a `title` field; a note whose `title` is `null` cannot satisfy it.
- `RHT-53` A `require_h1_title` violation is an `invalid_heading` failure.
- `RHT-54` H1 text is extracted like H2 text: the raw Markdown source after the `# ` marker, with leading and trailing whitespace trimmed.
- `RHT-55` Other heading validation applies to H2 headings only.
- `RHT-56` An H2 heading's text is its raw Markdown source after the `## ` marker, with leading and trailing whitespace trimmed; inline Markdown syntax within the heading is not interpreted or stripped.
- `RHT-57` A managed-note H2 heading matches a declared heading entry when their texts are equal under the string comparison rules defined in [Foundations](foundations.md).
- `RHT-58` `required_h2` entries MUST appear exactly once unless a future specification version says otherwise.
- `RHT-59` `optional_h2` entries MAY appear zero or one time.
- `RHT-60` If `allow_other_h2` is `false`, undeclared H2 headings MUST NOT appear.
- `RHT-61` If `allow_other_h2` is `true`, undeclared H2 headings MAY appear.
- `RHT-62` If `require_order` is `true`, declared H2 headings MUST appear in declared order.
- `RHT-63` If `require_order` is `false`, declared H2 headings MAY appear in any order.
- `RHT-64` H3 and deeper headings are unconstrained by this version of the specification.

## Templates

Each concrete note type's effective schema MUST define a template reference.

Rules:

- `RHT-65` The effective `template.file` of a concrete note type MUST point to the canonical template for that note type.
- `RHT-66` The `template.file` path rules — resolution against `<metadata_directory>/templates/`, the `.md` extension, and naming freedom — are defined in [Note Type Schemas](note-type-schemas.md).
- `RHT-67` Templates MUST include valid starter frontmatter in canonical materialized form.
- `RHT-68` A template's starter frontmatter MUST conform to the effective note-type schema of the note type that references the template, under the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- `RHT-69` A template whose starter frontmatter declares a field absent from the effective schema, omits a declared field, or violates a field's type or value constraints is invalid, independently of the optional `template_drift` comparison.
- `RHT-70` Template-frontmatter conformance is part of system-definition validity; an invalid template makes its referencing note type non-conforming.
- `RHT-71` Templates MUST NOT introduce managed-note frontmatter fields solely to mirror schema-level `relationships` declarations.
- `RHT-72` Templates SHOULD include the canonical required H2 headings.
- `RHT-73` System-definition conformance requires every referenced template to exist and be valid; see [Conformance and Roadmap](conformance-and-roadmap.md).
- `RHT-74` Validators MAY warn when a note drifts materially from the canonical template structure.
