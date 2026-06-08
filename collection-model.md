---
title: Collection Model
parent: TypedMark
nav_order: 2
---

# Collection Model

This page is authoritative for `typedmark.yaml`, the configurable metadata directory, ordered note-type mappings, named property sets, collection-level inheritance, property-set application, effective block-merge rules, and validation defaults. It is not authoritative for `<metadata_directory>/system.yaml` or `<metadata_directory>/instance.yaml`; those live in [System Definitions and Instances](system-definitions-and-instances.md). It is also not authoritative for relationship and template semantics; those live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). Managed note field semantics still live in [Managed Notes and Properties](managed-notes-and-properties.md), even when field definitions are contributed through `global_properties`, abstract note types, property sets, or note-type schemas. The combined result of those contributions is the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).

## Collection Model Specification

`typedmark.yaml` defines collection-model-wide rules, including the metadata directory, the ordered note-type mappings, and the governed TypedMark artifacts.

Required fields:

```yaml
specification_version: 0.0.1
collection_model_id: example-knowledge-base
metadata_directory: .metadata
exclude_paths:
  - .git/**
validation_defaults:
  path: error
  missing_required_field: error
  missing_declared_field: error
  unknown_field: warn
  invalid_field_value: error
  duplicate_unique_value: error
  invalid_property_set: error
  invalid_note_type_mapping: error
  invalid_note_link: error
  invalid_relationship_definition: error
  invalid_relationship_instance: error
  invalid_heading: error
  template_drift: warn
```

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.yaml` `metadata_directory`.

Rules:

- `typedmark.yaml` MUST exist at the root of every conforming managed collection.
- A conforming system definition MUST also include `typedmark.yaml` at its root.
- `typedmark.yaml` MUST physically contain `specification_version`, `collection_model_id`, `metadata_directory`, `exclude_paths`, and `validation_defaults`.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `collection_model_id` MUST be a non-empty slug.
- `collection_model_id` identifies the structural collection model described by `typedmark.yaml`.
- `collection_model_id` is not an instantiated collection identifier.
- Multiple instantiated collections MAY share the same `collection_model_id`.
- `metadata_directory` MUST be a non-empty string.
- `metadata_directory` MUST name a single directory at the collection root.
- `metadata_directory` MUST NOT be `.` or `..` and MUST NOT contain path separators.
- `metadata_directory` identifies the governed-artifact subtree for the collection, including the system manifest, instance manifest, property sets, note-type schemas, and templates.
- Validators and agents MUST derive governed artifact locations from `metadata_directory`.
- `exclude_paths` defines additional content that validators and agents MUST ignore for structural reasoning. It does not redefine or relocate the metadata directory.
- `validation_defaults` provides default severity levels for collection-wide validation reporting.
- Supported validation severities are `error`, `warn`, `info`, and `off`.
- A note or artifact with any `error` violation is non-conforming.
- A note or artifact with only `warn` or `info` issues remains structurally usable.
- Validators SHOULD report the artifact path, note type when applicable, rule name, and failing field, relationship, or heading.
- `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `missing_required_field` applies when a field declared in `frontmatter` with `optional: false` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- `missing_declared_field` applies when a field declared in `frontmatter` is absent from stored note frontmatter.
- `unknown_field` applies when an undeclared field appears in `typedmark.yaml`, any governed YAML artifact, or managed note frontmatter.
- `invalid_field_value` applies when a field value violates a declared field-level value constraint such as `format`, `regex`, `not_empty`, `not_blank`, `min`, `max`, or `allowed_values`. `format: note_link` syntax and resolution failures still use `invalid_note_link`.
- `duplicate_unique_value` applies when a field declared with `unique: true` repeats a non-null stored value in more than one managed note of the same note type.
- `invalid_property_set` applies when a property set file, or a note-type schema property-set reference, violates the property-set rules defined in this page.
- `invalid_note_type_mapping` applies when a note-type mapping rule in `typedmark.yaml` violates the mapping-rule contract defined in this page.
- `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_relationship_instance` applies when concrete note-to-note links violate the relationship constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `template_drift` applies when a validator chooses to compare a managed note to its canonical template and detects material divergence that is not itself a core conformance failure.

### Note-Type Mappings

`typedmark.yaml` MAY define `note_type_mappings` to control how collection notes are associated with note types.

Example:

```yaml
note_type_mappings:
  - kind: frontmatter_field
    field: note_type
  - kind: fixed
    note_type: source
    when:
      path:
        under: "Sources/"
  - kind: fixed
    note_type: problem
    when:
      path:
        regex: "^Problems/\\d{4}/\\d{2}/.+\\.md$"
      frontmatter:
        tags:
          contains_any: [problem, blocker]
        severity:
          equals: high
```

Rules:

