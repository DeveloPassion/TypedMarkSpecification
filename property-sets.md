---
title: Property Sets
parent: TypedMark
nav_order: 22
audience: advanced
---

# Property Sets

Audience: collection authors sharing structure across note types.

Authoritative for:

- property-set artifacts and collection-wide default property sets
- concrete note-type property-set composition, exclusions, and field subtraction
- effective frontmatter, relationship, and heading block-merge rules

See also:

- [Collection Model](collection-model.md): metadata directory, folder scopes, and validation defaults
- [Note Type Schemas](note-type-schemas.md): note-type inheritance and the effective note-type schema
- [Field Definition Reference](field-definition-reference.md): the semantics of contributed field definitions
- [Managed Notes and Properties](managed-notes-and-properties.md): managed-note field names
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): contributed relationship and heading definitions

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.md` `metadata_directory`.

Property sets are the single composition mechanism for reusable `frontmatter`, `relationships`, and `headings`. A property set is a named bundle stored under `<metadata_directory>/property-sets/`. Collections apply them through collection-wide defaults, managed-note folder scopes, and property sets named by concrete note-type schemas.

A concrete note type's own `frontmatter`, `relationships`, and `headings` blocks are not a second kind of frontmatter source. They are the note type's inline, note-type-scoped contribution to the same composition, applied last as the terminal layer of the merge. Reusable fields live in named property sets; one-off, note-type-specific fields live inline. There is one composition mechanism, with the inline blocks as its highest-precedence layer.

Note-type inheritance through `extends` is a distinct axis defined in [Note Type Schemas](note-type-schemas.md); it carries `kind`, `storage`, `template`, and `guidance`, which property sets do not.

## Default Property Sets

`typedmark.md` can define `default_property_sets` to name the property sets that apply to every note type by default. This is how a collection declares shared `frontmatter`, `relationships`, and `headings` without repeating them in each schema.

Example:

<!-- typedmark-example: fragment: Collection default property-set references. -->
```yaml
default_property_sets:
  - base
```

Rules:

- `CM-135` `default_property_sets` MAY be omitted.
- `CM-136` If present, `default_property_sets` MUST be a non-empty ordered list of unique property set identifiers.
- `CM-137` Each identifier in `default_property_sets` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- `CM-138` Default property sets are applied to every concrete note type unless that note type excludes them with `exclude_property_sets`.
- `CM-139` The order of identifiers in `default_property_sets` is significant for the effective merge order.
- `CM-140` If `default_property_sets` is omitted, no property set applies globally; a managed note may still receive property sets from its concrete note type's `property_sets`.

## Property Set Definitions

A property set is the single named reusable bundle for `frontmatter`, `relationships`, and `headings`. A collection applies a property set globally through `default_property_sets`, explicitly through a concrete note-type schema's `property_sets`.

Shape at a glance:

| Key | Physical requirement | Effective default | Purpose |
| --- | --- | --- | --- |
| `specification_version` | Required | none | Selects the TypedMark specification version |
| `property_set` | Required | none | Property set identifier |
| `description` | Required | none | Human-facing summary |
| `frontmatter` | Required | none | Reusable field definitions |
| `label` | Optional | none | Display name |
| `icon` | Optional | none | Presentation token |
| `relationships` | Optional | empty relationship defaults | Reusable relationship target declarations |
| `headings` | Optional | empty heading defaults | Reusable heading settings |

Property set file shape:

<!-- typedmark-example: artifact=property-set -->
```yaml
specification_version: 0.1.0
property_set: review-metadata
description: Reusable review and publication fields.
frontmatter:
  workflow_state:
    label: Workflow State
    description: Editorial lifecycle state.
    icon: badge
    type: text
    allowed_values: [ draft, in_review, published ]
    not_blank: true
    nullable: true
    default_value: null
  rating:
    type: integer
    min: 1
    max: 5
    nullable: true
    default_value: null
  published_on:
    label: Published On
    description: Publication date when known.
    icon: calendar
    type: date
    nullable: true
    default_value: null
  published_time:
    label: Published Time
    description: Publication time of day when known.
    icon: clock
    type: time
    format: hh:mm
    nullable: true
    default_value: null
  canonical_url:
    label: Canonical URL
    description: Canonical external URL when known.
    icon: link
    type: link
    format: uri
    not_blank: true
    nullable: true
    default_value: null
  review_code:
    label: Review Code
    description: Human-readable review identifier.
    icon: hash
    type: text
    regex: "^[A-Z]{2}-\\d{4}$"
    nullable: true
    default_value: null
  integration_payload:
    label: Integration Payload
    description: External-system data preserved without a fixed schema.
    icon: package
    type: any
    nullable: true
    default_value: null
