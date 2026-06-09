---
title: Foundations
parent: TypedMark
nav_order: 1
---

# Foundations

This page introduces the high-level concepts of TypedMark, its purpose, design principles, artifacts, ...

## Core Concepts

### Collection

A TypedMark collection is a rooted set of Markdown notes plus the TypedMark-based artifacts that define how those notes are structured. The main configuration file for a TypedMark collection is called `typedmark.yaml`.

Rules:

- `collection` is the primary abstraction used by this specification.
- A collection root is any directory that contains `typedmark.yaml`.

### Collection Configuration

The collection configuration is the collection-wide structural contract defined in `typedmark.yaml`. It declares the collection's identity (`name`, an optional `label`, `description`, and `keywords`) and collection-level rules such as the metadata directory, note-type mappings, validation defaults, excluded paths, default property sets, composition provenance, and other defaults that apply across note types. Details: [Collection Model](collection-model.md).

### Note Types

A note type is a named structural class that collection notes can be associated with. Note types may be abstract or concrete. Every managed note conforms to exactly one concrete note type, and both schema files and the core-defined note frontmatter field, when stored, use the identifier name `note_type`.

### Note Type Configuration (Schemas)

A note type configuration is the schema file for one note type, stored under `<metadata_directory>/schemas/`. It defines the note type's top-level metadata and the structural blocks that govern its notes or its descendants. Details: [Note Type Schemas](note-type-schemas.md).

### Notes (Collection Content)

The collection content is the set of Markdown notes that belong to the collection as content rather than as TypedMark artifacts. It can include both managed notes and untyped notes.

### Managed Notes

A managed note is a collection note that is associated with exactly one known note type under the note-type association rules defined by this specification version. Managed notes are the subset of notes whose structure, storage location, and conformance are governed by TypedMark. Details: [Managed Notes and Properties](managed-notes-and-properties.md).

### Untyped Notes

An untyped note is a collection note that is not associated with any known note type. Untyped notes MAY exist in a TypedMark collection, but they are outside the managed-note contract and are not validated against note-type schema, storage, relationship, or heading rules unless a future specification version defines additional rules for them.

### Frontmatter and Fields (Metadata / Properties)

A managed note's frontmatter is its YAML metadata surface. Field definitions describe the allowed metadata properties, their types, value constraints, defaulting and materialization behavior, and any typed-relationship contribution. These rules are authoritative on [Managed Notes and Properties](managed-notes-and-properties.md).

### Property Sets

A property set is the single named reusable bundle for shared `frontmatter`, `relationships`, and `headings`, defined under `<metadata_directory>/property-sets/`. A collection applies a property set in two ways: `typedmark.yaml` MAY name default property sets that apply to every note type, and a concrete note-type schema MAY name additional property sets to compose, opt out of specific default property sets, and subtract individual inherited fields. Property sets are authoritative on [Collection Model](collection-model.md).

### Effective Note-Type Schema

The effective note-type schema is the normative result of taking one concrete note-type schema, its abstract ancestor chain through `extends`, and then applying default property sets, composed property sets, and local schema definitions in the order defined by this specification. Managed-note conformance is evaluated against that effective schema, not against isolated fragments.

### Relationships, Headings, and Templates

