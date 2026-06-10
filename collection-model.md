---
title: Collection Model
parent: TypedMark
nav_order: 4
audience: essentials
---

# Collection Model

Audience: collection authors.

Authoritative for:

- the structural fields of `typedmark.md`: identity, metadata directory, excluded paths, assets directory, timezone, validation defaults, and vocabularies
- note-type mappings and composition provenance
- property sets, default property sets, and the block-merge rules of composition

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): the optional system fields, composition, and change history
- [Note Type Schemas](note-type-schemas.md): the effective note-type schema the merge rules feed
- [Field Definition Reference](field-definition-reference.md): the semantics of the field definitions property sets contribute

Property sets are the single composition mechanism for reusable `frontmatter`, `relationships`, and `headings`. A property set is a named bundle stored under `<metadata_directory>/property-sets/`. A collection applies property sets to note types in two ways: `typedmark.md` MAY name default property sets that apply to every note type, and a concrete note-type schema MAY name additional property sets to compose.

A concrete note type's own `frontmatter`, `relationships`, and `headings` blocks are not a second kind of frontmatter source. They are the note type's inline, note-type-scoped contribution to the same composition, applied last as the terminal layer of the merge. Reusable fields live in named property sets; one-off, note-type-specific fields live inline. There is one composition mechanism, with the inline blocks as its highest-precedence layer.

Note-type inheritance through `extends` is a distinct axis defined in [Note Type Schemas](note-type-schemas.md); it carries `kind`, `storage`, `template`, and `guidance`, which property sets do not.

## Collection Model Specification

