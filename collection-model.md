---
title: Collection Model
parent: TypedMark
nav_order: 2
---

# Collection Model

This page is authoritative for `typedmark.yaml`, the collection identity, the configurable metadata directory, ordered note-type mappings, named property sets, default property sets, property-set composition, the collection's composition provenance, effective block-merge rules, and validation defaults. It is not authoritative for the optional system fields of `typedmark.yaml` — release version, publishing metadata, and scaffold — nor for system composition or change history; those live in [Systems, Composition, and Evolution](systems-composition-evolution.md). It is also not authoritative for relationship and template semantics; those live in [Relationships, Headings, and Templates](relationships-headings-and-templates.md). Managed note field semantics still live in [Managed Notes and Properties](managed-notes-and-properties.md), even when field definitions are contributed through property sets, abstract note types, or note-type schemas. The combined result of those contributions is the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).

Property sets are the single composition mechanism for reusable `frontmatter`, `relationships`, and `headings`. A property set is a named bundle stored under `<metadata_directory>/property-sets/`. A collection applies property sets to note types in two ways: `typedmark.yaml` MAY name default property sets that apply to every note type, and a concrete note-type schema MAY name additional property sets to compose.

A concrete note type's own `frontmatter`, `relationships`, and `headings` blocks are not a second kind of frontmatter source. They are the note type's inline, note-type-scoped contribution to the same composition, applied last as the terminal layer of the merge. Reusable fields live in named property sets; one-off, note-type-specific fields live inline. There is one composition mechanism, with the inline blocks as its highest-precedence layer.

Note-type inheritance through `extends` is a distinct axis defined in [Note Type Schemas](note-type-schemas.md); it carries `kind`, `storage`, `template`, and `guidance`, which property sets do not.

## Collection Model Specification

`typedmark.yaml` defines collection-model-wide rules, including the metadata directory, the ordered note-type mappings, and the governed TypedMark artifacts.

Required fields:

