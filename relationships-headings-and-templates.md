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
- [Foundations](foundations.md): parsing and string comparison baselines
- [Template Tracking](template-tracking.md): template-region ownership, receipt state, drift classification, and reconciliation
- [Content Expansion](content-expansion.md): derived Markdown regions, rendering, synchronization, and ejection

## Relationship Model

`belongs_to` models primary ownership or governing context; `related_to` models
secondary association. Schema declarations constrain typed relationship
instances, not the permission to write ordinary internal links. Instances come
from resolved note links under the rules below.

Rules:

- `RHT-5` Concrete relationship instances are computed from resolved internal note links using the rules in [Note Links](note-links.md).
- `RHT-6` Metadata properties contribute typed relationship instances only when their field definitions declare `relationship_kind`.
- `RHT-7` Body internal note links participate only in the `related_to` relationship model, and contribute typed relationship instances only for target note types declared under `related_to`; every other body link is purely navigational.
- `RHT-10` Inverse views MAY be derived by tooling and MUST NOT require duplicate schema declarations.

## Relationship Constraints

A relationship block contains `belongs_to.allowed_note_types` and
`related_to.allowed_note_types`. Both default to empty. Each target has optional
`min`/`max` bounds, defaulting to zero/unbounded.

Rules:

- `RHT-14` If a schema file physically declares `relationships`, it MUST define both `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`.
- `RHT-15` Every referenced target note type MUST be a note type defined in the same collection; it MAY be abstract.
- `RHT-20` Within a single relationship kind, a target note type identifier MUST appear at most once.
- `RHT-21` The target note type sets for `belongs_to` and `related_to` MUST be disjoint for a given source note type, after expanding abstract targets to their concrete descendants.
- `RHT-25` If present, `min` and `max` MUST be non-negative integers.
- `RHT-26` If both are present, `max` MUST be greater than or equal to `min`.
- `RHT-27` If a target note type is not declared, no typed-relationship constraint applies to links targeting notes of that type; such links remain valid internal note links and do not create typed relationship instances.
- `RHT-30` Schema-definition validation MUST validate declaration shape, referenced note types, cardinality values, and disjointness of relationship kinds.
- `RHT-31` Concrete relationship instance validation MUST evaluate the resolved typed relationship instances against the declared targets and cardinality of the source note type's effective schema.
- `RHT-32` For `belongs_to`, concrete relationship instances are the unique resolved targets referenced by frontmatter fields with `relationship_kind: belongs_to`.
- `RHT-33` For `related_to`, concrete relationship instances are the union of:
  - unique resolved targets referenced by frontmatter fields with `relationship_kind: related_to`
  - unique resolved targets referenced by internal note links in the note body
- `RHT-34` Only resolved managed-note targets create concrete relationship instances.
- `RHT-35` Unresolved placeholders do not satisfy minimum-cardinality requirements until they resolve to concrete targets.
- `RHT-36` Duplicate concrete links from the same source note to the same target note under the same relationship kind are semantically idempotent and count once.
- `RHT-37` A logically deleted target MUST be excluded from relationship cardinality while its note links remain resolvable.
- `RHT-39` Link validity failures are reported as `invalid_note_link`; cardinality failures on declared targets are reported as `invalid_relationship_instance`, as defined in [Collection Model](collection-model.md).
- `RHT-40` A Markdown link in body content with a destination that is not a supported internal note-link form does not participate in typed relationship conformance.
- `RHT-41` Temporary draft states during authoring or UI workflows are outside persisted conformance.
- `RHT-42` Applications MAY allow transient draft states during authoring, but a persisted note or instantiated collection claimed as conforming MUST satisfy the cardinality rules derived from its note type.

For example, a declared target with `min: 1` needs one resolved, non-deleted
managed target. A deleted source is still validated against its own constraints;
deletion does not exempt the source from validation.

## Heading Rules

Headings are unconstrained unless configured. The effective defaults are empty
required/optional H2 lists, `allow_other_h2: true`, `require_order: false`, and
`require_h1_title: false`.

Rules:

- `RHT-47` Heading detection MUST use CommonMark 0.31.2 block structure, excluding code blocks and code spans.
- `RHT-48` H1 headings are ungoverned by default: a managed note MAY contain zero or more H1 headings, and no relationship between an H1 and the `title` field is assumed.
- `RHT-49` A `headings` block MAY declare `require_h1_title` to couple the body H1 to the note's `title` field.
- `RHT-50` `require_h1_title` MUST be a boolean; if omitted, it defaults to `false`.
- `RHT-51` With `require_h1_title: true`, the body MUST have exactly one H1 that precedes every other heading and equals the effective Core title.
- `RHT-52` A null effective title cannot satisfy `require_h1_title`.
- `RHT-53` A `require_h1_title` violation is an `invalid_heading` failure.
- `RHT-54` H1 and H2 text MUST use the same extraction procedure.
- `RHT-55` Other heading validation applies to H2 headings only.
- `RHT-56` Heading text MUST be the block parser's inline source after removing ATX/setext delimiters, joining setext content lines with spaces, and trimming outer whitespace without interpreting inline Markdown.
- `RHT-57` A managed-note H2 heading matches a declared heading entry when their texts are equal under the string comparison rules defined in [Foundations](foundations.md).
- `RHT-58` `required_h2` entries MUST appear exactly once unless a future specification version says otherwise.
- `RHT-59` `optional_h2` entries MAY appear zero or one time.
- `RHT-60` If `allow_other_h2` is `false`, undeclared H2 headings MUST NOT appear.
- `RHT-61` If `allow_other_h2` is `true`, undeclared H2 headings MAY appear.
- `RHT-62` With `require_order: true`, matched headings MUST preserve the relative order within each declared list independently.
- `RHT-63` If `require_order` is `false`, declared H2 headings MAY appear in any order.
- `RHT-64` H3 and deeper headings are unconstrained by this version of the specification.
- `RHT-285` Each required/optional H2 list MUST contain unique non-empty text entries.
- `RHT-286` The required and optional H2 lists MUST be disjoint under the string comparison baseline.