`typedmark.md` defines collection-model-wide rules, including the metadata directory, the ordered note-type mappings, and the governed TypedMark artifacts.

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
  invalid_note_count: error
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

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.md` `metadata_directory`.

Rules:

- `CM-1` `typedmark.md` MUST exist at the root of every conforming managed collection.
- `CM-2` `typedmark.md` MUST physically contain `specification_version`, `name`, `description`, `metadata_directory`, `exclude_paths`, and `validation_defaults`.
- `CM-3` The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `CM-4` `name` is the collection's single identity. It identifies the collection's structural model and, when the collection is a publishable system, is the distribution identity a marketplace and `composition.sources` resolve against.
- `CM-5` `name` MUST be a non-empty string of at most 214 characters, including any scope.
- `CM-6` `name` MUST NOT contain uppercase letters or whitespace.
- `CM-7` `name` MAY be scoped using an `@scope/local-name` form.
- `CM-8` An unscoped `name`, and the scope and local-name parts of a scoped `name`, MUST each match `^[a-z0-9][a-z0-9._-]*$`.
- `CM-9` A scoped `name` MUST match `^@[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$`.
- `CM-10` `name` is case-sensitive and compared as exact Unicode code points.
- `CM-11` `name` is not a release; the release version is the optional `version` system field defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `CM-12` `name` SHOULD be unique to the system family it identifies.
- `CM-13` A collection has its own `name`; a collection composed from systems MUST give itself a `name` distinct from its sources, which appear in `composition.sources`.
- `CM-14` `label` MAY be omitted; if present, it MUST be a non-empty string.
- `CM-15` `label` is the human-facing display name of the collection; applications SHOULD display `label` when present and fall back to `name` otherwise.
- `CM-16` `description` MUST be a non-empty string; it is concise human-facing explanatory metadata for the collection.
- `CM-17` `keywords` MAY be omitted; if present, it MUST be a list of unique non-empty strings.
- `CM-18` `keywords` is discovery metadata that catalogs and marketplaces use to index and search collections.
- `CM-19` `typedmark.md` MAY declare the optional system fields, including `version`, `scaffold`, and discovery metadata, defined in [Systems, Composition, and Evolution](systems-composition-evolution.md). `version` is what makes a collection a publishable system.
- `CM-20` `metadata_directory` MUST be a non-empty string.
- `CM-21` `metadata_directory` MUST name a single directory at the collection root.
- `CM-22` `metadata_directory` MUST NOT be `.` or `..` and MUST NOT contain path separators.
- `CM-23` `metadata_directory` identifies the governed-artifact subtree for the collection, including the change history, property sets, note-type schemas, and templates.
- `CM-24` Validators and agents MUST derive governed artifact locations from `metadata_directory`.
- `CM-25` `exclude_paths` defines additional content that validators and agents MUST ignore for structural reasoning. It does not redefine or relocate the metadata directory.
- `CM-26` Each `exclude_paths` entry is a glob pattern matched against the entire normalized collection-relative path, using forward slashes.
- `CM-27` In `exclude_paths` globs, `*` matches any number of characters within one path segment, `?` matches exactly one character within a segment, and `**` matches any number of path segments including none.
- `CM-28` `exclude_paths` does not support negation patterns in this specification version.
- `CM-29` A note matched by `exclude_paths` is not a collection note: it is not evaluated for note-type mapping and is not a candidate for note-link resolution.
- `CM-30` An `exclude_paths` entry that would exclude `typedmark.md` or content under the metadata directory has no effect on those paths.
- `CM-31` `assets_directory` MAY be omitted.
- `CM-32` If present, `assets_directory` MUST be a non-empty collection-relative directory path using forward slashes, MUST NOT start or end with `/`, MUST NOT contain `.` or `..` segments, and MUST NOT equal the `metadata_directory` value.
- `CM-33` `assets_directory` names the folder where collection assets SHOULD live; tools that add assets to the collection SHOULD place them under it.
- `CM-34` `assets_directory` does not change asset-link resolution; an asset resolves wherever it lives.
- `CM-35` Tools MAY report assets stored outside `assets_directory`, and MAY report orphan assets that no collection note references; automated asset cleanup is not defined in this specification version.
- `CM-36` This specification version defines no per-asset metadata mechanism.
- `CM-37` `timezone` MAY be omitted.
- `CM-38` If present, `timezone` MUST be an IANA Time Zone Database identifier, such as `UTC` or `Europe/Brussels`.
- `CM-39` If `timezone` is omitted, the collection timezone is `UTC`.
- `CM-40` The collection timezone defines how the current instant is converted to local dates and times wherever this specification refers to the current time, including the current-time storage placeholders defined in [Note Type Schemas](note-type-schemas.md), and how `datetime` instants are localized, as defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `CM-41` Collections whose authors work in a single zone SHOULD declare `timezone` explicitly.
- `CM-42` `validation_defaults` provides default severity levels for collection-wide validation reporting.
- `CM-43` Supported validation severities are `error`, `warn`, `info`, and `off`.
- `CM-44` `validation_defaults` MAY omit individual severity keys and MAY be an empty mapping.
- `CM-45` An omitted severity key takes its core default severity: `unknown_field` and `template_drift` default to `warn`, and every other severity key defined on this page defaults to `error`.
- `CM-46` The severity keys defined on this page are the complete set for this specification version; an undeclared key inside `validation_defaults` is evaluated under `unknown_field`.
- `CM-47` A note or artifact with any `error` violation is non-conforming.
- `CM-48` A note or artifact with only `warn` or `info` issues remains structurally usable.
- `CM-49` Validators SHOULD report the artifact path, note type when applicable, rule name, and failing field, relationship, or heading.
- `CM-50` `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `CM-51` `missing_required_field` applies when a field declared in `frontmatter` with `optional: false` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md), or when a matching conditional constraint defined in [Note Type Schemas](note-type-schemas.md) requires a concrete value the note does not hold.
- `CM-52` `missing_declared_field` applies when a field declared in `frontmatter` is absent from stored note frontmatter.
- `CM-53` `unknown_field` applies when an undeclared field appears in the frontmatter of `typedmark.md` or any other governed artifact, or in managed note frontmatter; a note-type schema MAY override its severity for managed notes of that type, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-54` `invalid_field_value` applies when a field value violates a declared field-level value constraint such as `format`, `regex`, `not_empty`, `not_blank`, `min`, `max`, `allowed_values`, or `targets`, or a matching conditional `require_null` constraint defined in [Note Type Schemas](note-type-schemas.md). `format: note_link` syntax and resolution failures still use `invalid_note_link`.
- `CM-55` `duplicate_unique_value` applies when a field declared with `unique: true` repeats a non-null stored value in more than one managed note of the same note type, when a field declared with `unique: collection` repeats a non-null stored value across any managed notes, or when the core-defined `id` field repeats a value across managed notes.
- `CM-56` `invalid_note_count` applies when the number of managed notes of a note type violates that type's effective `count` constraint, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-57` `invalid_property_set` applies when a property set file, a `typedmark.md` `default_property_sets` reference, or a note-type schema `property_sets` or `exclude_property_sets` reference violates the property-set rules defined in this page.
- `CM-58` `invalid_note_type_mapping` applies when a note-type mapping rule in `typedmark.md` violates the mapping-rule contract defined in this page.
- `CM-59` `invalid_composition` applies when the `composition` block in `typedmark.md` violates the composition-provenance rules defined in this page, including a source that does not resolve to exactly one system at the declared version.
- `CM-60` `unsupported_specification_version` applies when a governed artifact declares a `specification_version` whose major version the tool does not implement; the tool MUST report it and MUST NOT assert conformance for that artifact, as defined in [Foundations](foundations.md).
- `CM-61` `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Note Links](note-links.md).
- `CM-62` `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-63` `invalid_relationship_instance` applies when resolved typed relationship instances violate the declared relationship cardinality constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-64` `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-65` `template_drift` applies when a validator chooses to compare a managed note to its canonical template and detects material divergence that is not itself a core conformance failure.

