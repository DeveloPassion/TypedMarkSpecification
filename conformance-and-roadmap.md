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

Conformance evaluates a collection root, represented on disk as a directory tree, against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [System Definitions and Instances](system-definitions-and-instances.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Valid System Definition

A collection root conforms as a valid system definition when:

1. `typedmark.yaml` is present at the root and valid under [Collection Model](collection-model.md).
2. `<metadata_directory>/system.yaml` is present and valid under [System Definitions and Instances](system-definitions-and-instances.md).
3. `<metadata_directory>/instance.yaml` is absent or, if present, valid under [System Definitions and Instances](system-definitions-and-instances.md).
4. Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note-type schema resolves.
5. Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md).
6. Every template referenced by a schema file exists and is valid under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Valid Instantiated Collection

A collection root conforms as a valid instantiated collection when:

1. `typedmark.yaml` is present at the collection root and valid under [Collection Model](collection-model.md).
2. `<metadata_directory>/instance.yaml` is present and valid under [System Definitions and Instances](system-definitions-and-instances.md).
3. Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note type used by managed notes resolves.
4. Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md), and every concrete note type used by managed notes resolves to exactly one such schema file.
5. Managed notes resolve to valid concrete note types under the configured note-type mapping rules and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
6. Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
7. Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- When evaluating an instantiated collection, `<metadata_directory>/system.yaml` MAY be present, but it is not required.
- A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- Structural precedence across artifacts remains defined in [Foundations](foundations.md).

## Recommended Next Steps

Recommended implementation order:

1. create `typedmark.yaml` and decide note-type mappings, validation defaults, and default property sets using [Collection Model](collection-model.md)
2. create any reusable property sets and the initial abstract and concrete note type schemas using [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md)
3. create canonical templates and heading and relationship rules using [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md)
5. create `<metadata_directory>/system.yaml` if you are packaging a reusable system definition, using [System Definitions and Instances](system-definitions-and-instances.md)
6. add a validator and importer that evaluate the conformance modes defined on this page
7. make the importer generate `<metadata_directory>/instance.yaml` when creating an instantiated collection
8. generate the human-facing reference pages from the authoritative artifacts
