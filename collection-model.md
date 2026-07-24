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
- note-type mappings and composition provenance
- property sets, default property sets, and the block-merge rules of composition
- governed automation rule artifacts and their trigger/action vocabulary
- the portable query descriptor, evaluation surface, predicates, projection, ordering, grouping, and limiting

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): the optional system fields, composition, and change history
- [Note Type Schemas](note-type-schemas.md): the effective note-type schema the merge rules feed
- [Field Definition Reference](field-definition-reference.md): the semantics of the field definitions property sets contribute
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): relationship resolution and query-backed content expansion

Core Profile authors usually need only `specification_version`, `name`, and `description` in `typedmark.md`; deterministic defaults provide the metadata directory, ignored Git content, validation severities, automation propagation limit, and frontmatter-based note-type mapping. Mandatory tags, automation rules, property sets, folder scopes, vocabularies, composition provenance, and advanced mappings are optional layers for larger collections.

Property sets are the single composition mechanism for reusable `frontmatter`, `relationships`, and `headings`. A property set is a named bundle stored under `<metadata_directory>/property-sets/`. Collections apply them through collection-wide defaults, managed-note folder scopes, and property sets named by concrete note-type schemas.

A concrete note type's own `frontmatter`, `relationships`, and `headings` blocks are not a second kind of frontmatter source. They are the note type's inline, note-type-scoped contribution to the same composition, applied last as the terminal layer of the merge. Reusable fields live in named property sets; one-off, note-type-specific fields live inline. There is one composition mechanism, with the inline blocks as its highest-precedence layer.

Note-type inheritance through `extends` is a distinct axis defined in [Note Type Schemas](note-type-schemas.md); it carries `kind`, `storage`, `template`, and `guidance`, which property sets do not.

## Collection Model Specification

`typedmark.md` defines collection-model-wide rules, including the metadata directory, the ordered note-type mappings, and the governed TypedMark artifacts.

Shape at a glance:

| Key | Physical requirement | Effective default | Purpose |
| --- | --- | --- | --- |
| `specification_version` | Required | none | Selects the TypedMark specification version |
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