### Note-Type Mappings

`typedmark.md` MAY define `note_type_mappings` to control how collection notes are associated with note types.

Example:

```yaml
note_type_mappings:
  - kind: frontmatter_field
    field: note_type
  - kind: tag
    tag: meeting
    note_type: meeting
  - kind: folder
    folder: "Sources/"
    note_type: source
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

- `CM-66` `note_type_mappings` MAY be omitted.
- `CM-67` If `note_type_mappings` is omitted, the collection uses an implicit ordered mapping list containing exactly one rule equivalent to `kind: frontmatter_field` and `field: note_type`.
- `CM-68` If present, `note_type_mappings` MUST be a non-empty ordered list.
- `CM-69` Each mapping rule MUST be a YAML mapping and MUST declare `kind`.
- `CM-70` Supported `kind` values are `frontmatter_field`, `tag`, `folder`, and `fixed`.
- `CM-71` Mapping rules are evaluated in list order.
- `CM-72` A collection note MAY match no mapping rule and remain untyped.
- `CM-73` The winning mapping rule is the first rule in `note_type_mappings` whose own match conditions succeed for a note.
- `CM-74` After a mapping rule wins for a note, later mapping rules MUST NOT be used as fallback for that note.
- `CM-75` Note-type mapping is evaluated before schema selection, property-set composition, note-type inheritance, field defaulting, field materialization, relationship derivation, or template comparison.
- `CM-76` Mapping rules MAY inspect only the collection-relative note path and the stored frontmatter physically present in the note file.
- `CM-77` Mapping rules MUST NOT depend on the effective note-type schema, generated field values, or template content.
- `CM-78` `kind: frontmatter_field` MUST physically contain `field`.
- `CM-79` In this specification version, the only supported `field` value is `note_type`.
- `CM-80` A `kind: frontmatter_field` rule matches when the named field is physically present in stored frontmatter.
- `CM-81` The candidate note type produced by a `kind: frontmatter_field` rule is the stored value of that field.
- `CM-82` `kind: fixed` MUST physically contain `note_type` and `when`.
- `CM-83` `note_type` in a `kind: fixed` rule MUST be a non-empty slug and MUST resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`.
- `CM-84` A `kind: fixed` rule matches when every condition in its `when` block matches.
- `CM-85` The candidate note type produced by a `kind: fixed` rule is the rule's `note_type`.
- `CM-86` `kind: tag` MUST physically contain `tag` and `note_type`.
- `CM-87` `tag` in a `kind: tag` rule MUST be a valid tags entry under the grammar defined in [Field Definition Reference](field-definition-reference.md).
- `CM-88` A `kind: tag` rule matches when the note's stored top-level `tags` field is a YAML sequence containing an entry equal to the rule's `tag` or a descendant of it under the tag hierarchy rules.
- `CM-89` `kind: folder` MUST physically contain `folder` and `note_type`.
- `CM-90` `folder` in a `kind: folder` rule MUST be a non-empty collection-relative directory string and MUST end with `/`.
- `CM-91` A `kind: folder` rule matches when the collection-relative note path is under `folder`, with the same semantics as `when.path.under`.
- `CM-92` `note_type` in `kind: tag` and `kind: folder` rules follows the same rules as `note_type` in a `kind: fixed` rule, and the candidate note type each produces is the rule's `note_type`.
- `CM-93` `kind: tag` and `kind: folder` carry no implicit precedence over other kinds; list order alone decides the winning rule.
- `CM-94` `when` MUST be a mapping.
- `CM-95` `when` MUST contain at least one of `path` or `frontmatter`.
- `CM-96` Multiple conditions within one `when` block are combined with logical AND.
- `CM-97` `when.path` MAY declare `equals`, `under`, and `regex`.
- `CM-98` Path conditions are evaluated against the collection-relative note path including the `.md` extension and normalized to use forward slashes.
- `CM-99` `when.path.equals` MUST be a non-empty collection-relative path string.
- `CM-100` `when.path.under` MUST be a non-empty collection-relative directory string and MUST end with `/`.
- `CM-101` `when.path.regex` MUST be a non-empty string and is matched against the entire normalized collection-relative note path.
- `CM-102` Regex evaluation in `note_type_mappings` uses the ECMA-262 regular expression dialect defined in [Foundations](foundations.md).
- `CM-103` `when.frontmatter` is a mapping from top-level stored frontmatter field name to one predicate mapping.
- `CM-104` Nested frontmatter field paths are not supported in `note_type_mappings` in this specification version.
- `CM-105` If a note has no YAML frontmatter, all `when.frontmatter` predicates fail.
- `CM-106` Each frontmatter predicate MUST be a mapping.
- `CM-107` Each frontmatter predicate MUST declare at least one of `exists`, `equals`, `regex`, `contains_any`, or `contains_all`.
- `CM-108` If a frontmatter predicate declares more than one operator, all declared operators MUST match.
- `CM-109` `exists` MUST be a boolean.
- `CM-110` `equals` compares the stored field value using exact YAML-value equality.
- `CM-111` `regex` MUST be a non-empty string and is valid only when the stored field value is a string.
- `CM-112` `contains_any` and `contains_all` MUST be non-empty lists of non-empty strings.
- `CM-113` `contains_any` and `contains_all` are valid only when the stored field value is a YAML sequence of strings.
- `CM-114` If the winning mapping rule yields a candidate note type that does not resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`, the note is untyped.
- `CM-115` Because `note_type_mappings` is ordered, more specific rules SHOULD appear before more general rules.

### Vocabularies

`typedmark.md` MAY define `vocabularies` to declare named, reusable value sets that field definitions reference through `allowed_values_from`, instead of repeating the same `allowed_values` list across note types.

Example:

```yaml
vocabularies:
  workflow-state:
    description: Editorial lifecycle states.
    values: [draft, in_review, published]
  topic-tags:
    description: Controlled tag tree for topics.
    values: [area, area/work, reference]
