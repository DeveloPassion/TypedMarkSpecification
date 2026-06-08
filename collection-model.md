---
title: Collection Model
parent: TypedMark
nav_order: 2
---

# Collection Model

This page is authoritative for `typedmark.yaml`, named property sets, collection-level inheritance, property-set application, and validation defaults. It is not authoritative for `.metadata/system.yaml` or `.metadata/instance.yaml`; those live in [System Definitions and Instances](system-definitions-and-instances.md). It is also not authoritative for relationship and template semantics; those live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). Managed note field semantics still live in [Managed Notes and Properties](managed-notes-and-properties.md), even when field definitions are contributed through `global_properties`, property sets, or note-type schemas. The combined result of those contributions is the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).

## Collection Model Specification

`typedmark.yaml` defines collection-model-wide rules.

Required fields:

```yaml
specification_version: 0.0.1
collection_model_id: example-knowledge-base
exclude_paths:
  - .git/**
  - .metadata/**
validation_defaults:
  path: error
  missing_required_field: error
  missing_declared_field: error
  unknown_field: warn
  invalid_allowed_value: error
  duplicate_unique_value: error
  invalid_property_set: error
  invalid_note_link: error
  invalid_relationship_definition: error
  invalid_relationship_instance: error
  invalid_heading: error
  template_drift: warn
```

Rules:

- `typedmark.yaml` MUST exist at the root of every conforming managed collection.
- A conforming system definition MUST also include `typedmark.yaml` at its root.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `collection_model_id` MUST be a non-empty slug.
- `collection_model_id` identifies the structural collection model described by `typedmark.yaml`.
- `collection_model_id` is not an instantiated collection identifier.
- Multiple instantiated collections MAY share the same `collection_model_id`.
- `exclude_paths` defines content that validators and agents MUST ignore for structural reasoning.
- `validation_defaults` provides default severity levels for collection-wide validation reporting.
- Supported validation severities are `error`, `warn`, `info`, and `off`.
- A note or artifact with any `error` violation is non-conforming.
- A note or artifact with only `warn` or `info` issues remains structurally usable.
- Validators SHOULD report the artifact path, note type when applicable, rule name, and failing field, relationship, or heading.
- `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `missing_required_field` applies when a field declared in `frontmatter` with `optional: false` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- `missing_declared_field` applies when a field declared in `frontmatter` is absent from stored note frontmatter.
- `unknown_field` applies when an undeclared field appears in `typedmark.yaml`, any governed YAML artifact, or managed note frontmatter.
- `invalid_allowed_value` applies when a field value violates an `allowed_values` constraint.
- `duplicate_unique_value` applies when a field declared with `unique: true` repeats a non-null stored value in more than one managed note of the same note type.
- `invalid_property_set` applies when a property set file, or a note-type schema property-set reference, violates the property-set rules defined in this page.
- `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_relationship_instance` applies when concrete note-to-note links violate the relationship constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `template_drift` applies when a validator chooses to compare a managed note to its canonical template and detects material divergence that is not itself a core conformance failure.

### Global Property Definitions

`typedmark.yaml` MAY define `global_properties` to declare note properties that apply to all note types.

Example:

```yaml
global_properties:
  frontmatter:
    note_type:
      type: text
      value_from_schema: note_type
    title:
      label: Title
      description: Human-readable note title.
      type: text
      nullable: true
      default_value: null
    description:
      label: Description
      description: Human-readable note description.
      type: text
      optional: true
      nullable: true
      default_value: ""
    summary:
      label: Summary
      description: Short overview of the note.
      type: text
      optional: true
      nullable: true
      default_value: ""
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

- `global_properties` MAY be omitted.
- `global_properties` MAY define shared defaults for `frontmatter`, `relationships`, and `headings`.
- The semantics of `frontmatter`, including flat human-facing field metadata such as `label`, `description`, and `icon`, are defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `global_properties.frontmatter` MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The semantics of `relationships` and `headings` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Every note type inherits `global_properties` by default.
- Note-type schemas MAY override inherited global properties locally.

### Property Set Definitions

A property set is a named reusable frontmatter field set that note-type schemas opt into explicitly. Property sets are distinct from `global_properties`: `global_properties` apply by default when inheritance is enabled, while property sets never apply unless a schema references them.

Property set file shape:

```yaml
specification_version: 0.0.1
property_set: review-metadata
description: Reusable review and publication fields.
frontmatter:
  workflow_state:
    label: Workflow State
    description: Editorial lifecycle state.
    icon: badge
    type: text
    allowed_values: [draft, in_review, published]
    nullable: true
    default_value: null
  rating:
    type: number
    optional: true
    nullable: true
    default_value: null
  published_on:
    label: Published On
    description: Publication date when known.
    icon: calendar
    type: date
    optional: true
    nullable: true
    default_value: null
```