```yaml
specification_version: 0.0.1
name: example-knowledge-base
label: Example Knowledge Base
description: Personal knowledge base.
metadata_directory: .typedmark
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
  invalid_composition: error
  unsupported_specification_version: error
  invalid_note_link: error
  invalid_relationship_definition: error
  invalid_relationship_instance: error
  invalid_heading: error
  template_drift: warn
```

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.yaml` `metadata_directory`.

Rules:

- `typedmark.yaml` MUST exist at the root of every conforming managed collection.
- `typedmark.yaml` MUST physically contain `specification_version`, `name`, `description`, `metadata_directory`, `exclude_paths`, and `validation_defaults`.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `name` is the collection's single identity. It identifies the collection's structural model and, when the collection is a publishable system, is the distribution identity a marketplace and `composition.sources` resolve against.
- `name` MUST be a non-empty string of at most 214 characters, including any scope.
- `name` MUST NOT contain uppercase letters or whitespace.
- `name` MAY be scoped using an `@scope/local-name` form.
- An unscoped `name`, and the scope and local-name parts of a scoped `name`, MUST each match `^[a-z0-9][a-z0-9._-]*$`.
- A scoped `name` MUST match `^@[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$`.
- `name` is case-sensitive and compared as exact Unicode code points.
- `name` is not a release; the release version is the optional `version` system field defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `name` SHOULD be unique to the system family it identifies.
- A collection has its own `name`; a collection composed from systems MUST give itself a `name` distinct from its sources, which appear in `composition.sources`.
- `label` MAY be omitted; if present, it MUST be a non-empty string.
- `label` is the human-facing display name of the collection; applications SHOULD display `label` when present and fall back to `name` otherwise.
- `description` MUST be a non-empty string; it is concise human-facing explanatory metadata for the collection.
- `keywords` MAY be omitted; if present, it MUST be a list of unique non-empty strings.
- `keywords` is discovery metadata that catalogs and marketplaces use to index and search collections.
- `typedmark.yaml` MAY declare the optional system fields, including `version`, `scaffold`, and discovery metadata, defined in [Systems, Composition, and Evolution](systems-composition-evolution.md). `version` is what makes a collection a publishable system.
- `metadata_directory` MUST be a non-empty string.
- `metadata_directory` MUST name a single directory at the collection root.
- `metadata_directory` MUST NOT be `.` or `..` and MUST NOT contain path separators.
- `metadata_directory` identifies the governed-artifact subtree for the collection, including the change history, property sets, note-type schemas, and templates.
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
- `invalid_property_set` applies when a property set file, a `typedmark.yaml` `default_property_sets` reference, or a note-type schema `property_sets` or `exclude_property_sets` reference violates the property-set rules defined in this page.
- `invalid_note_type_mapping` applies when a note-type mapping rule in `typedmark.yaml` violates the mapping-rule contract defined in this page.
- `invalid_composition` applies when the `composition` block in `typedmark.yaml` violates the composition-provenance rules defined in this page, including a source that does not resolve to exactly one system at the declared version.
- `unsupported_specification_version` applies when a governed artifact declares a `specification_version` whose major version the tool does not implement; the tool MUST report it and MUST NOT assert conformance for that artifact, as defined in [Foundations](foundations.md).
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
- Note-type mapping is evaluated before schema selection, property-set composition, note-type inheritance, field defaulting, field materialization, relationship derivation, or template comparison.
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

### Composition Provenance

`typedmark.yaml` MAY define `composition` to record the systems this collection's structure was composed from. The lineage is both provenance and the reproducible recipe: re-composing the same sources at the same versions reconstructs the same collection. It is also the input the update flow uses to migrate a collection to newer system versions. System composition, its deterministic merge semantics, and the migration flow are defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).

Example:

```yaml
composition:
  sources:
    - name: "@acme/para-system"
      version: 1.2.0
    - name: dev-team-ai-context
      version: 0.3.0
```

Rules:

- `composition` MAY be omitted. A collection authored directly, without composing any system, omits it.
- If present, `composition` MUST physically contain `sources`.
- `composition.sources` MUST be a non-empty ordered list.
- The order of `composition.sources` is significant and defines the composition merge order defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- Each source MUST declare `name` and `version`.
- A source `name` MUST follow the `name` rules defined above for a collection identity, including the scope and length rules.
- A source `version` MUST be a Semantic Versioning 2.0.0 string.
- A `name` MUST appear at most once in `composition.sources`.
- A source `name` MUST NOT equal the composing collection's own `name`.
- Each source MUST resolve to exactly one system whose `name` and `version` match; a source that does not resolve is an `invalid_composition` failure.
- A composed collection MUST remain self-contained: its materialized schemas, property sets, and templates MUST be physically present under `metadata_directory`, and conformance MUST NOT require re-resolving `composition.sources`.
- `composition` records provenance only; it does not relocate, replace, or override any governed artifact physically present under `metadata_directory`.

### Default Property Sets

`typedmark.yaml` MAY define `default_property_sets` to name the property sets that apply to every note type by default. This is how a collection declares shared `frontmatter`, `relationships`, and `headings` without repeating them in each schema.

Example:

```yaml
default_property_sets:
  - base
```

Rules:

- `default_property_sets` MAY be omitted.
- If present, `default_property_sets` MUST be a non-empty ordered list of unique property set identifiers.
- Each identifier in `default_property_sets` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- Default property sets are applied to every concrete note type unless that note type excludes them with `exclude_property_sets`.
- The order of identifiers in `default_property_sets` is significant for the effective merge order.
- If `default_property_sets` is omitted, no property set applies by default and a note type composes only the property sets it names in `property_sets`.

### Property Set Definitions

A property set is the single named reusable bundle for `frontmatter`, `relationships`, and `headings`. A collection applies a property set either by naming it in `default_property_sets` or by naming it in a concrete note-type schema's `property_sets`.

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

A property set MAY also contribute shared `relationships` and `headings`, which is how collection-wide relationship and heading defaults are expressed:

```yaml
specification_version: 0.0.1
property_set: base
description: Shared fields, relationships, and headings for every note type.
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

- `<metadata_directory>/property-sets/` MAY be omitted when no property sets are defined.
- Every YAML file directly under `<metadata_directory>/property-sets/` defines one property set.
- No separate registry file is maintained for property sets.
- The property set file basename MUST equal the file's `property_set` value.
- `property_set` MUST be a non-empty slug.
- Each property set file MUST physically contain `specification_version`, `property_set`, `description`, and `frontmatter`.
- A property set MAY also declare `relationships` and `headings`.
- `frontmatter` in a property set MUST be a field-definition mapping, even when it is empty.
- The semantics of frontmatter field definitions in property sets, including flat human-facing field metadata such as `label`, `description`, and `icon`, are the same as in note-type schemas.
- If a property set declares `relationships`, it MUST contain both `belongs_to.allowed_note_types` and `related_to.allowed_note_types`, even when those mappings are empty, and its semantics are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- If a property set declares `headings`, it MUST follow the heading shape required by [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- A property set's `frontmatter` MUST follow the core-defined managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- A property set MAY declare the core-defined `note_type` field; if it does, it MUST use `value_from_schema: note_type`.
- A property set MAY declare the core-defined `deleted` field under the rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- A property set MUST NOT define `id`.
- A property set MUST NOT define any other core-defined managed-note field name unless this specification version explicitly permits schema-level declaration of that field.
- A property set MUST NOT define storage, template, or guidance settings.
- A property set MUST NOT reference other property sets and MUST NOT name `default_property_sets`, `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.

### Composing Property Sets

A concrete note-type schema composes property sets through `property_sets`, opts out of default property sets through `exclude_property_sets`, and subtracts individual inherited fields through `frontmatter_remove`.

Example opt-in composition:

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

Example excluding a default property set:

```yaml
note_type: glossary
exclude_property_sets:
  - base
```

Example field subtraction:

```yaml
note_type: home
frontmatter_remove:
  - title
```

Rules:

- `property_sets`, `exclude_property_sets`, and `frontmatter_remove` MAY each be omitted.
- Only concrete note types MAY declare `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.
- If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- If present, `exclude_property_sets` MUST be a non-empty list of unique property set identifiers.
- Each identifier in `property_sets` and `exclude_property_sets` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- Each identifier in `exclude_property_sets` MUST be named in `default_property_sets`.
- A property set MUST NOT appear in both `default_property_sets` (after exclusions) and `property_sets` for the same note type.
- The order of identifiers in `property_sets` is significant for the effective merge order.
- A concrete note type's applied property sets are the default property sets in `default_property_sets` order, minus those named in `exclude_property_sets`, followed by the property sets named in `property_sets`.
- If present, `frontmatter_remove` MUST be a non-empty list of unique frontmatter field names.
- Each field named in `frontmatter_remove` MUST resolve to a field contributed by an applied default property set or by an abstract ancestor.
- If no frontmatter is contributed by default property sets or abstract ancestors, `frontmatter_remove` MUST be omitted.

Effective note-type schema merge rules:

- These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- The note type's own inline `frontmatter`, `relationships`, and `headings` blocks are the terminal layer of this same composition; they are applied last and take precedence over every applied property set.
- Frontmatter merges by field name within `frontmatter`.
- Default property set frontmatter, in `default_property_sets` order and after applying `exclude_property_sets`, is applied first.
- Frontmatter declared by abstract ancestors, if any, is applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- If a later abstract ancestor defines a field already defined by a default property set or by a more distant abstract ancestor, the later abstract ancestor definition replaces the earlier inherited definition completely and determines whether the field is effectively optional.
- If `frontmatter_remove` is present, the named fields are removed from accumulated inherited frontmatter after default-property-set and abstract-ancestor frontmatter has been applied and before any opt-in property set or local concrete note-type frontmatter is applied.
- Opt-in property sets named in `property_sets` are then applied in declared order.
- If two applied property sets define the same field name, the later property set in the applied order replaces the earlier definition completely.
- If a property set defines a field already defined by a default property set or abstract-ancestor frontmatter, the property set definition replaces the inherited definition completely and determines whether the field is effectively optional.
- If a local concrete note-type schema defines a field already contributed by inherited frontmatter or property sets, the local definition replaces the earlier definition completely and determines whether the field is effectively optional.
- A field removed by `frontmatter_remove` does not appear in the effective schema unless an opt-in property set or the local note-type schema defines that field later.
- Because replacement is complete, any property-set-provided or inherited field metadata such as `label`, `description`, or `icon` is replaced too unless the overriding definition restates it.
- Local concrete note-type schema frontmatter is applied last.
- `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- Default property set relationships, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- Relationship targets declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- Relationship targets declared by opt-in property sets are applied next in declared `property_sets` order.
- If a relationship target is defined both earlier in the merge stack and later in the merge stack or locally, the later definition replaces the earlier definition for that target.
- Default property set headings, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- Headings declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- Headings declared by opt-in property sets are applied next in declared `property_sets` order.
- `headings.required_h2` and `headings.optional_h2` use replace semantics across the merge stack and the local concrete schema: if a later list is present, it replaces the earlier list; otherwise the earlier list applies unchanged.
- Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics across the merge stack and the local concrete schema: a later value replaces the earlier value; otherwise the earlier value applies unchanged.
- Property-set composition and abstract note-type inheritance operate within the effective `frontmatter`, `relationships`, and `headings` blocks of the selected concrete note type; those effective blocks remain mandatory even when much of their content is contributed by property sets or abstract ancestors.
- A concrete note-type schema MAY omit individual property-set-provided or inherited field definitions, relationship target definitions, or heading settings that remain unchanged.
- Property-set composition affects only how the effective note-type schema is computed; it does not create a second schema file or a separate persisted artifact.
