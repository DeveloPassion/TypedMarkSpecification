---
title: Collection Model
parent: TypedMark
nav_order: 4
audience: essentials
---

# Collection Model

Audience: collection authors.

Authoritative for:

- the structural fields of `typedmark.md`: identity, metadata directory, excluded paths, assets directory, timezone, validation defaults, automation defaults, mandatory tags, folder scopes, and vocabularies
- note-type mappings, shared path matching, and composition provenance

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): the optional system fields, composition, and change history
- [Note Type Schemas](note-type-schemas.md): the effective note-type schema
- [Property Sets](property-sets.md): reusable definitions, collection defaults, and composition merge rules
- [Queries](queries.md): portable query descriptors and evaluation
- [Datasets and Views](datasets-and-views.md): reusable results, presentation layouts, and Obsidian Bases interoperability
- [Automation Artifacts](automation-artifacts.md): governed rules and their trigger/action vocabulary
- [Extensions and Capabilities](extensions.md): required extension declarations and inert vendor metadata
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): relationship resolution and query-backed content expansion

Core Profile authors usually need only `specification_version`, `name`, and `description` in `typedmark.md`; deterministic defaults provide the metadata directory, ignored Git content, validation severities, automation propagation limit, and frontmatter-based note-type mapping. Mandatory tags, automation rules, datasets, saved views, property sets, folder scopes, vocabularies, composition provenance, and advanced mappings are optional layers for larger collections.

## Collection Model Specification

`typedmark.md` defines collection-model-wide rules, including the metadata directory, the ordered note-type mappings, and the governed TypedMark artifacts.

Shape at a glance:

| Key | Physical requirement | Effective default | Purpose |
| --- | --- | --- | --- |
| `specification_version` | Required | none | Selects the TypedMark specification version |
| `extensions` | Optional | `{}` | Required contracts, defined in [Extensions and Capabilities](extensions.md) |
| `name` | Required | none | Collection identity |
| `description` | Required | none | Human-facing summary |
| `label` | Optional | application fallback to `name` | Display name |
| `keywords` | Optional | none | Discovery metadata |
| `metadata_directory` | Optional | `.typedmark` | Governed artifact subtree |
| `exclude_paths` | Optional | `[.git/**]` | Paths ignored as collection content |
| `assets_directory` | Optional | none | Preferred asset folder |
| `timezone` | Optional | `UTC` | Date/time localization |
| `validation_defaults` | Optional | `{}` plus core severity defaults | Validation severity overrides |
| `automation_defaults` | Optional | `{max_propagation_waves: 100}` | Automation propagation safety limit |
| `note_type_mappings` | Optional | frontmatter `note_type` mapping | Note-type association |
| `vocabularies` | Optional | none | Reusable value sets |
| `composition` | Optional | none | Advanced provenance and update lineage |
| `default_property_sets` | Optional | none | Shared structure applied to every concrete note type |
| `mandatory_tags` | Optional | none | Tags required on every managed note |
| `folder_scopes` | Optional | none | Structure and tags selected by managed-note path |

Expanded example:

<!-- typedmark-example: artifact=typedmark -->
```yaml
specification_version: 0.1.0
name: example-knowledge-base
label: Example Knowledge Base
description: Personal knowledge base.
mandatory_tags:
  - managed
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
  invalid_automation: error
  invalid_dataset: error
  invalid_view: error
  invalid_note_type_mapping: error
  invalid_composition: error
  unsupported_specification_version: error
  invalid_extension_declaration: error
  unsupported_extension: error
  invalid_note_link: error
  invalid_relationship_definition: error
  invalid_relationship_instance: error
  invalid_heading: error
  invalid_template_region: error
  template_drift: warn
  invalid_expansion: error
  expansion_drift: error
automation_defaults:
  max_propagation_waves: 100
```

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.md` `metadata_directory`.

Rules:

- `CM-1` `typedmark.md` MUST exist at the root of every conforming managed collection.
- `CM-2` `typedmark.md` MUST physically contain `specification_version`, `name`, and `description`.
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
- `CM-20` `metadata_directory` MAY be omitted, and when omitted its effective value is `.typedmark`.
- `CM-21` `metadata_directory` MUST name a single directory at the collection root.
- `CM-22` `metadata_directory` MUST NOT be `.` or `..` and MUST NOT contain path separators.
- `CM-23` `metadata_directory` identifies the governed-artifact subtree for the collection, including the change history, automation rules, datasets, saved views, property sets, note-type schemas, and templates.
- `CM-24` Validators and agents MUST derive governed artifact locations from `metadata_directory`.
- `CM-25` `exclude_paths` MAY be omitted, and when omitted its effective value is a list containing `.git/**`.
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
- `CM-42` `validation_defaults` MAY be omitted, and when omitted it is equivalent to an empty mapping.
- `CM-43` Supported validation severities are `error`, `warn`, `info`, and `off`.
- `CM-44` `validation_defaults` MAY omit individual severity keys and MAY be an empty mapping.
- `CM-45` An omitted severity key takes its core default severity: `unknown_field` and `template_drift` default to `warn`, and every other severity key defined on this page defaults to `error`.
- `CM-46` The severity keys defined on this page are the complete set for this specification version; an undeclared key inside `validation_defaults` is evaluated under `unknown_field`.
- `CM-47` A note or artifact with any `error` violation is non-conforming.
- `CM-48` A note or artifact with only `warn` or `info` issues remains structurally usable.
- `CM-49` Validators SHOULD report the artifact path, note type when applicable, rule identifier, and applicable field, relationship, heading, expansion, view, or template-region context.
- `CM-50` `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `CM-51` `missing_required_field` applies when a field declared in `frontmatter` with `optional: false` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md), or when a matching conditional constraint defined in [Note Type Schemas](note-type-schemas.md) requires a concrete value the note does not hold.
- `CM-52` `missing_declared_field` applies when a field declared in `frontmatter` is absent from stored note frontmatter.
- `CM-53` `unknown_field` applies to undeclared structural keys in governed artifacts and undeclared managed-note fields, excluding the inert metadata permitted by [Extensions and Capabilities](extensions.md#inert-vendor-metadata).
- `CM-534` An undeclared structural key in a governed artifact MUST have severity `error` when the tool implements the applicable core and extension contracts, regardless of the configured `unknown_field` severity.
- `CM-535` `invalid_extension_declaration` applies when extension declarations, required dependencies, or declaration requirements violate [Extensions and Capabilities](extensions.md).
- `CM-536` `unsupported_extension` applies when a required exact extension version cannot be interpreted by the tool.
- `CM-54` `invalid_field_value` applies when a field value violates a declared field-level value constraint such as `format`, `regex`, `not_empty`, `not_blank`, `min`, `max`, `allowed_values`, or `targets`, when a matching conditional `require_null` constraint defined in [Note Type Schemas](note-type-schemas.md) is violated, or when a managed note lacks an effective mandatory tag. `format: note_link` syntax and resolution failures still use `invalid_note_link`.
- `CM-55` `duplicate_unique_value` applies when a field declared with `unique: true` repeats a non-null stored value in more than one managed note of the same note type, when a field declared with `unique: collection` repeats a non-null stored value across any managed notes, or when the core-defined `id` field repeats a value across managed notes.
- `CM-56` `invalid_note_count` applies when the number of managed notes of a note type violates that type's effective `count` constraint, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-57` `invalid_property_set` applies when a property set file, a `typedmark.md` `default_property_sets` or `folder_scopes` declaration, or a note-type schema `property_sets` or `exclude_property_sets` reference violates the rules in [Property Sets](property-sets.md).
- `CM-476` `invalid_dataset` applies when a dataset artifact violates the shape, reference-resolution, query, row-identity, mapped-column, or evaluation rules in [Datasets and Views](datasets-and-views.md).
- `CM-407` `invalid_view` applies when a saved-view artifact violates the shape, reference-resolution, query, presentation, or layout rules in [Datasets and Views](datasets-and-views.md).
- `CM-58` `invalid_note_type_mapping` applies when a note-type mapping rule violates the mapping-rule contract or when a winning rule produces a candidate note type that does not resolve to exactly one concrete schema.
- `CM-59` `invalid_composition` applies when composition provenance or a composition operation violates its applicable contract in this page, [Systems, Composition, and Evolution](systems-composition-evolution.md), or the vendor-metadata preservation rules in [Extensions and Capabilities](extensions.md).
- `CM-60` `unsupported_specification_version` applies when a governed artifact declares a `specification_version` whose compatibility line the tool does not implement; version-selection behavior is defined in [Foundations](foundations.md#specification-versioning).
- `CM-61` `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Note Links](note-links.md).
- `CM-62` `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-63` `invalid_relationship_instance` applies when resolved typed relationship instances violate the declared relationship cardinality constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-64` `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-65` `template_drift` applies when an enrolled managed note has a template-region state of `template_added`, `template_changed`, `note_changed`, `both_changed`, `region_missing`, `template_removed`, or `template_removed_note_changed` under [Template Drift Tracking](template-tracking.md#template-drift-tracking).
- `CM-297` `invalid_expansion` applies when a content expansion violates the marker, descriptor, source, rendering, or materialization rules defined in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion).
- `CM-298` `expansion_drift` applies when a materialized `auto` or `manual` content expansion does not equal its current rendered source result.
- `CM-299` `invalid_template_region` applies when a template-region marker, descriptor, receipt, marker pairing, nesting boundary, or marker-to-receipt correspondence violates [Template Drift Tracking](template-tracking.md#template-drift-tracking).
- `CM-200` The effective `metadata_directory`, `exclude_paths`, `validation_defaults`, and `automation_defaults` values participate in conformance exactly as if their default values had been physically written in `typedmark.md`.

### Path Matching

Mappings, scopes, and queries share path comparisons without sharing a wire
shape. Each consumer supplies a normalized collection-relative note path,
including its `.md` extension. The `when.path.regex` carrier named below is
defined by note-type mappings; other consumers reuse its matching semantics.

| Candidate | Predicate | Match |
| --- | --- | --- |
| `Projects/Alpha.md` | `under: Projects/` | yes |
| `ProjectsArchive/Alpha.md` | `under: Projects/` | no |
| `Projects/Alpha.md` | `equals: projects/Alpha.md` | no |

Rules:

- `CM-406` Path `equals` matches exactly when the normalized candidate path equals `value` under `FND-38`.
- `CM-404` Path `under` matches exactly when its normalized, trailing-slash directory `value` is a prefix of the normalized candidate path after NFC normalization.
- `CM-101` `when.path.regex` MUST be a non-empty string and is matched against the entire normalized collection-relative note path.
- `CM-102` Regex evaluation in `note_type_mappings` uses the ECMA-262 regular expression dialect defined in [Foundations](foundations.md).

### Note-Type Mappings

`typedmark.md` can define `note_type_mappings` to control how collection notes are associated with note types. Path comparisons use [Path Matching](#path-matching).

Shape at a glance:

| Mapping kind | Required keys | Matches from | Core Profile use |
| --- | --- | --- | --- |
| omitted | none | stored `note_type` frontmatter | Default |
| `frontmatter_field` | `kind`, `field` | stored `note_type` frontmatter | Explicit default |
| `tag` | `kind`, `tag`, `note_type` | top-level stored `tags` | Advanced |
| `folder` | `kind`, `folder`, `note_type` | collection-relative path | Advanced |
| `fixed` | `kind`, `note_type`, `when` | path and/or stored frontmatter predicates | Advanced |

Example:

<!-- typedmark-example: fragment: Collection note-type mapping declarations. -->
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
- `CM-77` Mapping rules MUST NOT depend on the effective note-type schema, generated field values, computed field values, or template content.
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
- `CM-114` If the winning mapping rule yields a candidate note type that does not resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`, the note is untyped and a validator MUST report `invalid_note_type_mapping`.
- `CM-115` Because `note_type_mappings` is ordered, more specific rules SHOULD appear before more general rules.

### Portable Queries

See [Portable Queries](queries.md#portable-queries).

### Descriptor and Evaluation Surface

See [Descriptor and Evaluation Surface](queries.md#descriptor-and-evaluation-surface).

### Boolean, Path, and Field Predicates

See [Boolean, Path, and Field Predicates](queries.md#boolean-path-and-field-predicates).

### Relationship Predicates

See [Relationship Predicates](queries.md#relationship-predicates).

### Projection, Ordering, Grouping, and Limiting

See [Projection, Ordering, Grouping, and Limiting](queries.md#projection-ordering-grouping-and-limiting).

### Datasets

See [Datasets](datasets-and-views.md#datasets).

### Saved Views

See [Saved Views](datasets-and-views.md#saved-views).

### Obsidian Bases Interoperability

See [Obsidian Bases Interoperability](datasets-and-views.md#obsidian-bases-interoperability).

### Vocabularies

`typedmark.md` can define `vocabularies` as named, reusable value sets that field definitions reference through `allowed_values_from`, instead of repeating the same `allowed_values` list across note types.

Core Profile collections can skip vocabularies and use direct `allowed_values` until reuse becomes useful.

Example:

<!-- typedmark-example: fragment: Collection vocabulary declarations. -->
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

See [Composition Provenance](systems-composition-evolution.md) for the authoritative contract.

### Default Property Sets

See [Default Property Sets](property-sets.md#default-property-sets).

### Folder Scopes

Folder scopes select managed notes by their actual collection-relative paths and contribute reusable property sets, mandatory tags, or both. They do not choose a note type: note-type mapping wins first, then matching folder scopes refine the effective schema and mandatory-tag policy used for that managed note.

<!-- typedmark-example: fragment: Collection folder-scope declarations. -->
```yaml
folder_scopes:
  - path:
      under: Meetings/
    property_sets:
      - meeting-base
    mandatory_tags:
      - context/meeting
  - path:
      regex: "^Archive/[0-9]{4}/.*\\.md$"
    mandatory_tags:
      - state/archived
```

Rules:

- `CM-201` `folder_scopes` MAY be omitted.
- `CM-202` If present, `folder_scopes` MUST be a non-empty ordered list.
- `CM-203` Each folder-scope entry MUST physically contain `path` and at least one of `property_sets` or `mandatory_tags`.
- `CM-204` If present, a folder-scope `property_sets` value MUST be a non-empty ordered list of unique property set identifiers.
- `CM-205` Each property set identifier in `folder_scopes` MUST resolve to exactly one file under `<metadata_directory>/property-sets/`.
- `CM-206` A folder-scope `path` MUST declare exactly one of `equals`, `under`, or `regex`.
- `CM-207` Folder-scope path matching MUST use the managed note's normalized collection-relative path, including its `.md` extension and using forward slashes.
- `CM-208` `path.equals` MUST be a non-empty collection-relative path and matches only that exact path.
- `CM-209` `path.under` MUST be a non-empty collection-relative directory ending in `/` and matches the subtree defined in [Path Matching](#path-matching).
- `CM-210` `path.regex` MUST be a non-empty ECMA-262 regular expression matched against the entire normalized collection-relative note path.
- `CM-211` Folder scopes MUST be evaluated after note-type mapping and before the managed note's effective schema is computed.
- `CM-212` Folder scopes apply only to managed notes and MUST NOT make an otherwise untyped note managed.
- `CM-213` Matching folder scopes MUST contribute property sets in `folder_scopes` list order and then in each entry's `property_sets` order.
- `CM-214` A property set named in the selected concrete note type's `exclude_property_sets` MUST be removed from the matching folder-scope contributions for that note.
- `CM-215` If matching folder scopes contribute the same property set more than once, only its first folder-scope occurrence applies.
- `CM-216` A matching folder-scope occurrence of a non-excluded default property set MUST have no additional effect because that property set already applies in the earlier default layer.
- `CM-217` A matching folder-scope occurrence of a property set named in the selected concrete note type's `property_sets` MUST have no effect in the folder layer because that property set applies later in the explicit opt-in layer.
- `CM-218` Managed notes of the same concrete note type MAY have different effective `frontmatter`, `relationships`, `headings`, or mandatory-tag policies when they match different folder scopes.
- `CM-219` Folder-scope matching MUST depend only on the managed note's stored path and MUST NOT depend on frontmatter, generated values, computed values, or template content.
- `CM-220` A folder-scope entry MUST NOT declare an action other than `property_sets` or `mandatory_tags` in this specification version.
- `CM-224` Folder-scope paths MUST NOT use template or storage-pattern interpolation; dynamic folder families are expressed with `path.regex`.

### Mandatory Tags

Mandatory-tag declarations constrain the ordinary top-level managed-note field named `tags`. They do not create that field implicitly and they do not participate in note-type mapping. The ordered policy is assembled from collection, folder, and note-type scopes so tools can validate and materialize it deterministically.

<!-- typedmark-example: fragment: Collection and folder-scope mandatory tags. -->
```yaml
mandatory_tags:
  - managed
  - knowledge/base
folder_scopes:
  - path:
      under: Projects/
    mandatory_tags:
      - project
      - managed
```

For a `project` note type whose effective `mandatory_tags` is `[type/project]`, a managed note under `Projects/` has the effective sequence `[managed, knowledge/base, project, type/project]`. The repeated `managed` entry keeps its first position.

Rules:

- `CM-225` `mandatory_tags` in `typedmark.md` MAY be omitted, and when omitted it is equivalent to an empty list.
- `CM-226` If present, `mandatory_tags` in `typedmark.md` MUST be a non-empty ordered list of unique tag strings that satisfy the stored tags-entry grammar in [Field Definition Reference](field-definition-reference.md).
- `CM-227` If present, a folder-scope `mandatory_tags` value MUST be a non-empty ordered list of unique tag strings that satisfy the same stored tags-entry grammar.
- `CM-228` The collection-level mandatory tags for a managed note are the entries in `typedmark.md` `mandatory_tags`, in declared order.
- `CM-229` The folder-level mandatory tags for a managed note are contributed by every matching folder scope, in `folder_scopes` order and then in each scope's `mandatory_tags` order.
- `CM-230` The note-type-level mandatory tags for a managed note are the effective `mandatory_tags` of its resolved concrete schema, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-231` A managed note's effective mandatory tags are the collection-level sequence followed by the folder-level sequence followed by the note-type-level sequence, with duplicate strings removed and the first occurrence retained.
- `CM-232` Mandatory-tag equality and duplicate removal MUST use the exact NFC-normalized, case-sensitive string comparison defined in [Foundations](foundations.md).
- `CM-233` A descendant tag such as `project/alpha` MUST NOT satisfy a mandatory tag of `project` unless `project` itself is also stored.
- `CM-234` Mandatory-tag declarations apply only to managed notes and MUST NOT make an otherwise untyped note managed.
- `CM-235` When a managed note has at least one effective mandatory tag, its effective `frontmatter` MUST declare a top-level field named `tags` with `type: tags`.
- `CM-236` A `tags` field governed by a non-empty effective mandatory-tag policy MUST NOT declare `optional: true`.
- `CM-237` Every effective mandatory tag MUST satisfy the individual-entry constraints of the managed note's effective `tags` field, including `allowed_values_from` when declared.
- `CM-238` The number of distinct effective mandatory tags MUST NOT exceed the effective `tags` field's `max` constraint when one is declared.
- `CM-239` Mandatory-tag declarations constrain stored values and MUST NOT add, replace, or remove a field definition in the effective `frontmatter` block.

### Automation Defaults

See [Automation Defaults](automation-artifacts.md) for the authoritative contract.

### Automation Rules

See [Automation Rules](automation-artifacts.md#automation-rules).

### Property Set Definitions

See [Property Set Definitions](property-sets.md#property-set-definitions).

### Composing Property Sets

See [Composing Property Sets](property-sets.md#composing-property-sets).