```

A property set can also contribute shared `relationships` and `headings`, which is how collection-wide relationship and heading defaults are expressed:

<!-- typedmark-example: artifact=property-set -->
```yaml
specification_version: 0.1.0
property_set: base
description: Shared fields, relationships, and headings for every note type.
frontmatter:
  title:
    label: Title
    description: Human-readable note title.
    type: text
    nullable: true
    default_value: null
relationships:
  belongs_to:
    allowed_note_types: {}
  related_to:
    allowed_note_types: {}
headings:
  required_h2: []
  optional_h2: []
  allow_other_h2: true
  require_order: false
```

Rules:

- `CM-141` `<metadata_directory>/property-sets/` MAY be omitted when no property sets are defined.
- `CM-142` Every Markdown file directly under `<metadata_directory>/property-sets/` defines one property set; its frontmatter is the property set definition, per the governed artifact format in [Foundations](foundations.md).
- `CM-143` No separate registry file is maintained for property sets.
- `CM-144` The property set file name without the `.md` extension MUST equal the file's `property_set` value.
- `CM-145` `property_set` MUST be a non-empty slug.
- `CM-146` Each property set file MUST physically contain `specification_version`, `property_set`, `description`, and `frontmatter`.
- `CM-147` A property set MAY declare `label` and `icon`; if present, each MUST be a non-empty string.
- `CM-148` `label` is the human-facing display name of the property set and `icon` is an opaque presentation token, with the same semantics as the note-type schema `label` and `icon` defined in [Note Type Schemas](note-type-schemas.md).
- `CM-149` A property set MAY also declare `relationships` and `headings`.
- `CM-150` `frontmatter` in a property set MUST be a field-definition mapping, even when it is empty.
- `CM-151` The semantics of frontmatter field definitions in property sets, including flat human-facing field metadata such as `label`, `description`, and `icon`, are the same as in note-type schemas, defined in [Field Definition Reference](field-definition-reference.md).
- `CM-152` If a property set declares `relationships`, it MUST follow the relationship block shape and semantics defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-153` If a property set declares `headings`, it MUST follow the heading shape required by [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-154` A property set's `frontmatter` MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `CM-155` A property set MAY declare the core-defined `note_type` field under its core field contract defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `CM-156` A property set MAY declare the core-defined `deleted` and `archived` fields under the rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `CM-157` A property set MUST NOT define `id`.
- `CM-158` A property set MUST NOT define any other core-defined managed-note field name unless this specification version explicitly permits schema-level declaration of that field.
- `CM-159` A property set MUST NOT define storage, template, or guidance settings.
- `CM-160` A property set MUST NOT reference other property sets and MUST NOT name `default_property_sets`, `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.

## Composing Property Sets

A managed note receives collection-controlled property sets through `default_property_sets`. Its concrete note-type schema opts out through `exclude_property_sets`, adds explicit sets through `property_sets`, and subtracts individual inherited fields through `frontmatter_remove`.

Example opt-in composition:

<!-- typedmark-example: fragment: Note-type property-set composition and local fields. -->
```yaml
note_type: review
property_sets:
  - workflow
  - publication-metadata

frontmatter:
  editor_notes:
    type: text
    nullable: true
    default_value: null
```

Example excluding a default property set:

<!-- typedmark-example: fragment: Note-type property-set exclusions. -->
```yaml
note_type: glossary
exclude_property_sets:
  - base
```

Example field subtraction:

<!-- typedmark-example: fragment: Note-type inherited field removal. -->
```yaml
note_type: home
frontmatter_remove:
  - title
```

Rules:

- `CM-161` `property_sets`, `exclude_property_sets`, and `frontmatter_remove` MAY each be omitted.
- `CM-162` Only concrete note types MAY declare `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.
- `CM-163` If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `CM-164` If present, `exclude_property_sets` MUST be a non-empty list of unique property set identifiers.
- `CM-165` Each identifier in `property_sets` and `exclude_property_sets` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- `CM-166` Each identifier in `exclude_property_sets` MUST be named in `default_property_sets`.
- `CM-167` A property set MUST NOT appear in both `default_property_sets` (after exclusions) and `property_sets` for the same note type.
- `CM-168` The order of identifiers in `property_sets` is significant for the effective merge order.
- `CM-169` Applied property sets are the non-excluded defaults in collection order followed by concrete opt-in property sets in their declared order.
- `CM-170` If present, `frontmatter_remove` MUST be a non-empty list of unique frontmatter field names.
- `CM-171` Each field named in `frontmatter_remove` MUST resolve to a field contributed by an applied default property set or by an abstract ancestor.
- `CM-172` If no frontmatter is contributed by default property sets or abstract ancestors, `frontmatter_remove` MUST be omitted.

Effective note-type schema merge rules:

- `CM-173` These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- `CM-174` The note type's own inline `frontmatter`, `relationships`, and `headings` blocks are the terminal layer of this same composition; they are applied last and take precedence over every applied property set.
- `CM-175` Frontmatter merges by field name within `frontmatter`.
- `CM-176` Default property set frontmatter, in `default_property_sets` order and after applying `exclude_property_sets`, is applied first.
- `CM-177` Frontmatter declared by abstract ancestors, if any, is applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-178` If a later abstract ancestor defines a field already defined by a default property set or by a more distant abstract ancestor, the later abstract ancestor definition replaces the earlier inherited definition completely including its value constraints and defaults.
- `CM-179` If `frontmatter_remove` is present, the named fields are removed from accumulated inherited frontmatter after default-property-set and abstract-ancestor frontmatter has been applied and before any opt-in property set or local concrete note-type frontmatter is applied.
- `CM-180` Opt-in property sets named in `property_sets` are then applied in declared order.
- `CM-181` If two applied property sets define the same field name, the later property set in the applied order replaces the earlier definition completely.
- `CM-182` If an opt-in property set defines a field already defined by a default property set or abstract-ancestor frontmatter, the opt-in property set definition replaces the inherited definition completely including its value constraints and defaults.
- `CM-183` If a local concrete note-type schema defines a field already contributed by inherited frontmatter or property sets, the local definition replaces the earlier definition completely including its value constraints and defaults.
- `CM-184` A field removed by `frontmatter_remove` does not appear in the effective schema unless an opt-in property set or the local note-type schema defines that field later.
- `CM-185` Because replacement is complete, any property-set-provided or inherited field metadata such as `label`, `description`, or `icon` is replaced too unless the overriding definition restates it.
- `CM-186` Local concrete note-type schema frontmatter is applied last.
- `CM-187` `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- `CM-188` Default property set relationships, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- `CM-189` Relationship targets declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-190` Relationship targets declared by opt-in property sets are applied next in declared `property_sets` order.
- `CM-191` If a relationship target is defined both earlier in the merge stack and later in the merge stack or locally, the later definition replaces the earlier definition for that target.
- `CM-192` Default property set headings, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- `CM-193` Headings declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-194` Headings declared by opt-in property sets are applied next in declared `property_sets` order.
- `CM-195` `headings.required_h2` and `headings.optional_h2` use replace semantics across the merge stack and the local concrete schema: if a later list is present, it replaces the earlier list; otherwise the earlier list applies unchanged.
- `CM-196` Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics across the merge stack and the local concrete schema: a later value replaces the earlier value; otherwise the earlier value applies unchanged.
- `CM-197` Default and opt-in property-set composition and abstract note-type inheritance operate within the effective `frontmatter`, `relationships`, and `headings` blocks of the selected concrete note type; the effective `frontmatter` block remains mandatory, while absent `relationships` and `headings` blocks take the empty defaults defined in [Note Type Schemas](note-type-schemas.md).
- `CM-198` A concrete note-type schema MAY omit individual property-set-provided or inherited field definitions, relationship target definitions, or heading settings that remain unchanged.
- `CM-199` Property-set composition affects only how the effective note-type schema is computed; it does not create a second schema file or a separate persisted artifact.

## Collection Conformance

These checks apply when the collection uses this optional contract.

Rules:

- `CR-9` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from `typedmark.md` or a note type used by managed notes resolves.

## Diagnostic Categories

These categories use the collection severity policy.

Rules:

- `CM-57` `invalid_property_set` applies when a property-set artifact or reference violates [Property Sets](property-sets.md).