```yaml
specification_version: 0.0.1
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
  invalid_note_type_mapping: error
  invalid_composition: error
  unsupported_specification_version: error
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
- `CM-23` `metadata_directory` identifies the governed-artifact subtree for the collection, including the change history, automation rules, property sets, note-type schemas, and templates.
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
- `CM-49` Validators SHOULD report the artifact path, note type when applicable, rule identifier, and applicable field, relationship, heading, expansion, or template-region context.
- `CM-50` `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `CM-51` `missing_required_field` applies when a field declared in `frontmatter` with `optional: false` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md), or when a matching conditional constraint defined in [Note Type Schemas](note-type-schemas.md) requires a concrete value the note does not hold.
- `CM-52` `missing_declared_field` applies when a field declared in `frontmatter` is absent from stored note frontmatter.
- `CM-53` `unknown_field` applies when an undeclared field appears in the frontmatter of `typedmark.md` or any other governed artifact, or in managed note frontmatter; a note-type schema MAY override its severity for managed notes of that type, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-54` `invalid_field_value` applies when a field value violates a declared field-level value constraint such as `format`, `regex`, `not_empty`, `not_blank`, `min`, `max`, `allowed_values`, or `targets`, when a matching conditional `require_null` constraint defined in [Note Type Schemas](note-type-schemas.md) is violated, or when a managed note lacks an effective mandatory tag. `format: note_link` syntax and resolution failures still use `invalid_note_link`.
- `CM-55` `duplicate_unique_value` applies when a field declared with `unique: true` repeats a non-null stored value in more than one managed note of the same note type, when a field declared with `unique: collection` repeats a non-null stored value across any managed notes, or when the core-defined `id` field repeats a value across managed notes.
- `CM-56` `invalid_note_count` applies when the number of managed notes of a note type violates that type's effective `count` constraint, as defined in [Note Type Schemas](note-type-schemas.md).
- `CM-57` `invalid_property_set` applies when a property set file, a `typedmark.md` `default_property_sets` or `folder_scopes` declaration, or a note-type schema `property_sets` or `exclude_property_sets` reference violates the property-set rules defined on this page.
- `CM-58` `invalid_note_type_mapping` applies when a note-type mapping rule violates the mapping-rule contract or when a winning rule produces a candidate note type that does not resolve to exactly one concrete schema.
- `CM-59` `invalid_composition` applies when the `composition` block in `typedmark.md` violates the composition-provenance rules defined in this page, including a source that does not resolve to exactly one system at the declared version.
- `CM-60` `unsupported_specification_version` applies when a governed artifact declares a `specification_version` whose major version the tool does not implement; the tool MUST report it and MUST NOT assert conformance for that artifact, as defined in [Foundations](foundations.md).
- `CM-61` `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Note Links](note-links.md).
- `CM-62` `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-63` `invalid_relationship_instance` applies when resolved typed relationship instances violate the declared relationship cardinality constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-64` `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `CM-65` `template_drift` applies when an enrolled managed note has a template-region state of `template_added`, `template_changed`, `note_changed`, `both_changed`, `region_missing`, `template_removed`, or `template_removed_note_changed` under [Template Drift Tracking](relationships-headings-and-templates.md#template-drift-tracking).
- `CM-297` `invalid_expansion` applies when a content expansion violates the marker, descriptor, source, rendering, or materialization rules defined in [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md#content-expansion).
- `CM-298` `expansion_drift` applies when a materialized `auto` or `manual` content expansion does not equal its current rendered source result.
- `CM-299` `invalid_template_region` applies when a template-region marker, descriptor, receipt, marker pairing, nesting boundary, or marker-to-receipt correspondence violates [Template Drift Tracking](relationships-headings-and-templates.md#template-drift-tracking).
- `CM-200` The effective `metadata_directory`, `exclude_paths`, `validation_defaults`, and `automation_defaults` values participate in conformance exactly as if their default values had been physically written in `typedmark.md`.

### Note-Type Mappings

`typedmark.md` can define `note_type_mappings` to control how collection notes are associated with note types.

Shape at a glance:

| Mapping kind | Required keys | Matches from | Core Profile use |
| --- | --- | --- | --- |
| omitted | none | stored `note_type` frontmatter | Default |
| `frontmatter_field` | `kind`, `field` | stored `note_type` frontmatter | Explicit default |
| `tag` | `kind`, `tag`, `note_type` | top-level stored `tags` | Advanced |
| `folder` | `kind`, `folder`, `note_type` | collection-relative path | Advanced |
| `fixed` | `kind`, `note_type`, `when` | path and/or stored frontmatter predicates | Advanced |

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
- `CM-114` If the winning mapping rule yields a candidate note type that does not resolve to exactly one concrete schema file under `<metadata_directory>/schemas/`, the note is untyped and a validator MUST report `invalid_note_type_mapping`.
- `CM-115` Because `note_type_mappings` is ordered, more specific rules SHOULD appear before more general rules.

### Portable Queries

A portable query is a plain JSON descriptor for selecting and projecting managed notes without embedding a host application's query language. It describes observable behavior rather than an execution plan: tools can evaluate it by scanning files, consulting an index, or using a database as long as they produce the same result from the same collection snapshot. Saved-view persistence, presentation layout, aggregation, pagination, query strings, executable expressions, and index formats are separate concerns.

#### Descriptor and Evaluation Surface

Evaluation begins from managed notes after note-type association and effective-schema construction. It uses current parsed field values and concrete resolved relationships, so abstract schemas and property sets influence a query only through the effective model they produce.

This query selects active projects in one area and names each projected column explicitly:

```json
{
  "specification_version": "0.0.1",
  "note_types": ["project"],
  "where": {
    "kind": "relationship",
    "relationship": "belongs_to",
    "note_types": ["area"],
    "where": {
      "kind": "field",
      "field": "status",
      "operator": "equals",
      "value": "active"
    }
  },
  "select": [
    {"kind": "path", "as": "path"},
    {"kind": "field", "field": "title", "as": "title"}
  ]
}
```

Rules:

- `CM-300` A portable query descriptor MUST be a JSON object containing `specification_version` and `select`.
- `CM-385` A portable query descriptor MAY additionally contain `note_types`, `where`, `order_by`, `group_by`, and `limit`.
- `CM-301` A query descriptor MUST satisfy `schema/json-schema/query.schema.json` before semantic evaluation.
- `CM-302` `specification_version` MUST identify the TypedMark specification version whose query semantics the descriptor uses.
- `CM-405` Query evaluators MUST apply the version-recognition and forward-compatibility behavior of `FND-8` through `FND-14` to query descriptors.
- `CM-303` `select` MUST be a non-empty ordered list of projection entries.
- `CM-304` A portable query descriptor is runtime interchange data and MUST NOT become authoritative collection input merely by being stored or transmitted.
- `CM-305` Query evaluation MUST observe one immutable collection snapshot.
- `CM-306` The initial candidate set MUST contain every managed note in that snapshot.
- `CM-386` The initial candidate set MUST exclude governed artifacts, excluded paths, assets, and untyped notes.
- `CM-307` Before evaluating a candidate, a query evaluator MUST resolve its concrete note type, effective schema, current canonical field values, and concrete relationships.
- `CM-308` Query evaluation MUST fail when a note admitted by the top-level `note_types` filter cannot provide the effective model required by `CM-307`.
- `CM-309` An omitted top-level `note_types` MUST admit every candidate note type.
- `CM-310` A present top-level `note_types` MUST be a non-empty list of unique concrete or abstract note-type identifiers.
- `CM-311` Every note-type identifier in a query MUST resolve to exactly one concrete or abstract note type.
- `CM-312` A concrete note-type identifier MUST match only that concrete type.
- `CM-387` An abstract note-type identifier MUST match every concrete descendant under the target semantics of `RHT-16` and `RHT-17`.
- `CM-313` A present top-level `note_types` MUST filter candidates before `where` evaluation.
- `CM-314` An omitted `where` MUST match every remaining candidate.
- `CM-315` A query evaluator MUST apply note-type filtering, predicate filtering, projection, ordering, limiting, and presentation grouping in that sequence.
- `CM-316` Query evaluation MUST NOT modify a collection file or governed artifact.
- `CM-317` Execution strategy, indexing, and caching MUST NOT change the result defined by this section.

#### Boolean, Path, and Field Predicates

Predicates are recursive JSON objects rather than strings. Boolean nodes compose path and typed-field tests without introducing a second expression language; field comparisons reuse the declared field type and the common equality rules in the Field Definition Reference.

For example, this predicate selects notes under `Projects/` that carry either of two tags and do not have a review timestamp:

```json
{
  "specification_version": "0.0.1",
  "where": {
    "kind": "all",
    "predicates": [
      {"kind": "path", "operator": "under", "value": "Projects/"},
      {"kind": "field", "field": "tags", "operator": "contains_any", "value": ["priority/high", "review"]},
      {"kind": "field", "field": "reviewed_at", "operator": "exists", "value": false}
    ]
  },
  "select": [
    {"kind": "path", "as": "path"}
  ]
}
```

Rules:

- `CM-318` Predicate `kind` values in this specification version are exactly `all`, `any`, `not`, `path`, `field`, and `relationship`.
- `CM-319` An `all` or `any` predicate MUST contain a non-empty `predicates` list.
- `CM-320` An `all` predicate matches exactly when every child predicate matches.
- `CM-321` An `any` predicate matches exactly when at least one child predicate matches.
- `CM-322` A `not` predicate MUST contain exactly one child `predicate` and matches exactly when that child does not match.
- `CM-323` A path predicate's `operator` MUST be `equals`, `under`, or `regex`.
- `CM-324` Path predicates MUST evaluate the candidate's normalized collection-relative path, including its `.md` extension.
- `CM-325` Path `equals`, `under`, and `regex` MUST use the matching semantics defined by `CM-406`, `CM-404`, `CM-101`, and `CM-102`.
- `CM-403` A path `equals` value MUST be a normalized collection-relative note path including its `.md` extension.
- `CM-406` Path `equals` matches exactly when the normalized candidate path equals `value` under `FND-38`.
- `CM-404` Path `under` matches exactly when its normalized, trailing-slash directory `value` is a prefix of the normalized candidate path after NFC normalization.
- `CM-326` A field predicate's `field` MUST be a dot-separated field path beginning with one effective top-level field or core-defined managed-note field.
- `CM-327` Each field-path segment after the first MUST name a declared field in the preceding `object.fields` mapping.
- `CM-328` Field paths MUST NOT traverse a list or use an index.
- `CM-329` The field operators in this specification version are exactly `exists`, `equals`, `regex`, `contains_any`, `contains_all`, `less_than`, `less_than_or_equal`, `greater_than`, and `greater_than_or_equal`.
- `CM-330` An `exists` predicate's `value` MUST be a boolean.
- `CM-388` An `exists` predicate's `value` MUST equal whether the complete field path is physically present in the candidate's current parsed frontmatter value.
- `CM-331` A field predicate other than `exists` MUST evaluate to false when its field path is undeclared or absent on the candidate.
- `CM-332` An `equals` predicate on a present field MUST compare its `value` under the field definition and equality rules `FDR-239` through `FDR-244`.
- `CM-333` An `equals` predicate with `value: null` MUST match only a physically present null field value whose field definition permits null.
- `CM-334` The four ordering operators MUST be used only with `text`, `link`, `integer`, `number`, `checkbox`, `date`, `time`, or `datetime` fields.
- `CM-401` An ordering predicate's comparison value MUST be non-null and valid for the field definition.
- `CM-335` Ordered `text` and `link` comparisons MUST compare NFC-normalized Unicode code points with case preserved.
- `CM-336` Ordered `integer` and `number` comparisons MUST use numeric value.
- `CM-389` Ordered `checkbox` comparisons MUST place `false` before `true`.
- `CM-337` Ordered `date` and `time` comparisons MUST use calendar-date or wall-clock-time order.
- `CM-390` Ordered `datetime` comparisons MUST use instant order.
- `CM-338` An ordering predicate MUST evaluate to false for a null field value.
- `CM-339` A field `regex` predicate MUST contain a non-empty ECMA-262 regular expression.
- `CM-391` A field `regex` predicate MUST be used only with a `text` or `link` field.
- `CM-340` A field `regex` predicate MUST match against the entire NFC-normalized stored string.
- `CM-341` A `contains_any` or `contains_all` predicate MUST contain a non-empty `value` list.
- `CM-392` A `contains_any` or `contains_all` predicate MUST be used only with a `list` or `tags` field.
- `CM-342` Every operand of a containment predicate MUST satisfy the applicable list-item or tag definition.
- `CM-343` `contains_any` MUST match when at least one operand equals at least one stored entry under the applicable field-value equality rules.
- `CM-344` `contains_all` MUST match when every operand equals at least one stored entry under the applicable field-value equality rules.
- `CM-345` Query evaluation MUST fail when a field is declared on an evaluated candidate but the selected operator or operand is incompatible with that field definition.
- `CM-346` Query evaluators MUST validate every child of an evaluated boolean predicate.
- `CM-393` Query evaluators MUST NOT use short-circuiting to conceal an invalid child.

#### Relationship Predicates

A relationship predicate counts unique resolved notes, optionally narrowing them by target type and another recursive predicate. This supports direct questions such as “projects belonging to at least one active area” while retaining the relationship model's direction and abstract-target behavior.

```json
{
  "specification_version": "0.0.1",
  "where": {
    "kind": "relationship",
    "relationship": "related_to",
    "direction": "inbound",
    "note_types": ["source"],
    "count": {"min": 2, "max": 10}
  },
  "select": [
    {"kind": "note_type", "as": "type"},
    {"kind": "path", "as": "path"}
  ]
}
```

Rules:

- `CM-347` A relationship predicate MUST declare `relationship` as `belongs_to` or `related_to`.
- `CM-348` An omitted relationship-predicate `direction` MUST have the effective value `outbound`.
- `CM-349` An outbound relationship predicate MUST begin with the candidate's unique concrete targets for the named relationship kind.
- `CM-350` An inbound relationship predicate MUST begin with the unique managed notes having the named concrete relationship kind to the candidate.
- `CM-351` A present relationship-predicate `note_types` MUST filter related notes under `CM-310` through `CM-312` and `CM-387`.
- `CM-352` A present relationship-predicate `where` MUST retain only related notes for which that recursive predicate matches.
- `CM-353` An omitted relationship-predicate `count` MUST have the effective value `{min: 1}`.
- `CM-354` A present `count` MUST contain `min`, `max`, or both as non-negative integers.
- `CM-355` An omitted `count.min` MUST have the effective value `0`.
- `CM-394` An omitted `count.max` MUST impose no upper bound.
- `CM-356` A present `count.min` MUST NOT exceed a present `count.max`.
- `CM-357` A relationship predicate MUST match exactly when the number of retained unique related notes is within its inclusive effective count range.
- `CM-358` A nested relationship predicate MUST evaluate against the related note as its candidate.
- `CM-395` A nested relationship predicate MAY contain further finite predicate nesting.

#### Projection, Ordering, Grouping, and Limiting

Projection produces one conceptual row per matching note. Every column has an explicit stable alias, allowing saved views and content expansions to refer to a column without depending on display labels. Grouping is presentational: it partitions the ordered rows but does not aggregate or collapse them.

This descriptor orders rows by status and due date, keeps null due dates last, limits the ordered result, and then presents the retained rows in status groups:

```json
{
  "specification_version": "0.0.1",
  "note_types": ["project"],
  "select": [
    {"kind": "field", "field": "status", "as": "status"},
    {"kind": "field", "field": "due", "as": "due"},
    {"kind": "field", "field": "title", "as": "title"}
  ],
  "order_by": [
    {"column": "status", "direction": "asc"},
    {"column": "due", "direction": "asc", "nulls": "last"},
    {"column": "title", "direction": "asc"}
  ],
  "group_by": ["status"],
  "limit": 50
}
```

Rules:

- `CM-359` Projection entry `kind` values in this specification version are exactly `path`, `note_type`, and `field`.
- `CM-360` Every projection entry MUST contain an `as` value satisfying the field-name grammar.
- `CM-361` Projection aliases MUST be unique within one query.
- `CM-362` A `path` projection MUST produce the matching note's normalized collection-relative path including `.md`.
- `CM-363` A `note_type` projection MUST produce the matching note's concrete note-type identifier.
- `CM-364` A `field` projection MUST contain a `field` path governed by `CM-326` through `CM-328`.
- `CM-365` A `field` projection MUST produce the current parsed field value when the complete path is present and null when it is undeclared or absent.
- `CM-366` Each result row MUST contain exactly one key for every projection alias in declared `select` order.
- `CM-367` Result-row order MUST be independent of whether `path` is projected.
- `CM-368` A present `order_by` MUST be a non-empty ordered list whose entries refer to distinct projection aliases.
- `CM-369` Every `order_by.column` MUST resolve to exactly one projected column.
- `CM-370` An omitted `order_by.direction` MUST have the effective value `asc`.
- `CM-371` An omitted `order_by.nulls` MUST have the effective value `last`.
- `CM-372` `nulls` placement MUST be applied independently of sort direction.
- `CM-373` Every non-null value observed in one ordered column MUST belong to one compatible scalar comparison domain defined by `CM-335` through `CM-337`, `CM-389`, and `CM-390`.
- `CM-374` Ordering by a list, mapping, or incompatible mixture of scalar domains MUST make query evaluation fail.
- `CM-375` A present `order_by` MUST compare entries in declared order.
- `CM-396` A present `order_by` MUST use normalized collection-relative path in ascending Unicode code-point order as the final tie-breaker.
- `CM-376` An omitted `order_by` MUST order rows by normalized collection-relative path in ascending Unicode code-point order.
- `CM-377` A present `limit` MUST be a non-negative integer.
- `CM-397` A present `limit` MUST produce exactly the first `min(limit, row count)` rows after ordering.
- `CM-378` `limit: 0` MUST produce no rows.
- `CM-379` A present `group_by` MUST be a non-empty ordered list of distinct projection aliases.
- `CM-380` Every `group_by` alias MUST resolve to exactly one projected column.
- `CM-402` Every grouped column value MUST be scalar or null in every retained row.
- `CM-381` Group keys MUST be tuples of the named column values in declared `group_by` order.
- `CM-398` Path and note-type group-key values MUST use exact string equality under `FND-38`.
- `CM-399` Field group-key values MUST use the applicable equality rules of `FDR-239` through `FDR-244`.
- `CM-400` A null group-key value MUST equal only null.
- `CM-382` Groups MUST appear in the order in which their first member appears in the ordered, limited row sequence.
- `CM-383` Rows within each group MUST preserve their relative order from the ordered, limited row sequence.
- `CM-384` Grouping MUST NOT aggregate, remove, or duplicate a result row.

### Vocabularies

`typedmark.md` can define `vocabularies` as named, reusable value sets that field definitions reference through `allowed_values_from`, instead of repeating the same `allowed_values` list across note types.

Core Profile collections can skip vocabularies and use direct `allowed_values` until reuse becomes useful.

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

`typedmark.md` can define `composition` to record the systems this collection's structure was composed from. The lineage is both provenance and the reproducible recipe: re-composing the same sources at the same versions reconstructs the same collection. It is also the input the update flow uses to migrate a collection to newer system versions. System composition, its deterministic merge semantics, and the migration flow are defined in [Systems, Composition, and Evolution](systems-composition-evolution.md).

This is an advanced system concern. Hand-authored Core Profile collections omit `composition`.

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

`typedmark.md` can define `default_property_sets` to name the property sets that apply to every note type by default. This is how a collection declares shared `frontmatter`, `relationships`, and `headings` without repeating them in each schema.

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
- `CM-140` If `default_property_sets` is omitted, no property set applies globally; a managed note may still receive property sets from matching `folder_scopes` and from its concrete note type's `property_sets`.

### Folder Scopes

Folder scopes select managed notes by their actual collection-relative paths and contribute reusable property sets, mandatory tags, or both. They do not choose a note type: note-type mapping wins first, then matching folder scopes refine the effective schema and mandatory-tag policy used for that managed note.

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
- `CM-209` `path.under` MUST be a non-empty collection-relative directory ending in `/` and matches the same subtree defined for `when.path.under` under [Note-Type Mappings](#note-type-mappings).
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

`automation_defaults` holds collection-wide safety policy for automation execution. Its propagation limit bounds forward progress even when a cascade never repeats a state exactly.

```yaml
automation_defaults:
  max_propagation_waves: 100
```

Rules:

- `CM-286` `automation_defaults` MAY be omitted.
- `CM-287` An omitted `automation_defaults` value is equivalent to an empty mapping.
- `CM-288` `automation_defaults.max_propagation_waves` MAY be omitted.
- `CM-289` The effective `max_propagation_waves` is `100` when it is omitted.
- `CM-290` `max_propagation_waves` MUST be a positive integer.
- `CM-291` `max_propagation_waves` MUST NOT exceed `10000`.

### Automation Rules

Automation rules declare portable reactions without embedding executable code. Each rule is a governed Markdown artifact under `<metadata_directory>/automations/`; its frontmatter identifies one trigger, optional targeting predicates, and an ordered action list, while its body explains the rule to humans and agents. Execution and propagation behavior are authoritative in [Managed Notes and Properties](managed-notes-and-properties.md).

```yaml
specification_version: 0.0.1
automation: project-completed
description: Archive a project when its status becomes done.
priority: 100
trigger:
  kind: event
  event: note.updated
  changed:
    status:
      to: done
scope:
  note_types:
    - project
when:
  archived:
    equals: false
actions:
  - kind: set_field
    field: review_needed
    value: false
  - kind: add_tag
    tag: state/completed
  - kind: archive_note
failure: abort
```

Rules:

- `CM-240` `<metadata_directory>/automations/` MAY be omitted when the collection defines no automation rules.
- `CM-241` Every Markdown file directly under `<metadata_directory>/automations/` defines exactly one automation rule.
- `CM-242` An automation file's basename without `.md` MUST equal its top-level `automation` value.
- `CM-243` An automation rule MUST physically contain `specification_version`, `automation`, `description`, `trigger`, and `actions`.
- `CM-244` `automation` MUST be a slug that is unique across the collection's effective automation rules.
- `CM-245` `description` MUST be a non-empty human-facing string.
- `CM-246` `priority` MAY be omitted, and when omitted its effective value is `0`.
- `CM-247` Automation rules are ordered by descending effective `priority`, with equal-priority rules ordered by exact `automation` identifier in ascending Unicode code-point order.
- `CM-248` `trigger.kind` MUST be `event` or `schedule`.
- `CM-249` An event trigger MUST declare `event` as one of `note.created`, `note.updated`, `note.moved`, `note.archived`, or `note.deleted`.
- `CM-250` `trigger.changed` MAY appear only on a `note.updated` event trigger.
- `CM-280` `trigger.changed` MUST map one or more top-level field names to a predicate containing `from`, `to`, or both.
- `CM-251` A `from` or `to` change predicate compares the corresponding parsed value in the event's `changes` entry by exact field-value equality under [Field Definition Reference](field-definition-reference.md).
- `CM-252` `scope` MAY declare `note_types`, `path`, or both.
- `CM-281` A target matches `scope` only when every declared scope constraint matches.
- `CM-253` Each identifier in `scope.note_types` MUST resolve to exactly one concrete note type.
- `CM-254` `scope.path` MUST declare exactly one of `equals`, `under`, or `regex`.
- `CM-282` `scope.path` uses the folder-scope path semantics defined on this page.
- `CM-255` `when`, when present, MUST use the frontmatter predicate shape and semantics defined for `note_type_mappings` on this page.
- `CM-256` `trigger.scope_transition` MAY be omitted, and when omitted its effective value is `matches_after`.
- `CM-257` `trigger.scope_transition` MUST be `matches_after`, `enters`, or `leaves`.
- `CM-258` `matches_after` evaluates the combined `scope` and `when` target predicate against the event's after snapshot, except that `note.deleted` uses its before snapshot.
- `CM-259` `enters` matches when the before snapshot does not satisfy the combined target predicate and the after snapshot does.
- `CM-260` An `enters` or `leaves` trigger MUST consume an event that carries both before and after snapshots.
- `CM-261` A schedule trigger MUST declare exactly one daily, weekly, or monthly schedule with a wall-clock `at` value in `HH:mm` form.
- `CM-262` A daily schedule is due on every local calendar day at `at` in the collection timezone.
- `CM-263` A weekly schedule MUST declare a weekday.
- `CM-284` A weekly schedule is due on its declared local weekday at `at` in the collection timezone.
- `CM-264` A monthly schedule MUST declare a day from `1` through `31`.
- `CM-285` A monthly schedule is not due in a local calendar month that lacks its declared day.
- `CM-265` If a scheduled local time does not exist because of an offset transition, its occurrence is the first valid instant after the gap.
- `CM-266` If a scheduled local time occurs twice because of an offset transition, its occurrence is the earlier instant.
- `CM-267` A schedule executor MUST emit at most one `schedule.tick` event for each automation and scheduled instant.
- `CM-268` `actions` MUST be a non-empty ordered list.
- `CM-269` Supported action kinds are `set_field`, `add_tag`, `remove_tag`, `move_note`, `archive_note`, `create_note`, `logical_delete_note`, and `hard_delete_note`.
- `CM-270` `set_field` MUST declare a top-level `field` name and a parsed YAML `value`.
- `CM-271` `add_tag` and `remove_tag` MUST declare one tag satisfying the stored tag-entry grammar in [Field Definition Reference](field-definition-reference.md).
- `CM-272` `move_note` MUST declare a collection-relative Markdown `path`.
- `CM-273` `archive_note`, `logical_delete_note`, and `hard_delete_note` MUST NOT declare action operands.
- `CM-274` `create_note` MUST declare a concrete `note_type`.
- `CM-283` `create_note` MAY declare a `values` mapping keyed by top-level field name.
- `CM-275` `failure` MAY be omitted, and when omitted its effective value is `abort`.
- `CM-276` This specification version supports only `failure: abort`.
- `CM-277` Automation rules MUST NOT declare arbitrary scripts, commands, prompts, network calls, or executable expressions as triggers or actions.
- `CM-278` Every field, note type, path, tag, and other governed reference in an automation rule MUST be valid for every target on which its action can execute.
- `CM-279` An automation artifact that violates its shape, resolution, or target-compatibility rules is an `invalid_automation` failure.
- `CM-292` A `trigger.changed` field absent from the event's `changes` mapping does not match.
- `CM-293` An omitted `from` or `to` member places no constraint on that side of the field change.
- `CM-294` `leaves` matches when the before snapshot satisfies the combined target predicate and the after snapshot does not.
- `CM-295` An `enters` or `leaves` trigger MUST declare `scope`, `when`, or both.
- `CM-296` A schedule-triggered automation without `scope` or `when` MUST contain only `create_note` actions.

### Property Set Definitions

A property set is the single named reusable bundle for `frontmatter`, `relationships`, and `headings`. A collection applies a property set globally through `default_property_sets`, by managed-note path through `folder_scopes`, or explicitly through a concrete note-type schema's `property_sets`.

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

A property set can also contribute shared `relationships` and `headings`, which is how collection-wide relationship and heading defaults are expressed:

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
- `CM-160` A property set MUST NOT reference other property sets and MUST NOT name `default_property_sets`, `folder_scopes`, `property_sets`, `exclude_property_sets`, or `frontmatter_remove`.

### Composing Property Sets

A managed note receives collection-controlled property sets through `default_property_sets` and matching `folder_scopes`. Its concrete note-type schema opts out through `exclude_property_sets`, adds explicit sets through `property_sets`, and subtracts individual inherited fields through `frontmatter_remove`.

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
- `CM-166` Each identifier in `exclude_property_sets` MUST be named in `default_property_sets` or in at least one `folder_scopes.property_sets` list.
- `CM-167` A property set MUST NOT appear in both `default_property_sets` (after exclusions) and `property_sets` for the same note type.
- `CM-168` The order of identifiers in `property_sets` is significant for the effective merge order.
- `CM-169` A managed note's applied property sets are the non-excluded default property sets in `default_property_sets` order, followed by its matching folder-scope property sets after applying `CM-214` through `CM-217`, followed by the property sets named in its concrete note type's `property_sets`.
- `CM-170` If present, `frontmatter_remove` MUST be a non-empty list of unique frontmatter field names.
- `CM-171` Each field named in `frontmatter_remove` MUST resolve to a field contributed by an applied default property set or by an abstract ancestor.
- `CM-172` If no frontmatter is contributed by default property sets or abstract ancestors, `frontmatter_remove` MUST be omitted.

Effective note-type schema merge rules:

- `CM-173` These merge rules define the effective `frontmatter`, `relationships`, and `headings` blocks used by the effective note-type schema described in [Note Type Schemas](note-type-schemas.md).
- `CM-174` The note type's own inline `frontmatter`, `relationships`, and `headings` blocks are the terminal layer of this same composition; they are applied last and take precedence over every applied property set.
- `CM-175` Frontmatter merges by field name within `frontmatter`.
- `CM-176` Default property set frontmatter, in `default_property_sets` order and after applying `exclude_property_sets`, is applied first.
- `CM-221` Frontmatter from matching folder-scope property sets is applied after default property sets and before abstract ancestors.
- `CM-177` Frontmatter declared by abstract ancestors, if any, is applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-178` If a later abstract ancestor defines a field already defined by a default or folder-scoped property set or by a more distant abstract ancestor, the later abstract ancestor definition replaces the earlier inherited definition completely and determines whether the field is effectively optional.
- `CM-179` If `frontmatter_remove` is present, the named fields are removed from accumulated inherited frontmatter after default-property-set, folder-scoped-property-set, and abstract-ancestor frontmatter has been applied and before any opt-in property set or local concrete note-type frontmatter is applied.
- `CM-180` Opt-in property sets named in `property_sets` are then applied in declared order.
- `CM-181` If two applied property sets define the same field name, the later property set in the applied order replaces the earlier definition completely.
- `CM-182` If an opt-in property set defines a field already defined by a default or folder-scoped property set or abstract-ancestor frontmatter, the opt-in property set definition replaces the inherited definition completely and determines whether the field is effectively optional.
- `CM-183` If a local concrete note-type schema defines a field already contributed by inherited frontmatter or property sets, the local definition replaces the earlier definition completely and determines whether the field is effectively optional.
- `CM-184` A field removed by `frontmatter_remove` does not appear in the effective schema unless an opt-in property set or the local note-type schema defines that field later.
- `CM-185` Because replacement is complete, any property-set-provided or inherited field metadata such as `label`, `description`, or `icon` is replaced too unless the overriding definition restates it.
- `CM-186` Local concrete note-type schema frontmatter is applied last.
- `CM-187` `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- `CM-188` Default property set relationships, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- `CM-222` Relationships from matching folder-scope property sets are applied after default property sets and before abstract ancestors.
- `CM-189` Relationship targets declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-190` Relationship targets declared by opt-in property sets are applied next in declared `property_sets` order.
- `CM-191` If a relationship target is defined both earlier in the merge stack and later in the merge stack or locally, the later definition replaces the earlier definition for that target.
- `CM-192` Default property set headings, in `default_property_sets` order and after applying `exclude_property_sets`, are applied first.
- `CM-223` Headings from matching folder-scope property sets are applied after default property sets and before abstract ancestors.
- `CM-193` Headings declared by abstract ancestors, if any, are applied next from the farthest abstract ancestor to the nearest abstract ancestor.
- `CM-194` Headings declared by opt-in property sets are applied next in declared `property_sets` order.
- `CM-195` `headings.required_h2` and `headings.optional_h2` use replace semantics across the merge stack and the local concrete schema: if a later list is present, it replaces the earlier list; otherwise the earlier list applies unchanged.
- `CM-196` Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics across the merge stack and the local concrete schema: a later value replaces the earlier value; otherwise the earlier value applies unchanged.
- `CM-197` Default, folder-scoped, and opt-in property-set composition and abstract note-type inheritance operate within the effective `frontmatter`, `relationships`, and `headings` blocks of the selected concrete note type; the effective `frontmatter` block remains mandatory, while absent `relationships` and `headings` blocks take the empty defaults defined in [Note Type Schemas](note-type-schemas.md).
- `CM-198` A concrete note-type schema MAY omit individual property-set-provided or inherited field definitions, relationship target definitions, or heading settings that remain unchanged.
- `CM-199` Property-set composition affects only how the effective note-type schema is computed; it does not create a second schema file or a separate persisted artifact.