- `note_type_mappings` MAY be omitted.
- If `note_type_mappings` is omitted, the collection uses an implicit ordered mapping list containing exactly one rule equivalent to `kind: frontmatter_field` and `field: note_type`.
- If present, `note_type_mappings` MUST be a non-empty ordered list.
- Each mapping rule MUST be a YAML mapping and MUST declare `kind`.
- Supported `kind` values are `frontmatter_field` and `fixed`.
- Mapping rules are evaluated in list order.
- A collection note MAY match no mapping rule and remain untyped.
- The winning mapping rule is the first rule in `note_type_mappings` whose own match conditions succeed for a note.
- After a mapping rule wins for a note, later mapping rules MUST NOT be used as fallback for that note.
- Note-type mapping is evaluated before schema selection, inheritance, field defaulting, field materialization, relationship derivation, or template comparison.
- Mapping rules MAY inspect only the collection-relative note path and the stored frontmatter physically present in the note file.
- Mapping rules MUST NOT depend on the effective note-type schema, generated field values, or template content.
- `kind: frontmatter_field` MUST physically contain `field`.
- In this specification version, the only supported `field` value is `note_type`.
- A `kind: frontmatter_field` rule matches when the named field is physically present in stored frontmatter.
- The candidate note type produced by a `kind: frontmatter_field` rule is the stored value of that field.
- `kind: fixed` MUST physically contain `note_type` and `when`.
- `note_type` in a `kind: fixed` rule MUST be a non-empty slug and MUST resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`.
- A `kind: fixed` rule matches when every condition in its `when` block matches.
- The candidate note type produced by a `kind: fixed` rule is the rule's `note_type`.
- `when` MUST be a mapping.
- `when` MUST contain at least one of `path` or `frontmatter`.
- Multiple conditions within one `when` block are combined with logical AND.
- `when.path` MAY declare `equals`, `under`, and `regex`.
- Path conditions are evaluated against the collection-relative note path including the `.md` extension and normalized to use forward slashes.
- `when.path.equals` MUST be a non-empty collection-relative path string.
- `when.path.under` MUST be a non-empty collection-relative directory string and MUST end with `/`.
- `when.path.regex` MUST be a non-empty string and is matched against the entire normalized collection-relative note path.
- Regex evaluation in `note_type_mappings` uses the same implementation regex dialect documented for field constraints in [Managed Notes and Properties](managed-notes-and-properties.md).
- `when.frontmatter` is a mapping from top-level stored frontmatter field name to one predicate mapping.
- Nested frontmatter field paths are not supported in `note_type_mappings` in this specification version.
- If a note has no YAML frontmatter, all `when.frontmatter` predicates fail.
- Each frontmatter predicate MUST be a mapping.
- Each frontmatter predicate MUST declare at least one of `exists`, `equals`, `regex`, `contains_any`, or `contains_all`.
- If a frontmatter predicate declares more than one operator, all declared operators MUST match.
- `exists` MUST be a boolean.
- `equals` compares the stored field value using exact YAML-value equality.
- `regex` MUST be a non-empty string and is valid only when the stored field value is a string.
- `contains_any` and `contains_all` MUST be non-empty lists of non-empty strings.
- `contains_any` and `contains_all` are valid only when the stored field value is a YAML sequence of strings.
- If the winning mapping rule yields a candidate note type that does not resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`, the note is untyped.
- Because `note_type_mappings` is ordered, more specific rules SHOULD appear before more general rules.

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
    not_blank: true
    nullable: true
    default_value: null
  rating:
    type: integer
    min: 1
    max: 5
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
  published_time:
    label: Published Time
    description: Publication time of day when known.
    icon: clock
    type: time
    format: hh:mm
    optional: true
    nullable: true
    default_value: null
  canonical_url:
    label: Canonical URL
    description: Canonical external URL when known.
    icon: link
    type: link
    format: uri
    not_blank: true
    optional: true
    nullable: true
    default_value: null
  review_code:
    label: Review Code
    description: Human-readable review identifier.
    icon: hash
    type: text
    regex: "^[A-Z]{2}-\\d{4}$"
    optional: true
    nullable: true
    default_value: null
  integration_payload:
    label: Integration Payload
    description: External-system data preserved without a fixed schema.
    icon: package
    type: any
    optional: true
    nullable: true
    default_value: null