For example, required `[Context, Decision]` and optional `[Notes, References]`
allow `Context, Notes, Decision, References` when ordering is enabled. `## Context ##`
and a setext H2 named `Context` both match `Context`; `## *Context*` matches
the literal entry `*Context*`, not `Context`.

## Templates

A template is starter state, not a persisted managed note. When no explicit
template is selected and the conventional file is absent, the starter state is
derived from the concrete schema: declared fields have null placeholders,
mandatory tags have their required values, required H2s are empty sections,
and there is no additional prose.

An existing template overrides that derived state. Its YAML frontmatter can be
partial or absent; omission does not erase a derived field. An explicitly named
missing file is an error rather than a reason to hide a broken reference.

<!-- typedmark-example: body: A body-only template overrides the derived starter body. -->
```markdown
## Context

Explain the background.

## Decision
```

Rules:

- `RHT-65` A concrete type MUST use its explicit template when supplied, otherwise its existing conventional template or derived starter state.
- `RHT-67` Present template frontmatter MUST be a valid YAML mapping.
- `RHT-68` An explicit template MUST be checked against the referencing type's effective field contracts.
- `RHT-69` Omitted template fields MUST retain the derived starter values.
- `RHT-70` An invalid existing template makes its referencing type non-conforming.
- `RHT-71` Templates MUST NOT invent metadata fields merely to mirror relationship declarations.
- `RHT-72` Derived starter bodies MUST include required H2 sections in declared order.
- `RHT-73` An explicitly named template file MUST exist.
- `RHT-74` A validator MUST NOT infer template drift from unmarked template or note content.
- `RHT-75` A conventional template path MUST use the same path resolution as an explicit reference.
- `RHT-76` Template frontmatter MUST NOT introduce undeclared fields except those permitted by Core or an applicable extension.
- `RHT-77` A template MAY use null as an unresolved placeholder even for a non-nullable declared field.
- `RHT-78` A template MAY use an empty string as an unresolved text or link placeholder.
- `RHT-79` Template placeholders MUST be distinguished from explicit values supplied by a note author or scaffold caller.
- `RHT-80` Non-placeholder template values MUST satisfy the effective field constraints.
- `RHT-81` Instantiation MUST apply supplied values, deterministic defaults, and applicable generation before claiming the created note conforms.
- `RHT-82` Unresolved placeholders that violate note constraints MUST prevent an instantiated-note conformance claim.
- `RHT-83` Note storage, relationship cardinality, and heading conformance are evaluated on the instantiated note, not on unresolved starter state.
- `RHT-89` Derived mandatory tags MUST be present as concrete starter values rather than null placeholders.
- `RHT-92` Instantiated tags MUST satisfy the effective policy in [Managed Notes and Properties](managed-notes-and-properties.md#mandatory-tags).

Explicit stored nulls in existing notes are not template placeholders.
Normalization preserves those nulls unless their replacement is explicitly
requested. Template derivation neither writes a file nor manufactures missing
domain values needed by the resulting note.


## Template Drift Tracking

See [Template Drift Tracking](template-tracking.md#template-drift-tracking) for the authoritative contract.

### Ownership and Marker Grammar

See [Ownership and Marker Grammar](template-tracking.md#ownership-and-marker-grammar) for the authoritative contract.

### Receipts and Region Digests

See [Receipts and Region Digests](template-tracking.md#receipts-and-region-digests) for the authoritative contract.

### Drift Classification

See [Drift Classification](template-tracking.md#drift-classification) for the authoritative contract.

### Reconciliation and Detachment

See [Reconciliation and Detachment](template-tracking.md#reconciliation-and-detachment) for the authoritative contract.

## Content Expansion

See [Content Expansion](content-expansion.md#content-expansion) for the authoritative contract.

### Marker Grammar

See [Marker Grammar](content-expansion.md#marker-grammar) for the authoritative contract.

### Sources and Rendering

See [Sources and Rendering](content-expansion.md#sources-and-rendering) for the authoritative contract.

### Materialization, Synchronization, and Drift

See [Materialization, Synchronization, and Drift](content-expansion.md#materialization-synchronization-and-drift) for the authoritative contract.
