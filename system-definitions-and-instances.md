---
title: System Definitions and Instances
parent: TypedMark
nav_order: 7
---

# System Definitions and Instances

This page is authoritative for `<metadata_directory>/system.yaml`, `<metadata_directory>/instance.yaml`, and the boundary between the core specification and profiles. It is not authoritative for `typedmark.yaml`; that lives in [Collection Model](collection-model.md). It is also not authoritative for note-type schema block semantics, managed note field semantics, or relationship and template semantics; those live in [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

## System Definitions, Instances, and Profiles

A system definition is a reusable package for a TypedMark collection model. It packages:

- system identity and publishable metadata
- the root `typedmark.yaml`
- named property sets, when used
- note-type schemas
- templates
- scaffold instructions for creating an initial collection structure

An instantiated collection is a concrete workspace described by `<metadata_directory>/instance.yaml`.

### System Definition Artifact

`<metadata_directory>/system.yaml` defines a reusable system package. Conformance requirements for when a filesystem tree counts as a valid system definition are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

Required system manifest example:

```yaml
specification_version: 0.0.1
system_id: example-knowledge-system
version: 0.0.1
name: Example Knowledge System
description: Reusable knowledge note system.
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
      from_template: "<metadata_directory>/templates/home.md"
      values:
        note_type: home
    - path: "Glossary.md"
      note_type: glossary
      from_template: "<metadata_directory>/templates/glossary.md"
      values:
        note_type: glossary
catalog:
  tags:
    - notes
    - reference
```

Required top-level keys:

- `specification_version`
- `system_id`
- `version`
- `name`
- `description`
- `scaffold`

Rules:

- `<metadata_directory>/system.yaml` defines the canonical system representation for packaging, publishing, sharing, and import.
- `<metadata_directory>/system.yaml` MUST conform to the system-manifest rules defined by this specification.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `system_id` uniquely identifies the logical system family.
- `system_id` identifies a reusable system family and is not an instantiated collection identifier.
- `version` identifies a publishable system release and MUST be a Semantic Versioning 2.0.0 string.
- Consumers MUST derive the canonical collection asset locations from the authoritative artifact map in [Foundations](foundations.md) together with `typedmark.yaml` `metadata_directory`.
- `system_id` and `collection_model_id` identify different things and MUST NOT be treated as interchangeable.
- `scaffold` SHOULD be present, even if empty.
- `scaffold.folders` lists folders an importer SHOULD create when instantiating a collection from the system.
- `scaffold.notes` lists note files an importer SHOULD create when instantiating a collection from the system.
- Each scaffold note entry MUST define `path`, `note_type`, and `from_template`.
- `scaffold.notes[].values` MAY provide initial frontmatter values that are merged into the instantiated template.
- Values supplied in `scaffold.notes[].values` override template placeholder values for that instantiated note only.
- A system definition MAY be shared as a directory, a Git repository, or an archive file, provided relative paths are preserved.
- The canonical published form is the unpacked directory tree that preserves `typedmark.yaml` and the metadata directory selected by `typedmark.yaml`, including its governed internal layout.

Import semantics:

- An importer MUST preserve `typedmark.yaml` and the configured metadata directory structure and file contents unless the user explicitly requests a transformation.
- An importer MUST validate `<metadata_directory>/system.yaml`, `typedmark.yaml`, any property set files present under `<metadata_directory>/property-sets/`, and the note-type schema files before creating a collection from the system.
- An importer SHOULD support a full scaffolded import mode that creates the declared folders and notes.
- An importer MAY additionally support a metadata-only import mode that installs `typedmark.yaml` and the configured metadata directory without materializing scaffold notes.
- A metadata-only import MUST NOT create `<metadata_directory>/instance.yaml`.
- A full scaffolded import MUST create `<metadata_directory>/instance.yaml`.
- A full scaffolded import MUST assign a new `collection_instance_id`.
- When instantiating a note from a template, the importer MUST emit frontmatter that conforms to [Managed Notes and Properties](managed-notes-and-properties.md).
- Marketplace or catalog implementations SHOULD be able to index a system definition from `<metadata_directory>/system.yaml` alone.
- A metadata-only import yields an installed system definition and does not by itself require the target workspace to contain any instantiated notes.
- A full scaffolded import yields an instantiated collection, even if many instantiated notes still contain placeholder or `null` values.

Publishing and catalog semantics:

- A marketplace entry SHOULD be keyed by `system_id` and `version`.
- `name`, `description`, `audiences`, `publisher`, `license`, and `catalog.tags` are the primary discovery fields for catalogs and application marketplaces.
- Applications MAY present curated system definitions for different audiences such as individuals, teams, and organizations.

### Collection Instance Artifact

`<metadata_directory>/instance.yaml` defines the identity and provenance of one instantiated collection. Conformance requirements for when a filesystem tree counts as a valid instantiated collection are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

Required instance manifest example:

```yaml
specification_version: 0.0.1
collection_instance_id: 01JWW3QGMBH1MG4VK9A6V4ZJ9C
collection_model_id: example-knowledge-base
system_id: example-knowledge-system
system_version: 0.0.1
```

Required top-level keys:

- `specification_version`
- `collection_instance_id`
- `collection_model_id`

Rules:

- `<metadata_directory>/instance.yaml` MUST conform to the instance-manifest rules defined by this specification.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `collection_instance_id` MUST be a non-empty string and SHOULD be globally unique.
- `collection_instance_id` identifies one concrete instantiated collection.
- `collection_instance_id` MUST NOT appear in `typedmark.yaml`.
- `collection_model_id` in `<metadata_directory>/instance.yaml` MUST equal `collection_model_id` in `typedmark.yaml`.
- `system_id` and `system_version` MAY be omitted. If present, they are provenance fields in `<metadata_directory>/instance.yaml`.
- If `<metadata_directory>/instance.yaml` declares `system_version`, it MUST be a Semantic Versioning 2.0.0 string.
- If `<metadata_directory>/system.yaml` is present and `<metadata_directory>/instance.yaml` declares `system_id`, it MUST equal `<metadata_directory>/system.yaml` `system_id`.
- If `<metadata_directory>/system.yaml` is present and `<metadata_directory>/instance.yaml` declares `system_version`, it MUST equal `<metadata_directory>/system.yaml` `version`.
- Multiple instantiated collections MAY share the same `system_id`, `system_version`, and `collection_model_id`, but each instantiated collection MUST have its own `collection_instance_id`.

### Core Specification and Profiles

The core specification defines the reusable structural model. Profiles and reference systems apply that model to a concrete domain.

Rules:

- The core specification defines the file layout, schema shapes, field semantics, validation model, and conformance rules.
- A profile MAY define a RECOMMENDED or REQUIRED note type set.
- A profile MAY constrain preferred internal link syntax, path conventions, naming rules, scaffold content, and validation settings.
- A profile MAY define fixed-path singleton notes, starter folders, and starter templates.
- A profile MUST NOT relax a core `MUST` requirement.
- Profile-specific conformance is evaluated in addition to, not instead of, the core conformance rules in [Conformance and Roadmap](conformance-and-roadmap.md).
- A system definition MAY act as a publishable profile or reference system.