A note type governs more than metadata fields. It also defines typed relationship constraints, heading requirements, and a canonical template reference. These rules are authoritative on [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Systems, Composition, and Evolution

The specification distinguishes collection structure from the systems that package and evolve it. A system is the domain layer of TypedMark: a collection becomes a reusable, versioned, publishable system by declaring the optional system fields of `typedmark.yaml` — release version, publishing metadata, and scaffold — on top of the domain-agnostic core. There is no separate system manifest. A collection MAY be composed from several systems; the resulting collection is materialized self-contained, and its composition lineage is recorded as provenance in `typedmark.yaml`. `<metadata_directory>/history.yaml` records the event-sourced change history that drives migrating a collection to newer system versions. These rules are authoritative on [Systems, Composition, and Evolution](systems-composition-evolution.md).

### Conformance

Conformance is the process of evaluating whether the required artifacts exist and whether governed artifacts and managed notes satisfy the applicable TypedMark rules. Conformance modes and required artifact sets are defined on [Conformance and Roadmap](conformance-and-roadmap.md).

### Keywords

The uppercase keywords `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY`, `OPTIONAL`, and `RECOMMENDED` in this specification are to be interpreted as described in RFC 2119 and RFC 8174.

Rules:

- Uppercase normative keywords are normative everywhere in this specification.
- Lowercase modal verbs such as "must", "should", "may", "can", and "could" are ordinary English unless they appear inside a quoted example.

### Specification Versioning

`specification_version` identifies the version of the TypedMark core specification that governs an artifact.

Rules:

- `specification_version` MUST be a Semantic Versioning x.y.z string.


## Purpose

TypedMark defines:

- how a collection is configured
- which note types exist and how each type is configured
- which reusable property sets exist
- which collection-wide rules apply
- where notes of each type live and how their note names are formed
- which frontmatter fields, relationships, headings, and templates each type declares
- how systems package, version, compose, scaffold, and evolve collections, and how a collection records its composition provenance
- how conformance is evaluated

TypedMark is the structural contract for a note collection. Artifact-specific rules are authoritative only where this specification says they are.

## Design Principles

- The authoritative contract lives in `typedmark.yaml` and the metadata directory named by `typedmark.yaml`.
- One schema file defines one note type.
- TypedMark is strongly typed.
- Agents and tools MUST be able to understand collection structure from `typedmark.yaml` and the configured metadata directory alone.
- Managed notes MUST remain directly readable and editable in any Markdown editor without transformation.
- Managed note metadata MUST live in YAML frontmatter and MUST use property types supported by this specification.
- The core specification defines reusable structure, not domain content.
- Concrete note sets, starter content, and house conventions belong to systems layered on top of the core specification.
- A collection composed from several systems is materialized self-contained, so it remains understandable from `typedmark.yaml` and the metadata directory alone, without re-resolving its sources.
- Composing the same systems at the same versions MUST reproduce the same collection.
- Examples in this specification are illustrative and non-normative unless a rule explicitly says otherwise.

### Spec-Defined Names and Namespaces

TypedMark defines names in several namespaces rather than in one global pool of keys.

Rules:

- A name is spec-defined when this specification assigns it structural meaning in a specific artifact position or metadata namespace.
- Spec-defined names are scoped to the namespace where they are defined. The same spelling MAY be spec-defined in more than one namespace with different roles.
- When this specification defines a name in a namespace, it MUST also define that name's role, where it may appear, and the validation or conformance semantics that follow from its use in that namespace.
- `label`, `description`, and `icon` are already spec-defined in the `typedmark.yaml` top-level namespace, the note-type schema top-level namespace, and the field-definition metadata namespace.
- `keywords` in `typedmark.yaml` and a managed-note frontmatter field named `tags` are different namespaces and MUST NOT be conflated.
- `name` in the `typedmark.yaml` top-level namespace is the collection identity, while `name` under `publisher` is the publisher's name; they are different namespaces and MUST NOT be conflated.
- A managed-note frontmatter field named `description`, a field-definition metadata key named `description`, the note-type schema top-level `description`, and the collection-level `description` in `typedmark.yaml` are different namespaces and MUST NOT be conflated.
- Extensions, systems, collection models, property sets, and note-type schemas MUST NOT assign incompatible meanings to a spec-defined name in the namespace where the core specification defines it.
- Mentioning a candidate or example name in prose does not by itself define that name normatively.

## Authoritative Artifact Map

A conforming TypedMark collection uses this artifact layout:

```text
typedmark.yaml
<metadata_directory>/
  history.yaml
  property-sets/
    <property_set>.yaml
  schemas/
    <note_type>.yaml
  templates/
    <note_type_template>.md
```

In path notation below, `<metadata_directory>` is the directory name declared by `typedmark.yaml` `metadata_directory`.

The authoritative contract for each governed element lives in exactly one place, except that `typedmark.yaml` is documented by concern: its structural fields are authoritative on [Collection Model](collection-model.md) and its optional system fields are authoritative on [Systems, Composition, and Evolution](systems-composition-evolution.md).

- `typedmark.yaml` structural fields: [Collection Model](collection-model.md)
- `typedmark.yaml` system fields, including release version, publishing metadata, and scaffold: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- `<metadata_directory>/history.yaml`: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- `<metadata_directory>/property-sets/<property_set>.yaml`: [Collection Model](collection-model.md)
- `<metadata_directory>/schemas/<note_type>.yaml`: [Note Type Schemas](note-type-schemas.md)
- `<metadata_directory>/templates/<note_type_template>.md`: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- managed note frontmatter, field definitions, note-link syntax, and field materialization: [Managed Notes and Properties](managed-notes-and-properties.md)
- relationship semantics, heading constraints, and template obligations: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- conformance modes and required artifact sets: [Conformance and Roadmap](conformance-and-roadmap.md)

`typedmark.yaml` MUST live at the root of the managed collection.

When this specification fixes an artifact location by artifact kind, governed artifacts MUST derive that location from the authoritative artifact map above and the `typedmark.yaml` `metadata_directory` value. They MUST NOT restate the same path redundantly elsewhere unless an artifact-specific rule explicitly requires the restated path.

Files outside `typedmark.yaml` and the configured metadata directory MAY exist for humans, publishing, or navigation, but they are not authoritative for structure.

## Authority and Precedence

When two artifacts or surfaces appear to disagree, structural conflicts MUST be resolved in this order:

1. `typedmark.yaml`
2. `<metadata_directory>/schemas/<note_type>.yaml`
3. `<metadata_directory>/property-sets/<property_set>.yaml`
4. `<metadata_directory>/templates/<note_type_template>.md`
5. note contents

Rules:

- Agents MUST rely on `typedmark.yaml` and the configured metadata directory for structural understanding.
- Agents MUST NOT infer note types or structural rules from prose guidance when authoritative artifacts exist.
- Human-facing generated reference pages MAY restate the specification for convenience, but they are never authoritative.
- The system fields of `typedmark.yaml` govern system identity, packaging, publishing, composition, and import semantics; they do not override the note-structure rules defined by the structural fields of `typedmark.yaml` and note-type schemas.
- `<metadata_directory>/history.yaml` governs the system's change history and the migration of collections to newer versions; it does not override the live note-structure rules defined by `typedmark.yaml` and note-type schemas.
- A collection's composition provenance in `typedmark.yaml` records how the collection was built but does not override any governed artifact physically present under the metadata directory.
