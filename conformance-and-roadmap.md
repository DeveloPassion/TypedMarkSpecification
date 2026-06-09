---
title: Conformance and Roadmap
parent: TypedMark
nav_order: 8
---

# Conformance and Roadmap

This page is authoritative for conformance modes, non-goals, and the RECOMMENDED implementation order. Artifact-specific validity rules live in the linked pages.

## Non-Goals

This specification does not:

- enforce a specific schema for note types. It describes how to define/document one

## Conformance

Conformance evaluates a collection root, represented on disk as a directory tree, against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [Systems, Composition, and Evolution](system-definitions-and-instances.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Valid System Definition

A collection root conforms as a valid system definition when:

1. `typedmark.yaml` is present at the root and valid under [Collection Model](collection-model.md).
2. `typedmark.yaml` declares the system fields `version`, `name`, `description`, and `scaffold`, valid under [Systems, Composition, and Evolution](system-definitions-and-instances.md).
3. `<metadata_directory>/history.yaml`, if present, is valid under [Systems, Composition, and Evolution](system-definitions-and-instances.md) and reconstructs the current schema state when replayed.
4. Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note-type schema resolves.
5. Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md).
6. Every template referenced by a schema file exists, is valid under [Relationships, Headings, and Templates](relationships-headings-and-templates.md), and has starter frontmatter that conforms to its note type's effective schema.

### Valid Instantiated Collection

A collection root conforms as a valid instantiated collection when:

1. `typedmark.yaml` is present at the collection root and valid under [Collection Model](collection-model.md).
2. If `typedmark.yaml` declares `composition`, it is valid under [Collection Model](collection-model.md), and the collection is self-contained so that conformance does not require re-resolving its sources.
3. Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note type used by managed notes resolves.
4. Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md), and every concrete note type used by managed notes resolves to exactly one such schema file.
5. Managed notes resolve to valid concrete note types under the configured note-type mapping rules and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
6. Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
7. Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- A collection root is a system definition when `typedmark.yaml` declares the system fields, and an instantiated collection when `typedmark.yaml` governs managed notes; neither requires a separate system or instance manifest.
- A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- Structural precedence across artifacts remains defined in [Foundations](foundations.md).

## Recommended Next Steps

Recommended implementation order:

1. create `typedmark.yaml` and decide note-type mappings, validation defaults, and default property sets using [Collection Model](collection-model.md)
2. create any reusable property sets and the initial abstract and concrete note type schemas using [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md)
3. create canonical templates and heading and relationship rules using [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md)
5. populate the system fields in `typedmark.yaml`, and add a `<metadata_directory>/history.yaml` change log, if you are packaging a reusable, versioned system, using [Systems, Composition, and Evolution](system-definitions-and-instances.md)
6. add a validator and importer that evaluate the conformance modes defined on this page
7. implement deterministic system composition that materializes a self-contained collection and records its lineage in `typedmark.yaml` `composition`, using [Systems, Composition, and Evolution](system-definitions-and-instances.md)
8. implement the migration and update flow that recomposes a collection at newer source versions and applies the resulting change operations to managed notes
9. generate the human-facing reference pages from the authoritative artifacts