```

Rules:

- `<metadata_directory>/property-sets/` MAY be omitted when no property sets are defined.
- Every YAML file directly under `<metadata_directory>/property-sets/` defines one property set.
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

- A concrete note-type schema MAY define `property_sets`.
- Abstract note types MUST NOT define `property_sets`.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `property_sets` is opt-in only. If absent, no property sets are applied to that concrete note type.
- Each referenced property set MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- Property sets affect frontmatter only.
- Property sets are applied after inherited global and abstract-note-type frontmatter and before local concrete note-type frontmatter definitions.
- If `inheritance.enabled: false` or `inheritance.frontmatter: false`, only global frontmatter inheritance is disabled; frontmatter inherited from abstract note types and declared property sets still apply.
- The order of identifiers in `property_sets` is significant for the effective field order.
- Multiple property sets MUST NOT define the same field name unless the note-type schema also defines that field locally.
- Local note-type schema frontmatter definitions override property-set definitions by field name.

Effective note-type schema merge rules:

- These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- Frontmatter merges by field name within `frontmatter`.
- Enabled global frontmatter, when enabled, is applied first.
- Frontmatter declared by abstract ancestors, if any, is applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- If a later abstract ancestor defines a field already defined by enabled global frontmatter or by a more distant abstract ancestor, the later abstract ancestor definition replaces the earlier inherited definition completely and determines whether the field is effectively optional.
- If `inheritance.frontmatter_remove` is present, the named fields are removed from accumulated inherited frontmatter after enabled global and abstract-ancestor frontmatter has been applied and before any property set or local concrete note-type frontmatter is applied.
- If a property set defines a field already defined by inherited global or abstract-ancestor frontmatter, the property set definition replaces the inherited definition completely and determines whether the field is effectively optional.
- If a local concrete note-type schema defines a field already contributed by inherited frontmatter or property sets, the local definition replaces the earlier definition completely and determines whether the field is effectively optional.
- A field removed by `inheritance.frontmatter_remove` does not appear in the effective schema unless a declared property set or the local note-type schema defines that field later.
- Because replacement is complete, any inherited or property-set-provided field metadata such as `label`, `description`, or `icon` is replaced too unless the overriding definition restates it.
- Property sets are then applied in the schema's declared `property_sets` order.
- Local concrete note-type schema frontmatter is applied last.
- `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- Enabled global relationships, when enabled, are applied first.
- Relationship targets declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- If a relationship target is defined both earlier in the inherited stack and later in the inherited stack or locally, the later definition replaces the earlier definition for that target.
- Enabled global headings, when enabled, are applied first.
- Headings declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `headings.required_h2` and `headings.optional_h2` use replace semantics across the inherited stack and the local concrete schema: if a later list is present, it replaces the earlier list; otherwise the earlier list applies unchanged.
- Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics across the inherited stack and the local concrete schema: a later value replaces the earlier value; otherwise the earlier value applies unchanged.
- Property sets do not contribute relationship, heading, storage, template, or guidance content.
- Global inheritance and abstract note-type inheritance operate within the effective `frontmatter`, `relationships`, and `headings` blocks of the selected concrete note type; those effective blocks remain mandatory even when much of their content is inherited or provided by property sets.
- A concrete note-type schema MAY omit individual inherited or property-set-provided field definitions, relationship target definitions, or heading settings that remain unchanged.

### Disabling and Subtracting Inheritance

A concrete note-type schema MAY explicitly disable inheritance from `global_properties` and MAY subtract individual inherited frontmatter fields.

Example:

```yaml
note_type: glossary
inheritance:
  enabled: true
  frontmatter: false
  relationships: false
  headings: true
```

Example field subtraction:

```yaml
note_type: home
inheritance:
  enabled: true
  frontmatter: true
  frontmatter_remove:
    - title
```

Rules:

- `inheritance` MAY be omitted.
- Only concrete note types MAY declare `inheritance`.
- `inheritance.enabled` MAY be omitted; if omitted, it defaults to `true`.
- If `inheritance.enabled: false`, the concrete note type inherits nothing from `global_properties`.
- `inheritance.frontmatter`, `inheritance.relationships`, and `inheritance.headings` MAY each be omitted; if omitted, each defaults to `true`.
- `inheritance.frontmatter_remove` MAY be omitted.
- If present, `inheritance.frontmatter_remove` MUST be a non-empty list of unique frontmatter field names.
- Each field named in `inheritance.frontmatter_remove` MUST resolve to a field contributed by enabled `global_properties.frontmatter` or by an abstract ancestor.
- If no frontmatter is inherited from `global_properties` or abstract ancestors, `inheritance.frontmatter_remove` MUST be omitted.
- If one of those block-specific flags is `false`, the corresponding global block is ignored completely for that note type before merge rules are applied.
- If `inheritance.frontmatter: false`, only global frontmatter inheritance is disabled; frontmatter inherited from abstract note types still applies.
- If a block-specific flag is `false`, local definitions for that block still apply normally.
- `inheritance.frontmatter_remove` is evaluated after global block-specific disable rules and after abstract-ancestor frontmatter has been accumulated, and before declared property sets are applied.
- `inheritance.frontmatter_remove` subtracts inherited frontmatter from `global_properties` or abstract ancestors only; it does not remove fields contributed later by property sets or local concrete schema definitions.
- Block-specific flags and `inheritance.frontmatter_remove` affect global inheritance only; they do not disable abstract note-type inheritance, they do not disable declared property sets, and they do not make required effective blocks optional.
- Block-specific inheritance flags have no effect when `inheritance.enabled: false` because all inheritance is already disabled.
- Disable rules are evaluated before global merge rules are applied.
- Inheritance settings affect only how the effective note-type schema is computed; they do not create a second schema file or a separate persisted artifact.