Rules:

- `.metadata/property-sets/` MAY be omitted when no property sets are defined.
- Every YAML file directly under `.metadata/property-sets/` defines one property set.
- No separate registry file is maintained for property sets.
- The property set file basename MUST equal the file's `property_set` value.
- `property_set` MUST be a non-empty slug.
- Each property set file MUST physically contain `specification_version`, `property_set`, `description`, and `frontmatter`.
- `frontmatter` in a property set MUST be a field-definition mapping, even when it is empty.
- The semantics of frontmatter field definitions in property sets, including flat human-facing field metadata such as `label`, `description`, and `icon`, are the same as in note-type schemas.
- A property set MAY define reusable frontmatter fields only.
- A property set MUST NOT define `note_type` or `id`.
- A property set MUST NOT define any other core-defined managed-note field name unless this specification version explicitly permits schema-level declaration of that field.
- A property set MUST NOT define storage, template, relationships, headings, guidance, or inheritance settings.
- A property set MUST NOT reference other property sets.

### Applying Property Sets

Example note-type schema usage:

```yaml
note_type: review
property_sets:
  - workflow
  - publication-metadata

frontmatter:
  note_type:
    type: text
    const_value: review
  editor_notes:
    type: text
    optional: true
    nullable: true
    default_value: null
```

Rules:

- A note-type schema MAY define `property_sets`.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `property_sets` is opt-in only. If absent, no property sets are applied.
- Each referenced property set MUST resolve to exactly one file under `.metadata/property-sets/`.
- Property sets affect frontmatter only.
- Property sets are applied after global frontmatter inheritance and before local note-type schema frontmatter definitions.
- If `inheritance.enabled: false` or `inheritance.frontmatter: false`, only global frontmatter inheritance is disabled; declared property sets still apply.
- The order of identifiers in `property_sets` is significant for the effective field order.
- Multiple property sets MUST NOT define the same field name unless the note-type schema also defines that field locally.
- Local note-type schema frontmatter definitions override property-set definitions by field name.

Effective note-type schema merge rules:

- These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- Frontmatter merges by field name within `frontmatter`.
- If a property set defines a field already defined by inherited global frontmatter, the property set definition replaces the inherited global definition completely and determines whether the field is effectively optional.
- If a local note-type schema defines a field already contributed by inherited global frontmatter or property sets, the local definition replaces the earlier definition completely and determines whether the field is effectively optional.
- Because replacement is complete, any inherited or property-set-provided field metadata such as `label`, `description`, or `icon` is replaced too unless the overriding definition restates it.
- Global frontmatter, when enabled, is applied first.
- Property sets are then applied in the schema's declared `property_sets` order.
- Local note-type schema frontmatter is applied last.
- `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- If a relationship target is defined both globally and locally, the local target definition replaces the global target definition for that target.
- `headings.required_h2` and `headings.optional_h2` use replace semantics: if a local list is present, it replaces the global list; otherwise the global list applies unchanged.
- Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics: a local value replaces the global value; otherwise the global value applies unchanged.
- Property sets do not contribute relationship, heading, storage, template, or guidance content.
- Inheritance operates within the required `frontmatter`, `relationships`, and `headings` blocks of a note-type schema; those blocks remain mandatory even when much of their effective content is inherited or provided by property sets.
- A note-type schema MAY omit individual inherited or property-set-provided field definitions, relationship target definitions, or heading settings that remain unchanged.

### Disabling Inheritance

A note-type schema MAY explicitly disable inheritance from `global_properties`.

Example:

```yaml
note_type: glossary
inheritance:
  enabled: true
  frontmatter: false
  relationships: false
  headings: true
```

Rules:

- `inheritance` MAY be omitted.
- `inheritance.enabled` MAY be omitted; if omitted, it defaults to `true`.
- If `inheritance.enabled: false`, the note type inherits nothing from `global_properties`.
- `inheritance.frontmatter`, `inheritance.relationships`, and `inheritance.headings` MAY each be omitted; if omitted, each defaults to `true`.
- If one of those block-specific flags is `false`, the corresponding global block is ignored completely for that note type before merge rules are applied.
- If a block-specific flag is `false`, local definitions for that block still apply normally.
- Block-specific flags affect global inheritance only; they do not disable declared property sets and they do not make required schema blocks optional.
- Block-specific inheritance flags have no effect when `inheritance.enabled: false` because all inheritance is already disabled.
- Disable rules are evaluated before global merge rules and before declared property sets are applied.
- Inheritance settings affect only how the effective note-type schema is computed; they do not create a second schema file or a separate persisted artifact.