```

Rules:

- `CM-116` `vocabularies` MAY be omitted.
- `CM-117` If present, `vocabularies` MUST be a mapping from vocabulary name to vocabulary definition.
- `CM-118` A vocabulary name MUST be a non-empty slug.
- `CM-119` Each vocabulary definition MUST physically contain `values` and MAY contain `description`; if present, `description` MUST be a non-empty string.
- `CM-120` `values` MUST be a non-empty list of unique non-empty strings.
- `CM-121` A vocabulary referenced from a `tags` field MUST contain only values that satisfy the tags value grammar defined in [Field Definition Reference](field-definition-reference.md).
- `CM-122` Field-level vocabulary references through `allowed_values_from` are defined in [Field Definition Reference](field-definition-reference.md).

### Composition Provenance

`typedmark.md` MAY define `composition` to record the systems this collection's structure was composed from. The lineage is both provenance and the reproducible recipe: re-composing the same sources at the same versions reconstructs the same collection. It is also the input the update flow uses to migrate a collection to newer system versions. System composition, its deterministic merge semantics, and the migration flow are defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).

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

- `CM-123` `composition` MAY be omitted. A collection authored directly, without composing any system, omits it.
- `CM-124` If present, `composition` MUST physically contain `sources`.
- `CM-125` `composition.sources` MUST be a non-empty ordered list.
- `CM-126` The order of `composition.sources` is significant and defines the composition merge order defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `CM-127` Each source MUST declare `name` and `version`.
- `CM-128` A source `name` MUST follow the `name` rules defined above for a collection identity, including the scope and length rules.
- `CM-129` A source `version` MUST be a Semantic Versioning 2.0.0 string.
- `CM-130` A `name` MUST appear at most once in `composition.sources`.
- `CM-131` A source `name` MUST NOT equal the composing collection's own `name`.
- `CM-132` Each source MUST resolve to exactly one system whose `name` and `version` match; a source that does not resolve is an `invalid_composition` failure.
- `CM-133` A composed collection MUST remain self-contained: its materialized schemas, property sets, and templates MUST be physically present under `metadata_directory`, and conformance MUST NOT require re-resolving `composition.sources`.
- `CM-134` `composition` records provenance only; it does not relocate, replace, or override any governed artifact physically present under `metadata_directory`.

### Default Property Sets

`typedmark.md` MAY define `default_property_sets` to name the property sets that apply to every note type by default. This is how a collection declares shared `frontmatter`, `relationships`, and `headings` without repeating them in each schema.

Example:

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
- `CM-140` If `default_property_sets` is omitted, no property set applies by default and a note type composes only the property sets it names in `property_sets`.

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

- `CM-161` `property_sets`, `exclude_property_sets`, and `frontmatter_remove` MAY each be omitted.
- `CM-162` Only concrete note types MAY declare `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.
- `CM-163` If present, `property_sets` MUST be a non-empty list of unique property set identifiers.
- `CM-164` If present, `exclude_property_sets` MUST be a non-empty list of unique property set identifiers.
- `CM-165` Each identifier in `property_sets` and `exclude_property_sets` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- `CM-166` Each identifier in `exclude_property_sets` MUST be named in `default_property_sets`.
- `CM-167` A property set MUST NOT appear in both `default_property_sets` (after exclusions) and `property_sets` for the same note type.
- `CM-168` The order of identifiers in `property_sets` is significant for the effective merge order.
- `CM-169` A concrete note type's applied property sets are the default property sets in `default_property_sets` order, minus those named in `exclude_property_sets`, followed by the property sets named in `property_sets`.
- `CM-170` If present, `frontmatter_remove` MUST be a non-empty list of unique frontmatter field names.
- `CM-171` Each field named in `frontmatter_remove` MUST resolve to a field contributed by an applied default property set or by an abstract ancestor.
- `CM-172` If no frontmatter is contributed by default property sets or abstract ancestors, `frontmatter_remove` MUST be omitted.

