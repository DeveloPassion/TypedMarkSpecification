---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 6
audience: essentials
---

# Managed Notes and Properties

Audience: collection authors and implementers of read-only validation or note writers.

Authoritative for:

- the managed-note contract and core-defined note fields
- stored presence, effective values, and sparse authoring
- field names and managed-note materialization

See also:

- [Collection Model](collection-model.md): discovery, association, and mandatory-tag policy
- [Note Type Schemas](note-type-schemas.md): effective field definitions and storage
- [Field Definition Reference](field-definition-reference.md): types, constraints, and defaults
- [Note Links](note-links.md): resolution and aliases
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationship counts, headings, and starter state

## Notes in a Collection

A managed note is a collection note associated with one concrete schema by the
mapping rules in Collection Model. Untyped notes remain ordinary Markdown;
mapping errors are not a license to guess a type from prose or a filename.

Rules:

- `MN-2` A managed note is a collection note associated with exactly one known concrete note type.
- `MN-8` Untyped notes are outside the Core managed-note contract; a declared extension can govern other surfaces only when its own contract explicitly does so.
- `MN-120` A managed note MUST resolve to exactly one known concrete note type under the configured note-type mappings.
- `MN-121` A managed note MUST satisfy its effective note-type schema.
- `MN-123` A managed note MUST satisfy the applicable storage, relationship, and heading contracts.
- `MN-18` A managed note MUST remain usable as ordinary Markdown without preprocessing, transpilation, or note-local sidecars.

Path-based association can manage a body-only note; effective values determine
whether it conforms.

## Stored and Effective Values

Effective records add deterministic defaults without rewriting stored notes.
For example, omitted `status` can default to `draft`, while explicit null stays
null and is checked against nullability.

| Stored state | Effective value |
| --- | --- |
| Concrete value | That value, without coercion |
| Explicit null | Null, without substituting a default |
| Absent with an explicit `default_value` | The declared default |
| Absent core-defined field | Its applicable core fallback |
| Absent ordinary nullable field, no default | Null |
| Absent ordinary non-nullable field, no default | No conforming value |

Rules:

- `MN-118` A recognized frontmatter block used by a managed note MUST be a valid mapping under the grammar in [Foundations](foundations.md).
- `MN-91` A tool MUST derive effective field values using the Stored and Effective Values table.
- `MN-295` Validation and value-based constraints MUST use effective values unless their owning rule explicitly tests stored presence.
- `MN-296` Stored-presence tests MUST distinguish absence from an explicitly stored null.
- `MN-297` A read-only evaluation MUST NOT generate clock-dependent, random, or sequence values.
- `MN-298` Effective-value construction MUST NOT change a collection file.
- `MN-94` Declared fields inside a concrete object mapping MUST receive the same effective-value treatment recursively.
- `MN-299` An absent or null object MUST NOT be replaced with a mapping merely to apply defaults to its children.
- `MN-98` An absent declared field with no effective value satisfying its non-null requirement MUST be reported as `missing_declared_field`.
- `MN-99` A present null that violates a non-null requirement MUST be reported as `missing_required_field`.
- `MN-300` A tool MUST NOT infer a default from `allowed_values`, `const_value`, note body prose, or a generation strategy during read-only evaluation.

Empty text, empty lists, and empty mappings are concrete values, not absence.
Their constraints apply normally. The implicit fallbacks for optional core
fields do not force those fields to be serialized.

### Frontmatter Block Grammar

