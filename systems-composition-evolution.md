---
title: Systems, Composition, and Evolution
parent: TypedMark
nav_order: 7
---

# Systems, Composition, and Evolution

This page is authoritative for the system fields of `typedmark.yaml` — release version, scaffold, and publishing metadata — and for system versioning semantics, deterministic system composition, `<metadata_directory>/history.yaml`, and the migration and update flow. The identity and structural fields of `typedmark.yaml`, including `name`, `label`, `description`, `keywords`, and the `composition` provenance block, are defined in [Collection Model](collection-model.md). This page is not authoritative for note-type schema block semantics, managed note field semantics, or relationship and template semantics; those live in [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

## Systems

A system is a reusable, versioned, publishable collection model. It is the unit people share and instantiate: a personal-knowledge system, a dev-team AI-context system, a marketing-agency system, a PARA system, and so on. Where the core specification defines *how* to define note types, a system defines *which* note types exist and how a collection of that kind is configured and scaffolded.

A system is therefore the domain layer of TypedMark. It carries domain note types, house conventions, templates, and starter content on top of the domain-agnostic core.

There is no separate system manifest. Every collection already declares its identity (`name`, an optional `label`, and `description`) and structural fields in `typedmark.yaml`; a collection *is* a system when it additionally declares the system fields defined on this page, which describe how it is versioned, published, and scaffolded. A private working collection omits them; a publishable system declares them. Publishing a system is therefore nothing more than populating those fields and sharing the folder that contains `typedmark.yaml` and the metadata directory.

Rules:

- The core specification defines the file layout, schema shapes, field semantics, validation model, composition semantics, and conformance rules.
- A system applies that model to a concrete domain by shipping note-type schemas, property sets, templates, scaffold content, and validation defaults.
- A system MAY establish house conventions such as preferred note types, folder conventions, and validation strictness through the artifacts it ships.
- A system MUST NOT relax a core `MUST` requirement.
- System-specific conformance is evaluated in addition to, not instead of, the core conformance rules in [Conformance and Roadmap](conformance-and-roadmap.md).
- A system MAY be composed from other systems, as defined under System Composition below.

## System Fields

The system fields are the part of `typedmark.yaml` that makes a collection a publishable, versioned system. They live alongside the structural and identity fields defined in [Collection Model](collection-model.md). Every collection already declares `name`, `description`, and an optional `label`; a system additionally declares `version` and `scaffold`, and MAY add discovery metadata.

Example `typedmark.yaml` for a publishable system, showing the system fields together with the identity and structural fields they accompany:

```yaml
specification_version: 0.0.1
name: "@example/knowledge-system"
label: Example Knowledge System
description: Reusable knowledge note system.
version: 0.2.0
keywords:
  - notes
  - reference

metadata_directory: .typedmark
exclude_paths:
  - .git/**
validation_defaults:
  path: error
default_property_sets:
  - base

audiences:
  - individual
  - team
publisher:
  name: Example Publisher
license: MIT
scaffold:
  folders:
    - Domains
    - Topics
    - Sources
  notes:
    - path: "Home.md"
      note_type: home
      from_template: "home.md"
      values:
        note_type: home
    - path: "Glossary.md"
      note_type: glossary
      from_template: "glossary.md"
      values:
        note_type: glossary
```

System fields:

- `version`
- `scaffold`
- `audiences`, `publisher`, and `license`, which are optional discovery metadata

The `name`, `label`, `description`, and `keywords` fields are defined in [Collection Model](collection-model.md). A marketplace reuses `name` as the system's identity, `label` as its display name, `description` as its summary, and `keywords` for search.

Rules:

- A collection is a system definition when its `typedmark.yaml` declares `version` and `scaffold`. Conformance requirements for a valid system definition are defined in [Conformance and Roadmap](conformance-and-roadmap.md).
- `version` is the single marker that a collection is a publishable, versioned system; a collection without `version` is a working collection, not a system.
- `name`, the collection identity defined in [Collection Model](collection-model.md), is also the distribution identity a marketplace and `composition.sources` resolve against. A collection has exactly one identity.
- `version` identifies a publishable system release, MUST be a Semantic Versioning 2.0.0 string, and MUST follow the system versioning semantics defined under System Versioning below.
- A collection that declares `version` MUST also declare `scaffold`.
- `scaffold` SHOULD be present, even if empty, on a system definition.
- `scaffold.folders` lists folders an importer SHOULD create when instantiating a collection from the system.
- `scaffold.notes` lists note files an importer SHOULD create when instantiating a collection from the system.
- Each scaffold note entry MUST define `path`, `note_type`, and `from_template`.
- `scaffold.notes[].from_template` follows the same resolution rule as a schema's `template.file` defined in [Note Type Schemas](note-type-schemas.md): it is a relative path resolved against `<metadata_directory>/templates/`, MUST NOT restate the metadata directory or the `templates/` folder, and MUST end in `.md`.
- `scaffold.notes[].note_type` MUST resolve to exactly one concrete note type.
- `scaffold.notes[].values` MAY provide initial frontmatter values that are merged into the instantiated template.
- Values supplied in `scaffold.notes[].values` override template placeholder values for that instantiated note only.
- `scaffold.notes[].path` and `scaffold.folders` entries MUST be collection-relative, MUST use forward slashes, and MUST NOT escape the collection root with absolute paths or `..` segments.
- The system fields govern packaging, publishing, composition, and import only; they MUST NOT restate or override structural rules defined by the structural fields, note-type schemas, or property sets.

### Publishing and Catalog

Rules:

- The canonical published form of a system is the folder that contains `typedmark.yaml` and the metadata directory selected by `typedmark.yaml`, including its governed internal layout.
- A system MAY be shared as a directory tree, a Git repository, or an archive file, provided relative paths are preserved.
- A marketplace entry SHOULD be keyed by `name` and `version`.
- `name`, `label`, `description`, `keywords`, `audiences`, `publisher`, and `license` are the primary discovery fields for catalogs and application marketplaces.
- Applications MAY present curated systems for different audiences such as individuals, teams, and organizations.
- Marketplace or catalog implementations SHOULD be able to index a system from its `typedmark.yaml` alone.

### Importing and Instantiating a System

Instantiating a system creates a working collection from it. The collection records which systems it came from in `typedmark.yaml` `composition`, defined in [Collection Model](collection-model.md).

Rules:

- An importer MUST validate `typedmark.yaml`, any property set files under `<metadata_directory>/property-sets/`, the note-type schema files, and `<metadata_directory>/history.yaml` when present, before creating a collection from the system.
- An importer MUST preserve `typedmark.yaml` and the configured metadata directory structure and file contents unless the user explicitly requests a transformation.
- An importer SHOULD support a full scaffolded import mode that creates the declared folders and notes.
- An importer MAY additionally support a metadata-only import mode that installs `typedmark.yaml` and the configured metadata directory without materializing scaffold notes.
- When instantiating a note from a template, the importer MUST emit frontmatter that conforms to [Managed Notes and Properties](managed-notes-and-properties.md).
- An importer that instantiates a collection from one or more systems MUST record those systems and their resolved versions in `typedmark.yaml` `composition`, so the result can be reproduced and later updated.
- A full scaffolded import yields a usable collection, even if many instantiated notes still contain placeholder or `null` values.
- A metadata-only import yields an installed structural model and does not by itself require the target collection root to contain any instantiated notes.

## System Composition

A collection or a system MAY be built by composing other systems. Composition is how a marketplace and a CLI let a user stack several systems together — for example combining a PARA system, a personal-knowledge system, and a dev-team AI-context system into one working collection, or publishing that combination as a new system.

Composition is a build-time operation. A composing tool loads the source systems at their declared versions, merges them deterministically, and materializes one self-contained collection in which every schema, property set, and template is physically present in the metadata directory. The composed collection then conforms exactly like any hand-authored collection, and remains understandable from `typedmark.yaml` and the metadata directory alone.

The ordered list of source systems and their resolved versions is the collection's composition lineage, recorded in `typedmark.yaml` `composition`, defined in [Collection Model](collection-model.md). The lineage is both provenance and the reproducible recipe: re-running composition over the same sources at the same versions reconstructs the same result.

Rules:

- Composition resolves each source identity and version to exactly one system whose `name` and `version` match.
- A composing tool MUST materialize the merged note-type schemas, property sets, and templates into the target metadata directory so the composed collection is self-contained.
- A composing tool MUST record each source `name` and resolved `version` in `typedmark.yaml` `composition.sources`, in composition order.
- A composing tool MUST NOT require network access, the source systems, or the composition tool itself to evaluate the conformance of an already-composed collection.
- Composition MUST be deterministic, as defined under Composition Merge Semantics below.

### Composition Merge Semantics

The inputs to composition are the ordered source systems from `composition.sources` plus the local artifacts authored directly in the target collection. The merge is a deterministic ordered fold.

Rules:

- Sources are merged in `composition.sources` order; the local collection's own artifacts are applied last.
- Note-type schemas merge by `note_type`; property sets merge by `property_set`; templates merge by template path; `scaffold.folders` merge by set union; `scaffold.notes` merge by `path`.
- When two inputs contribute the same keyed artifact, the later input in the merge order replaces the earlier one completely, and the local collection's artifact overrides every source.
- `typedmark.yaml` `metadata_directory` MUST be identical across all sources and the target; a mismatch is a composition error.
- `typedmark.yaml` `default_property_sets` merge by concatenation in merge order with duplicate identifiers removed, keeping the first occurrence.
- A source's `default_property_sets` are scoped to that source: they apply only to the note types whose winning schema was contributed by that source, so one source's defaults MUST NOT silently change the effective schemas of another source's note types.
- A composing tool MUST materialize that scoping using the existing composition constructs: for each concrete note type in the composed result, every merged default property set that is named neither in the defaults of the source that contributed the winning schema for that note type nor in the target collection's own `default_property_sets` MUST be added to that note type's `exclude_property_sets`, preserving any exclusions the schema already declares.
- The target collection's own `default_property_sets` apply to every concrete note type in the composed result, including note types contributed by sources, unless a note type excludes them explicitly.
- A composing tool MUST report each scoping exclusion it materializes, identifying the note type, the excluded property set, and the sources involved.
- Relationship target note types referenced by a source's property sets and note-type schemas are resolved against the composed result, not against the source in isolation.
- `typedmark.yaml` `note_type_mappings` merge by concatenation in merge order; because mapping rules are evaluated in order, earlier sources' rules are evaluated before later sources' rules unless the target overrides them.
- `typedmark.yaml` `validation_defaults` and `exclude_paths` merge by key, with later inputs overriding earlier inputs per key, and the target overriding all.
- The composing collection's own `name`, `version`, and other system fields are authored on the result; they are never inherited from a source.
- A composing tool MUST report every collision it resolves, identifying the artifact, the contributing sources, and the winner.
- `history.yaml` from each source MAY be retained for update reasoning, as defined under Migration and Updates; composition itself does not require merging source histories into a single log.

### Reproducibility and Canonical Form

Rules:

- Two conforming composing tools given identical `composition.sources` at identical versions MUST produce the same composed schemas, property sets, and templates under canonical comparison.
- Canonical comparison uses the canonical field materialization rules in [Managed Notes and Properties](managed-notes-and-properties.md) for frontmatter, and the deterministic merge order defined above for every ordered construct, including effective field order, `property_sets` order, and `composition.sources` order.
- A composing tool that claims reproducible or hash-stable output MUST serialize composed artifacts in the canonical serialization defined below; two artifacts that are equal under canonical comparison then have byte-identical canonical serializations.
- The local-only contribution of a composed collection is, by definition, the difference between its current materialized state and the state obtained by recomposing its `composition.sources`; a tool MUST be able to recover it by recomposition rather than by reading per-artifact origin tags.

### Canonical Serialization

The canonical serialization of a governed YAML artifact is the byte sequence produced by the rules below. It exists so that composition and migration produce reproducible, hash-stable output. A hand-authored governed artifact need not be in canonical form to be valid; canonical serialization is the form a tool produces when it materializes composed artifacts or claims reproducible output.

Encoding and layout:

- The output MUST be UTF-8 without a byte-order mark.
- Line endings MUST be a single LINE FEED (U+000A); carriage returns MUST NOT appear.
- The output MUST end with exactly one LINE FEED, and no line may contain trailing whitespace.
- Mappings and sequences MUST use block style; flow style, anchors, aliases, explicit tags, comments, and directives MUST NOT appear.
- Indentation MUST be two spaces per nesting level.

Key and element order:

- Order-significant mappings preserve their defined order; every other mapping serializes its keys sorted ascending by Unicode code point.
- The `frontmatter` mapping and every `object.fields` mapping are order-significant and MUST preserve the effective field order defined by the merge rules.
- `property_sets`, `default_property_sets`, `composition.sources`, `history`, and every `changes` list are sequences and MUST preserve their defined order.
- Every other mapping, including a field definition's property keys and the `storage`, `relationships`, `headings`, and `typedmark.yaml` top-level mappings, MUST serialize its keys in ascending Unicode code-point order.

Scalars:

- Null MUST serialize as `null`.
- Booleans MUST serialize as `true` or `false`.
- Integers MUST serialize in base ten, with no leading zeros, no leading `+`, and a leading `-` only for negative values.
- Numbers MUST serialize as the shortest base-ten decimal that round-trips to the stored value, using `.` for any fractional part and a lowercase `e` for any exponent; negative zero MUST serialize as `0`.
- Strings MUST serialize in plain style when the value is plain-safe, and otherwise in double-quoted style with `\` escapes.
- A string is plain-safe when it is non-empty, does not begin with a YAML indicator character, contains no control characters or characters that require escaping, and does not match the canonical serialization of a null, boolean, integer, or number.
- Each materialized field value MUST also satisfy the Canonical Field Materialization rules in [Managed Notes and Properties](managed-notes-and-properties.md).

## System Versioning

A system's `version` communicates the intent of a release to humans and catalogs. It does not, by itself, tell a tool what a given upgrade will do to a collection.

Change classes:

- `patch`: non-structural changes only, such as edits to `label`, `description`, `icon`, or `guidance`.
- `minor`: additive, backward-compatible structural changes, such as a new note type, a new property set, or a new optional field.
- `major`: breaking structural changes, such as removing or renaming a note type or field, changing a field type, tightening a constraint, or changing storage rules.

Rules:

- `version` MUST be a Semantic Versioning 2.0.0 string.
- A system release SHOULD select its `version` change class according to the most impactful change it introduces, using the change classes above.
- The version number conveys intent only. A tool MUST NOT infer the concrete migration impact of an upgrade from the version number alone.
- A tool that evaluates an upgrade MUST compute the actual impact from the new system's `typedmark.yaml`, its governed artifacts, and its `history.yaml`, as defined under Migration and Updates, and MUST treat the version number as advisory.

## Change History

`<metadata_directory>/history.yaml` is an append-only, event-sourced log of the structural changes a system has undergone. Replaying its events in order reconstructs how the current schema state came to be. It is the authoritative record of *what changed* between versions, including changes such as field renames that cannot be inferred from a structural comparison alone.

History example:

```yaml
specification_version: 0.0.1
history:
  - version: 0.1.0
    changes:
      - op: add_note_type
        note_type: topic
      - op: add_field
        note_type: topic
        field: title
      - op: add_field
        note_type: topic
        field: summary
  - version: 0.2.0
    changes:
      - op: rename_field
        note_type: topic
        from: summary
        to: overview
      - op: add_field
        note_type: topic
        field: status
```

Defined change operations:

- `add_note_type` with `note_type`
- `remove_note_type` with `note_type`
- `rename_note_type` with `from` and `to`
- `add_field` with `note_type` or `property_set`, and `field`
- `remove_field` with `note_type` or `property_set`, and `field`
- `rename_field` with `note_type` or `property_set`, `from`, and `to`
- `retype_field` with `note_type` or `property_set`, `field`, `from_type`, and `to_type`
- `change_field` with `note_type` or `property_set`, and `field`, for constraint or metadata changes that are neither a rename nor a retype
- `change_storage` with `note_type`, for changes to the effective `storage` block
- `change_template` with `note_type`, for changes to the effective `template` reference or to the canonical template content
- `change_headings` with `note_type`, for changes to the effective `headings` block
- `change_relationships` with `note_type`, for changes to the effective `relationships` block
- `change_note_type` with `note_type`, for note-type-level changes that no more specific operation covers, such as changes to `kind`, `extends`, `property_sets`, `exclude_property_sets`, `frontmatter_remove`, or `guidance`
- `change_collection`, for changes to the structural fields of `typedmark.yaml`, such as `note_type_mappings`, `default_property_sets`, `exclude_paths`, or `validation_defaults`
- `add_property_set` with `property_set`
- `remove_property_set` with `property_set`
- `rename_property_set` with `from` and `to`

Rules:

- `<metadata_directory>/history.yaml` MAY be omitted by a system that publishes no change history.
- If present, `history.yaml` MUST physically contain `specification_version` and `history`.
- `history` MUST be an ordered list of release entries.
- Each release entry MUST declare `version` and `changes`.
- Each release entry's `version` MUST be a Semantic Versioning 2.0.0 string.
- Release entries MUST appear in ascending version order, and each `version` MUST be unique within `history`.
- The last release entry's `version` MUST equal the collection's `version` in `typedmark.yaml` when the collection declares one.
- Each entry in `changes` MUST declare `op` using one of the defined change operations.
- A field operation MUST declare exactly one of `note_type` or `property_set`, naming the artifact that physically defines the field: `note_type` when the field is defined in a note-type schema, `property_set` when it is defined in a property set.
- A `field` operand MAY be a dotted path to address a nested field inside an `object.fields` mapping.
- A `change_*` operation records that the named block or artifact changed; it does not restate the new value, which lives in the governed artifacts themselves.
- Every structural difference between two consecutive releases MUST be recorded by at least one change operation; a structural change that no operation records is a divergence between `history.yaml` and the current schemas.
- Replaying `history` from the first entry to the last, applying each `changes` list in order, MUST reconstruct the system's current inventory of note types, property sets, and fields, and MUST account for every structural change between consecutive releases; the governed artifacts remain authoritative for the concrete content of each block.
- A validator MAY check this reconstruction invariant and report a divergence between `history.yaml` and the current schemas.
- When cutting a new release, a tool SHOULD generate candidate `changes` by comparing the previous version's state to the current state, and the author MUST confirm or correct any change that a structural comparison cannot classify unambiguously, in particular distinguishing a `rename_field` from a paired `remove_field` and `add_field`.

## Migration and Updates

Updating a collection to newer versions of one or more of its source systems re-resolves the lineage, recomposes the collection, and migrates existing notes to match the new effective schemas.

Because a structural comparison cannot distinguish a rename from a removal paired with an addition, migration does not trust the version number and does not rely on a structural diff alone. It computes the concrete impact on the specific target collection by examining the new system together with the change history that produced it.

The update flow:

1. Read the lineage from `typedmark.yaml` `composition.sources`.
2. Resolve the new target version for each source system being updated.
3. Recompose the collection deterministically at the new versions to obtain the new effective schemas.
4. Compute the structural impact on the specific target by comparing the collection's current effective schemas to the recomposed schemas.
5. Reconcile that impact with the `changes` recorded in each updated source's `history.yaml` between the collection's current source version and the target source version, so that renames and retypes are classified correctly rather than treated as drops and adds.
6. Produce an ordered migration plan of managed-note operations from the reconciled change set.
7. Apply the migration plan to the collection's managed notes, then update `composition.sources` to the new versions.

Rules:

- A tool MUST recompute migration impact against the actual target collection, because local overrides recorded on top of the lineage MAY change which source changes are relevant.
- A tool MUST classify field renames and retypes using the source `history.yaml` change operations rather than inferring them from a structural comparison.
- The managed-note effect of each change operation is defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- After a migration completes, the collection MUST conform to the recomposed effective schemas, and `typedmark.yaml` `composition.sources` MUST record the new resolved versions.
- A tool MUST NOT silently discard managed-note data; a migration step that cannot preserve data, such as an unclassifiable `retype_field`, MUST be reported for explicit resolution rather than applied destructively.
