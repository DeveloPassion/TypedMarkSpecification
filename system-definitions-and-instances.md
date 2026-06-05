---
title: System Definitions and Instances
parent: TypedMark
nav_order: 3
---

# System Definitions and Instances

This page is authoritative for `.metadata/system.yaml`, `.metadata/instance.yaml`, and the boundary between the core specification and profiles. It is not authoritative for `typedmark.json`; that lives in [Collection Model](collection-model.md). It is also not authoritative for note-type schema block semantics, managed note field semantics, or relationship and template semantics; those live in [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

## 6. System Definitions, Instances, and Profiles

A system definition is a reusable package for a TypedMark collection model. It packages:

- system identity and publishable metadata
- the root `typedmark.json`
- named property sets, when used
- note-type schemas
- templates
- scaffold instructions for creating an initial collection structure

An instantiated collection is a concrete workspace described by `.metadata/instance.yaml`.

### System Definition Artifact

`.metadata/system.yaml` defines a reusable system package. Conformance requirements for when a filesystem tree counts as a valid system definition are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

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
entrypoints:
  collection: typedmark.json
  schemas: .metadata/schemas
  property_sets: .metadata/property-sets
  templates: .metadata/templates
scaffold:
  folders:
    - Domains
    - Topics
    - Sources
  notes:
    - path: "Home.md"
      note_type: home
      from_template: ".metadata/templates/home.md"
      values:
        note_type: home
        id: home
    - path: "Glossary.md"
      note_type: glossary
      from_template: ".metadata/templates/glossary.md"
      values:
        note_type: glossary
        id: glossary
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
- `entrypoints`
- `scaffold`

Rules:

- `.metadata/system.yaml` defines the canonical system representation for packaging, publishing, sharing, and import.
- `.metadata/system.yaml` MUST conform to the system-manifest rules defined by this specification.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `system_id` uniquely identifies the logical system family.
- `system_id` identifies a reusable system family and is not an instantiated collection identifier.
- `version` identifies a publishable system release and MUST be a Semantic Versioning 2.0.0 string.
- `entrypoints` MUST point to the canonical collection assets within the same system definition.
- `entrypoints.collection` MUST point to `typedmark.json`.
- `entrypoints.schemas` MUST point to `.metadata/schemas`.
- `entrypoints.property_sets` MAY be omitted. If present, it MUST point to `.metadata/property-sets`.
- If a system definition contains one or more property set files, `entrypoints.property_sets` SHOULD be present.
- `entrypoints.templates` MUST point to `.metadata/templates`.
- `system_id` and `collection_model_id` identify different things and MUST NOT be treated as interchangeable.
- `scaffold` SHOULD be present, even if empty.
- `scaffold.folders` lists folders an importer SHOULD create when instantiating a collection from the system.
- `scaffold.notes` lists note files an importer SHOULD create when instantiating a collection from the system.
- Each scaffold note entry MUST define `path`, `note_type`, and `from_template`.
- `scaffold.notes[].values` MAY provide initial frontmatter values that are merged into the instantiated template.
- Values supplied in `scaffold.notes[].values` override template placeholder values for that instantiated note only.
- A system definition MAY be shared as a directory, a Git repository, or an archive file, provided relative paths are preserved.
- The canonical published form is the unpacked directory tree that preserves the `typedmark.json` and `.metadata/` layout REQUIRED by this specification.

Import semantics:

- An importer MUST preserve `typedmark.json` and the `.metadata/` directory structure and file contents unless the user explicitly requests a transformation.
- An importer MUST validate `.metadata/system.yaml`, `typedmark.json`, any property set files present under `.metadata/property-sets/`, and the note-type schema files before creating a collection from the system.
- An importer SHOULD support a full scaffolded import mode that creates the declared folders and notes.
- An importer MAY additionally support a metadata-only import mode that installs `typedmark.json` and `.metadata/` without materializing scaffold notes.
- A metadata-only import MUST NOT create `.metadata/instance.yaml`.
- A full scaffolded import MUST create `.metadata/instance.yaml`.
- A full scaffolded import MUST assign a new `collection_instance_id`.
- When instantiating a note from a template, the importer MUST emit frontmatter that conforms to [Managed Notes and Properties](managed-notes-and-properties.md).
- Marketplace or catalog implementations SHOULD be able to index a system definition from `.metadata/system.yaml` alone.
- A metadata-only import yields an installed system definition and does not by itself require the target workspace to contain any instantiated notes.
- A full scaffolded import yields an instantiated collection, even if many instantiated notes still contain placeholder or `null` values.

Publishing and catalog semantics:

- A marketplace entry SHOULD be keyed by `system_id` and `version`.
- `name`, `description`, `audiences`, `publisher`, `license`, and `catalog.tags` are the primary discovery fields for catalogs and application marketplaces.
- Applications MAY present curated system definitions for different audiences such as individuals, teams, and organizations.

### Collection Instance Artifact

`.metadata/instance.yaml` defines the identity and provenance of one instantiated collection. Conformance requirements for when a filesystem tree counts as a valid instantiated collection are defined in [Conformance and Roadmap](conformance-and-roadmap.md).

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

- `.metadata/instance.yaml` MUST conform to the instance-manifest rules defined by this specification.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `collection_instance_id` MUST be a non-empty string and SHOULD be globally unique.
- `collection_instance_id` identifies one concrete instantiated collection.
- `collection_instance_id` MUST NOT appear in `typedmark.json`.
- `collection_model_id` in `.metadata/instance.yaml` MUST equal `collection_model_id` in `typedmark.json`.
- `system_id` and `system_version` MAY be omitted. If present, they are provenance fields in `.metadata/instance.yaml`.
- If `.metadata/instance.yaml` declares `system_version`, it MUST be a Semantic Versioning 2.0.0 string.
- If `.metadata/system.yaml` is present and `.metadata/instance.yaml` declares `system_id`, it MUST equal `.metadata/system.yaml` `system_id`.
- If `.metadata/system.yaml` is present and `.metadata/instance.yaml` declares `system_version`, it MUST equal `.metadata/system.yaml` `version`.
- Multiple instantiated collections MAY share the same `system_id`, `system_version`, and `collection_model_id`, but each instantiated collection MUST have its own `collection_instance_id`.

### Core Specification and Profiles

The core specification defines the reusable structural model. Profiles and reference systems apply that model to a concrete domain.

Rules:

- The core specification defines the file layout, schema shapes, field semantics, validation model, canonical serialization, and conformance rules.
- A profile MAY define a RECOMMENDED or REQUIRED note type set.
- A profile MAY constrain preferred internal link syntax, path conventions, naming rules, scaffold content, and validation settings.
- A profile MAY define fixed-path singleton notes, starter folders, and starter templates.
- A profile MUST NOT relax a core `MUST` requirement.
- Profile-specific conformance is evaluated in addition to, not instead of, the core conformance rules in [Conformance and Roadmap](conformance-and-roadmap.md).
- A system definition MAY act as a publishable profile or reference system.