Effective note-type schema merge rules:

- `CM-173` These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- `CM-174` The note type's own inline `frontmatter`, `relationships`, and `headings` blocks are the terminal layer of this same composition; they are applied last and take precedence over every applied property set.
- `CM-175` Frontmatter merges by field name within `frontmatter`.
- `CM-176` Default property set frontmatter, in `default_property_sets` order and after applying `exclude_property_sets`, is applied first.
- `CM-177` Frontmatter declared by abstract ancestors, if any, is applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-178` If a later abstract ancestor defines a field already defined by a default property set or by a more distant abstract ancestor, the later abstract ancestor definition replaces the earlier inherited definition completely and determines whether the field is effectively optional.
- `CM-179` If `frontmatter_remove` is present, the named fields are removed from accumulated inherited frontmatter after default-property-set and abstract-ancestor frontmatter has been applied and before any opt-in property set or local concrete note-type frontmatter is applied.
- `CM-180` Opt-in property sets named in `property_sets` are then applied in declared order.
- `CM-181` If two applied property sets define the same field name, the later property set in the applied order replaces the earlier definition completely.
- `CM-182` If a property set defines a field already defined by a default property set or abstract-ancestor frontmatter, the property set definition replaces the inherited definition completely and determines whether the field is effectively optional.
- `CM-183` If a local concrete note-type schema defines a field already contributed by inherited frontmatter or property sets, the local definition replaces the earlier definition completely and determines whether the field is effectively optional.
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
- `CM-197` Property-set composition and abstract note-type inheritance operate within the effective `frontmatter`, `relationships`, and `headings` blocks of the selected concrete note type; the effective `frontmatter` block remains mandatory, while absent `relationships` and `headings` blocks take the empty defaults defined in [Note Type Schemas](note-type-schemas.md).
- `CM-198` A concrete note-type schema MAY omit individual property-set-provided or inherited field definitions, relationship target definitions, or heading settings that remain unchanged.
- `CM-199` Property-set composition affects only how the effective note-type schema is computed; it does not create a second schema file or a separate persisted artifact.
