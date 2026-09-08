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

Expanded example:

Core value shapes:

| Keys | Shape |
| --- | --- |
| `name` | At most 214 characters matching `^(?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*$` |
| `description`, `label` | Non-empty text |
| `keywords` | Unique non-empty text entries |
| `metadata_directory` | One non-empty directory name, not `.` or `..`, without separators |
| `exclude_paths` | List of glob strings, including an empty list |
| `timezone` | IANA timezone identifier |
| `validation_defaults` | Mapping of defined category names to error/warn/info/off |
| `note_type_mappings` | Non-empty ordered list of mapping rules |

Rules:

- `CM-551` Present Core configuration properties MUST satisfy their shape and default tables.
- `CM-552` Other than the required identity/version keys, a Core configuration property MAY be omitted where its table defines omission.

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
- `CM-4` `name` is the collection's single identity. It identifies the collection's structural model and, when the collection is a publishable system, is the distribution identity a marketplace and `composition.sources` resolve against.
- `CM-15` `label` is the human-facing display name of the collection; applications SHOULD display `label` when present and fall back to `name` otherwise.
- `CM-24` Validators and agents MUST derive governed artifact locations from `metadata_directory`.
- `CM-26` Each `exclude_paths` entry is a glob pattern matched against the entire normalized collection-relative path, using forward slashes.
- `CM-27` In `exclude_paths` globs, `*` matches any number of characters within one path segment, `?` matches exactly one character within a segment, and `**` matches any number of path segments including none.
- `CM-28` `exclude_paths` does not support negation patterns in this specification version.
- `CM-29` A note matched by `exclude_paths` is not a collection note: it is not evaluated for note-type mapping and is not a candidate for note-link resolution.
- `CM-30` An `exclude_paths` entry that would exclude `typedmark.md` or content under the metadata directory has no effect on those paths.
- `CM-32` If present, `assets_directory` MUST be a non-empty collection-relative directory path using forward slashes, MUST NOT start or end with `/`, MUST NOT contain `.` or `..` segments, and MUST NOT equal the `metadata_directory` value.
- `CM-33` `assets_directory` names the folder where collection assets SHOULD live; tools that add assets to the collection SHOULD place them under it.
- `CM-34` `assets_directory` does not change asset-link resolution; an asset resolves wherever it lives.
- `CM-35` Tools MAY report assets stored outside `assets_directory`, and MAY report orphan assets that no collection note references; automated asset cleanup is not defined in this specification version.
- `CM-40` The collection timezone governs floating temporal interpretation and instant localization where their authoritative contracts require it.
- `CM-41` Collections whose authors work in a single zone SHOULD declare `timezone` explicitly.
- `CM-43` Supported validation severities are `error`, `warn`, `info`, and `off`.
- `CM-45` An omitted severity key takes its core default severity: `unknown_field` and `template_drift` default to `warn`, and every other severity key defined on this page defaults to `error`.
- `CM-46` Severity keys are the diagnostic categories defined by the applicable Core and optional contracts; an undeclared key is evaluated under `unknown_field`.
- `CM-47` A note or artifact with any `error` violation is non-conforming.
- `CM-48` A note or artifact with only `warn` or `info` issues remains structurally usable.
- `CM-50` `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `CM-51` `missing_required_field` applies to an explicit null violating a non-null requirement, or an unsatisfied conditional requirement.
- `CM-52` `missing_declared_field` applies to an absent declared field with no conforming effective value for its non-null requirement.
- `CM-53` `unknown_field` applies to undeclared structural keys in governed artifacts and undeclared managed-note fields, excluding the inert metadata permitted by [Extensions and Capabilities](extensions.md#inert-vendor-metadata).
- `CM-534` An undeclared structural key in a governed artifact MUST have severity `error` when the tool implements the applicable core and extension contracts, regardless of the configured `unknown_field` severity.
- `CM-535` `invalid_extension_declaration` applies when extension declarations, required dependencies, or declaration requirements violate [Extensions and Capabilities](extensions.md).
- `CM-536` `unsupported_extension` applies when a required exact extension version cannot be interpreted by the tool.
- `CM-537` `invalid_collection_configuration` applies when `typedmark.md` cannot be parsed as a collection configuration or violates a collection-configuration requirement not covered by a more specific category.
- `CM-538` `invalid_note_type_schema` applies when a note-type schema cannot be parsed, violates its artifact contract, or yields an invalid effective schema.
- `CM-539` `invalid_template` applies when a template required by the template contract is missing or an existing template violates that contract.
- `CM-542` `extension_violation` applies to a violation of a recognized extension rule for which no more specific standard diagnostic category applies.
- `CM-544` `invalid_note_frontmatter` applies when a recognized note frontmatter block needed for note-type association or managed-note validation cannot be parsed as a valid frontmatter mapping.
- `CM-54` `invalid_field_value` applies when a field value violates a declared field-level value constraint such as `format`, `regex`, `not_empty`, `not_blank`, `min`, `max`, `allowed_values`, or `targets`, when a matching conditional `require_null` constraint defined in [Note Type Schemas](note-type-schemas.md) is violated, or when a managed note lacks an effective mandatory tag. `format: note_link` syntax and resolution failures still use `invalid_note_link`.
- `CM-55` `duplicate_unique_value` applies when effective values violate a field's declared uniqueness scope or Core identifier uniqueness.
- `CM-56` `invalid_note_count` applies when the number of managed notes of a note type violates that type's effective `count` constraint, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-58` `invalid_note_type_mapping` applies when a note-type mapping rule violates the mapping-rule contract or when a winning rule produces a candidate note type that does not resolve to exactly one concrete schema.
- `CM-60` `unsupported_specification_version` applies when a governed artifact declares a `specification_version` whose compatibility line the tool does not implement; version-selection behavior is defined in [Foundations](foundations.md#specification-versioning).
- `CM-61` `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Note Links](note-links.md).
- `CM-62` `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-63` `invalid_relationship_instance` applies when resolved typed relationship instances violate the declared relationship cardinality constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-64` `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-200` The effective `metadata_directory`, `exclude_paths`, `validation_defaults`, and `automation_defaults` values participate in conformance exactly as if their default values had been physically written in `typedmark.md`.

### Collection Boundaries

Each collection owns its own directory subtree up to nested collection roots.
For example, scanning `work/typedmark.md` does not absorb notes below
`work/archive/typedmark.md`, even if the child's configuration is malformed.
The child is evaluated separately when explicitly selected.

Rules:

- `CM-545` A note's collection root MUST be its nearest ancestor directory containing `typedmark.md`.
- `CM-546` A collection scan MUST prune a nested root when its `typedmark.md` is present, independently of whether that configuration is valid.
- `CM-547` Collection discovery MUST NOT follow symbolic links or directory junctions.
- `CM-548` Collection notes are files with the exact lowercase `.md` extension outside the metadata subtree, configuration file, excluded paths, and nested roots.
- `CM-549` Hidden entries MUST follow the same discovery rules as other entries rather than being implicitly excluded.
- `CM-550` Logical paths MUST be compared after NFC normalization with case preserved, independently of host filesystem lookup behavior.

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
| `tag` | `kind`, `tag`, `note_type` | top-level stored `tags` | Optional Core mapping |
| `folder` | `kind`, `folder`, `note_type` | collection-relative path | Optional Core mapping |
| `fixed` | `kind`, `note_type`, `when` | path and/or stored frontmatter predicates | Optional Core mapping |

Each entry is a mapping using one listed kind. `field` is the literal
`note_type`; `tag` is a valid tag; `folder` is a non-empty collection-relative
directory ending in `/`; a declared target `note_type` is a concrete type slug.

Rules:

- `CM-553` A note-type mapping declaration MUST satisfy the kind table and value shapes above.

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

- `CM-67` If `note_type_mappings` is omitted, the collection uses an implicit ordered mapping list containing exactly one rule equivalent to `kind: frontmatter_field` and `field: note_type`.
- `CM-72` A collection note MAY match no mapping rule and remain untyped.
- `CM-73` The winning mapping rule is the first rule in `note_type_mappings` whose own match conditions succeed for a note.
- `CM-74` After a mapping rule wins for a note, later mapping rules MUST NOT be used as fallback for that note.
- `CM-75` Note-type mapping is evaluated before schema selection, property-set composition, note-type inheritance, field defaulting, field materialization, relationship derivation, or template comparison.
- `CM-76` Mapping rules MAY inspect only the collection-relative note path and the stored frontmatter physically present in the note file.
- `CM-77` Mapping rules MUST NOT depend on the effective note-type schema, generated field values, computed field values, or template content.
- `CM-80` A `kind: frontmatter_field` rule matches when the named field is physically present in stored frontmatter.
- `CM-81` The candidate note type produced by a `kind: frontmatter_field` rule is the stored value of that field.
- `CM-83` `note_type` in a `kind: fixed` rule MUST be a non-empty slug and MUST resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`.
- `CM-84` A `kind: fixed` rule matches when every condition in its `when` block matches.
- `CM-85` The candidate note type produced by a `kind: fixed` rule is the rule's `note_type`.
- `CM-88` A `kind: tag` rule matches when the note's stored top-level `tags` field is a YAML sequence containing an entry equal to the rule's `tag` or a descendant of it under the tag hierarchy rules.
- `CM-91` A `kind: folder` rule matches when the collection-relative note path is under `folder`, with the same semantics as `when.path.under`.
- `CM-92` `note_type` in `kind: tag` and `kind: folder` rules follows the same rules as `note_type` in a `kind: fixed` rule, and the candidate note type each produces is the rule's `note_type`.
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

Folder-scoped schema overlays are removed in `0.1.0`. Migration uses explicitly
authored concrete types and mappings; no automatic equivalence is assumed.

### Mandatory Tags

Mandatory tags constrain the effective Core `tags` field without requiring a
duplicate declaration. The policy combines collection and note-type entries.
It does not participate in association, which still uses stored input.

<!-- typedmark-example: fragment: Collection-level mandatory tags. -->
```yaml
mandatory_tags: [managed]
```

For a `project` note type whose effective `mandatory_tags` is `[type/project]`, a managed note under `Projects/` has the effective sequence `[managed, knowledge/base, project, type/project]`. The repeated `managed` entry keeps its first position.

Rules:

- `CM-225` `mandatory_tags` in `typedmark.md` MAY be omitted, and when omitted it is equivalent to an empty list.
- `CM-226` If present, `mandatory_tags` in `typedmark.md` MUST be a non-empty ordered list of unique tag strings that satisfy the stored tags-entry grammar in [Field Definition Reference](field-definition-reference.md).
- `CM-228` The collection-level mandatory tags for a managed note are the entries in `typedmark.md` `mandatory_tags`, in declared order.
- `CM-230` The note-type-level mandatory tags for a managed note are the effective `mandatory_tags` of its resolved concrete schema, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-231` Effective mandatory tags are the collection sequence followed by the effective note-type sequence, deduplicated while retaining first occurrence.
- `CM-232` Mandatory-tag equality and duplicate removal MUST use the exact NFC-normalized, case-sensitive string comparison defined in [Foundations](foundations.md).
- `CM-233` A descendant tag MUST NOT satisfy a mandatory ancestor tag unless that exact ancestor is present in the effective tags value.
- `CM-234` Mandatory-tag declarations apply only to managed notes and MUST NOT make an otherwise untyped note managed.
- `CM-235` A mandatory-tag policy MUST imply the Core `tags` field contract without requiring a duplicate field declaration.
- `CM-237` Every effective mandatory tag MUST satisfy the individual-entry constraints of the managed note's effective `tags` field, including `allowed_values_from` when declared.
- `CM-238` The number of distinct effective mandatory tags MUST NOT exceed the effective `tags` field's `max` constraint when one is declared.
- `CM-239` Mandatory tags MUST constrain effective tag values without overwriting author-provided values or bypassing compatible field constraints.

### Automation Defaults

See [Automation Defaults](automation-artifacts.md) for the authoritative contract.

### Automation Rules

See [Automation Rules](automation-artifacts.md#automation-rules).

### Property Set Definitions

See [Property Set Definitions](property-sets.md#property-set-definitions).

### Composing Property Sets

See [Composing Property Sets](property-sets.md#composing-property-sets).
