---
title: Conformance and Roadmap
parent: TypedMark
nav_order: 8
---

# Conformance and Roadmap

This page is authoritative for conformance modes, non-goals, and the RECOMMENDED implementation order. Artifact-specific validity rules live in the linked pages.

## 18. Non-Goals

This version of the specification does not:

- infer authoritative structure from folder names alone
- define canonical serialization for governed artifacts
- constrain H3 or deeper headings

## 19. Conformance

Conformance evaluates a filesystem tree against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [System Definitions and Instances](system-definitions-and-instances.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### 19.1 Valid System Definition

A filesystem tree conforms as a valid system definition when:

1. `typedmark.yaml` is present at the root and valid under [Collection Model](collection-model.md).
2. `.metadata/system.yaml` is present and valid under [System Definitions and Instances](system-definitions-and-instances.md).
3. `.metadata/instance.yaml` is absent or, if present, valid under [System Definitions and Instances](system-definitions-and-instances.md).
4. Every property set file under `.metadata/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note-type schema resolves.
5. Every managed note type has exactly one valid schema file under [Note Type Schemas](note-type-schemas.md).
6. Every template referenced by note-type schemas exists and is valid under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### 19.2 Valid Instantiated Collection

A filesystem tree conforms as a valid instantiated collection when:

1. `typedmark.yaml` is present at the collection root and valid under [Collection Model](collection-model.md).
2. `.metadata/instance.yaml` is present and valid under [System Definitions and Instances](system-definitions-and-instances.md).
3. Every property set file under `.metadata/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note type used by managed notes resolves.
4. Every note type used by managed notes has exactly one valid schema file under [Note Type Schemas](note-type-schemas.md).
5. Managed notes declare valid `note_type` values and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
6. Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
7. Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- When evaluating an instantiated collection, `.metadata/system.yaml` MAY be present, but it is not required.
- A single filesystem tree MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- Structural precedence across artifacts remains defined in [Foundations](foundations.md).

## 20. Recommended Next Steps

Recommended implementation order:

1. create `typedmark.yaml` and decide validation defaults, global properties, and inheritance using [Collection Model](collection-model.md)
2. create any reusable property sets and the initial concrete note type schemas using [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md)
3. create canonical templates and heading and relationship rules using [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md)
5. create `.metadata/system.yaml` if you are packaging a reusable system definition, using [System Definitions and Instances](system-definitions-and-instances.md)
6. add a validator and importer that evaluate the conformance modes defined on this page
7. make the importer generate `.metadata/instance.yaml` when creating an instantiated collection
8. generate the human-facing reference pages from the authoritative artifacts