The authoritative grammar is in [Foundations](foundations.md#frontmatter-block-grammar).
No block is required solely for decoration: a mapping can provide association,
and defaults can provide effective values, without stored frontmatter.

### Field Names

Field declarations name top-level note properties or children of an `object`.
For example, `reviewed_at` is a valid declaration name, while `reviewed-at` is
not. Unknown stored properties follow the unknown-field policy rather than
being silently renamed.

Rules:

- `MN-25` A declared field name MUST match `^[a-z][a-z0-9_]*$` as a complete string.
- `MN-29` A field name MUST be unique within the `frontmatter` or `object.fields` mapping declaring it.
- `MN-33` Repeated declarations of the same field name through supported reuse mechanisms merge under the [Property Sets](property-sets.md) rules rather than creating distinct fields.

## Core-Defined Frontmatter Field Names

Core fields are recognized at note top level and optional in storage unless
compatible constraints require values. The table gives base contracts and
fallbacks; state defaults and timestamp strategies remain fixed.

| Field | Base value contract | Absence fallback | Schema customization |
| --- | --- | --- | --- |
| `note_type` | Non-empty text equal to the associated concrete type | Associated concrete type | No field declaration |
| `id` | Non-null text in `slug` format | No identifier | Compatible constraints/default or `uuid` generation |
| `deleted` | Non-null checkbox | `false` | Compatible constraints; fixed `false` default |
| `archived` | Non-null checkbox | `false` | Compatible constraints; fixed `false` default |
| `aliases` | List of unique non-empty text values | `[]` | Compatible item/value constraints and defaults |
| `tags` | Non-null `tags` value | `[]` | Compatible constraints and defaults |
| `title` | Text or null | Note basename without `.md` | Compatible constraints and defaults |
| `description` | Text or null | Null | Compatible constraints and defaults |
| `created_at` | Datetime or null | Null on read | Compatible constraints; fixed `generated: now` when materialized |
| `updated_at` | Datetime or null | Null on read | Compatible constraints; fixed `generated: now_on_write` when materialized |

Rules:

- `MN-35` A stored core-defined field MUST satisfy its base value contract in the table.
- `MN-87` A schema-level declaration of a core field MUST preserve its core type and meaning while narrowing only compatible constraints.
- `MN-301` A note-type schema or property set MUST NOT declare `note_type` as a field.
- `MN-40` A stored `note_type` MUST equal the note's associated concrete type.
- `MN-48` Non-null effective `id` values MUST be unique across all managed notes in the collection.
- `MN-15` A writer renaming or moving a note MUST preserve its effective non-null `id`.
- `MN-82` An alias MUST NOT contain `/`, `\`, `#`, `^`, `|`, or a line break.
- `MN-83` Aliases participate in note-link resolution through the alias pass defined in [Note Links](note-links.md).
- `MN-84` Two managed notes SHOULD NOT share an alias.
- `MN-309` A tool SHOULD report aliases shared by multiple managed notes.
- `MN-302` A writer MUST NOT replace an existing concrete `created_at` value.
- `MN-303` A writer making a semantic change MUST refresh an existing concrete `updated_at` according to `now_on_write`.
- `MN-304` A no-op write MUST NOT refresh `updated_at`.

For example, `Kickoff.md` defaults its title to `Kickoff`; explicit null remains
null. A schema can constrain the title, not change its type.

`template_regions` belongs to [Template Tracking](template-tracking.md), not to
the Core field set. Extension-owned fields are recognized only under their
applicable declared contracts.

### Logical Deletion and Archiving

Deletion and archiving are independent flags. For example, an archived note can
also be logically deleted without losing its identity or being removed from disk.

Rules:

- `MN-52` A note is not logically deleted when its effective `deleted` is `false`.
- `MN-53` A note is logically deleted when its effective `deleted` is `true`.
- `MN-54` Setting `deleted: true` MUST NOT itself move the note or apply archive storage rules.
- `MN-56` A logically deleted note MUST still satisfy its effective field, storage, relationship, and heading contracts.
- `MN-57` An internal link to a logically deleted note remains resolvable.
- `MN-71` Effective `archived: true` selects the note type's archive storage contract.
- `MN-72` Archiving MUST NOT otherwise change field, relationship, or heading conformance.
- `MN-74` `deleted` and `archived` are independent states.
- `MN-59` Hard deletion removes the note file and defines no tombstone artifact.
- `MN-61` A tool hard-deleting a note SHOULD report inbound links that will stop resolving before deleting it.

Relationship-count effects are defined in
[Relationships, Headings, and Templates](relationships-headings-and-templates.md).
Default query candidate selection is defined in [Portable Queries](queries.md).
Neither dependency requires a Core validator to implement a query engine.

## Mandatory Tags

Mandatory tags constrain the effective Core `tags` value; they do not require a
duplicate field declaration. An absent tag value defaults to an empty list, not
to an invented set of policy tags. Writers can append missing required tags;
validators report their absence without editing the note.

<!-- typedmark-example: fragment: Effective tags combine required policy entries with author-provided tags. -->
```yaml
tags:
  - personal
  - managed
  - type/meeting
```

Rules:

- `MN-125` Effective mandatory tags MUST be computed under [Collection Model](collection-model.md).
- `MN-126` A conforming note MUST contain each mandatory tag as an exact entry in its effective `tags`.
- `MN-128` Each missing mandatory tag MUST be reported as an `invalid_field_value` finding on `tags`.
- `MN-129` A writer producing a conforming note MUST supply any mandatory tags still missing from its effective value.
- `MN-130` Added mandatory tags MUST follow existing stored tags in effective mandatory-tag order.
- `MN-131` Materialization MUST preserve the values and relative order of existing stored tags.
- `MN-132` Tag materialization MUST NOT introduce a duplicate under the string comparison baseline.
- `MN-133` A writer MUST NOT remove a stored tag merely because it is no longer mandatory.

## Canonical Field Materialization

Normalization writes declared fields and policy-required values, not every
optional Core name. For example, an ordinary edit leaves a defaulted `status`
absent; explicit normalization can write `status: draft`.

Rules:

- `MN-100` A create or scaffold operation claiming conformance MUST produce a note whose effective record satisfies its applicable contracts.
- `MN-101` An ordinary edit MUST preserve an omitted field when its effective value already satisfies the applicable requirements and the edit does not assign that field.
- `MN-102` Explicit normalization MUST materialize the declared field set using its conforming effective values and applicable write-time generation rules.
- `MN-305` A normalization operation MUST preserve an explicitly stored null unless the user explicitly requests its replacement.
- `MN-306` A writer MUST obtain a conforming value instead of inventing one when a required value remains unknown.
- `MN-307` A writer MUST NOT discard unknown stored properties merely because they are undeclared.
- `MN-308` A frontmatter-only write MUST preserve the note body.

## Field Optionality

`nullable` controls whether null is valid. Stored omission is governed by
effective-value construction, not a second `optional` switch. Existence
predicates can still distinguish omitted fields from explicit null values.

Rules:

- `MN-111` An undeclared top-level property is evaluated under `unknown_field`, except for Core fields and fields permitted by an applicable extension contract.
- `MN-112` Undeclared children of a typed object are evaluated under the same unknown-field policy recursively.
- `MN-113` Optional Core-field storage does not exempt a stored value from its fixed Core value contract or compatible schema constraints.

## Automation Events and One-Hop Execution

See [Automation Runtime](automation-runtime.md#automation-events-and-one-hop-execution).

### Execution Capabilities and Targets

See [Automation Runtime](automation-runtime.md#execution-capabilities-and-targets).

### Action Effects and Atomicity

See [Automation Runtime](automation-runtime.md#action-effects-and-atomicity).

## Dependency Propagation and Consistency

See [Automation Runtime](automation-runtime.md#dependency-propagation-and-consistency).

### Propagation Inputs and Dependency Graph

See [Automation Runtime](automation-runtime.md#propagation-inputs-and-dependency-graph).

### Waves, Fixed Points, and Cycles

See [Automation Runtime](automation-runtime.md#waves-fixed-points-and-cycles).

### Atomic Commit, Recovery, and Approval

See [Automation Runtime](automation-runtime.md#atomic-commit-recovery-and-approval).
