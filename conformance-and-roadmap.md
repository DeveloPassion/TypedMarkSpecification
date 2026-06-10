---
title: Conformance and Roadmap
parent: TypedMark
nav_order: 12
audience: tool-authors
---

# Conformance and Roadmap

Audience: tool authors and implementers.

Authoritative for:

- the specification's non-goals
- conformance modes and their required artifact sets
- the recommended implementation order

## Non-Goals

This specification defines the structural contract for typed Markdown note collections. It deliberately does not define:

- **A specific schema for note types.** TypedMark describes how to define and document note types; concrete note sets, starter content, and house conventions belong to systems layered on top of the core, as stated in [Foundations](foundations.md).
- **Rendering and presentation.** How notes, fields, views, or icons are displayed is tool-defined; `icon` is an opaque token, and presentation hints remain an open decision tracked separately.
- **Editor user experience.** Forms, pickers, autocomplete behavior, and authoring workflows are application concerns.
- **Sync, storage backends, and version control.** TypedMark governs files at rest; how they move between machines — Git, sync services, backups — is out of scope.
- **Body prose.** Markdown content outside the governed surfaces — frontmatter, H2 headings, internal note links — is free; TypedMark does not constrain writing style or block-level structure.
- **Value coercion.** TypedMark is strictly typed: a stored value either satisfies its declared property type or it does not. Tools MUST NOT coerce values on read, such as reading the string `"5"` as the integer `5`.
- **Query and index engine internals.** Execution strategy, caching internals, and performance characteristics are implementation concerns, even where future versions define portable query or index contracts.
- **AI behavior.** Agents consume the structural contract; prompts, models, and agent workflows are outside the specification.
- **Identity, authentication, and permissions.** Multi-user access control is out of scope; visibility metadata is tracked separately as a possible future addition.

## Conformance

Conformance evaluates a collection root, represented on disk as a directory tree, against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [Systems, Composition, and Evolution](systems-composition-evolution.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Valid System Definition

A collection root conforms as a valid system definition when:

1. `CR-1` `typedmark.md` is present at the root and valid under [Collection Model](collection-model.md).
2. `CR-2` `typedmark.md` declares the system fields `version` and `scaffold`, valid under [Systems, Composition, and Evolution](systems-composition-evolution.md).
3. `CR-3` `<metadata_directory>/history.md`, if present, is valid under [Systems, Composition, and Evolution](systems-composition-evolution.md) and reconstructs the current schema state when replayed.
4. `CR-4` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note-type schema resolves.
5. `CR-5` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md).
6. `CR-6` Every template referenced by a schema file exists, is valid under [Relationships, Headings, and Templates](relationships-headings-and-templates.md), and has starter frontmatter that conforms to its note type's effective schema.

### Valid Instantiated Collection

A collection root conforms as a valid instantiated collection when:

1. `CR-7` `typedmark.md` is present at the collection root and valid under [Collection Model](collection-model.md).
2. `CR-8` If `typedmark.md` declares `composition`, it is valid under [Collection Model](collection-model.md), and the collection is self-contained so that conformance does not require re-resolving its sources.
3. `CR-9` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from a note type used by managed notes resolves.
4. `CR-10` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md), and every concrete note type used by managed notes resolves to exactly one such schema file.
5. `CR-11` Managed notes resolve to valid concrete note types under the configured note-type mapping rules and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
6. `CR-12` Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
7. `CR-13` Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- `CR-14` Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- `CR-15` A collection root is a system definition when `typedmark.md` declares the system fields, and an instantiated collection when `typedmark.md` governs managed notes; neither requires a separate system or instance manifest.
- `CR-16` A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- `CR-17` Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- `CR-18` Structural precedence across artifacts remains defined in [Foundations](foundations.md).

## Recommended Next Steps

Recommended implementation order:

1. create `typedmark.md` and decide note-type mappings, validation defaults, and default property sets using [Collection Model](collection-model.md)
2. create any reusable property sets and the initial abstract and concrete note type schemas using [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md)
3. create canonical templates and heading and relationship rules using [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md), [Field Definition Reference](field-definition-reference.md), and [Note Links](note-links.md)
5. populate the system fields in `typedmark.md`, and add a `<metadata_directory>/history.md` change log, if you are packaging a reusable, versioned system, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
6. add a validator and importer that evaluate the conformance modes defined on this page
7. implement deterministic system composition that materializes a self-contained collection and records its lineage in `typedmark.md` `composition`, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
8. implement the migration and update flow that recomposes a collection at newer source versions and applies the resulting change operations to managed notes
9. generate the human-facing reference pages from the authoritative artifacts
