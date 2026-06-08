---
title: Foundations
parent: TypedMark
nav_order: 1
---

# Foundations

This page introduces the high-level concepts of TypedMark first, then describes its purpose, design principles, authoritative artifacts, and structural precedence. Artifact-specific contracts are defined only in the linked pages.

## Core Concepts

### Collection

A TypedMark collection is a governed filesystem tree containing Markdown notes plus the authoritative artifacts that define how those notes are structured. Its structural contract is anchored by the collection configuration at the collection root and by the governed artifacts under the metadata directory named by `typedmark.yaml`.

### Collection Configuration

The collection configuration is the collection-wide structural contract defined in `typedmark.yaml`. It defines collection-level rules such as the metadata directory, note-type mappings, validation defaults, excluded paths, global inheritance inputs, and other defaults that apply across note types. Details: [Collection Model](collection-model.md).

### Note Types

A note type is a named structural class that collection notes can be associated with. Every managed note conforms to exactly one primary note type, and both schema files and the core-defined note frontmatter field, when stored, use the identifier name `note_type`.

### Note Type Configuration (Schemas)

A note type configuration is the schema file for one note type, stored under `<metadata_directory>/schemas/`. It defines the note type's top-level metadata and the structural blocks that govern its notes. Details: [Note Type Schemas](note-type-schemas.md).

### Notes (Collection Content)

The collection content is the set of Markdown notes that belong to the collection as content rather than as TypedMark artifacts. It can include both managed notes and untyped notes.

### Managed Notes

A managed note is a collection note that is associated with exactly one known note type under the note-type association rules defined by this specification version. Managed notes are the subset of notes whose structure, storage location, and conformance are governed by TypedMark. Details: [Managed Notes and Properties](managed-notes-and-properties.md).

### Untyped Notes

An untyped note is a collection note that is not associated with any known note type. Untyped notes MAY exist in a TypedMark collection, but they are outside the managed-note contract and are not validated against note-type schema, storage, relationship, or heading rules unless a future specification version defines additional rules for them.

### Frontmatter and Fields (Metadata / Properties)

A managed note's frontmatter is its YAML metadata surface. Field definitions describe the allowed metadata properties, their types, value constraints, defaulting and materialization behavior, and any typed-relationship contribution. These rules are authoritative on [Managed Notes and Properties](managed-notes-and-properties.md).

### Global Properties

Global properties are collection-level defaults defined in `typedmark.yaml` that can contribute shared `frontmatter`, `relationships`, and `headings` definitions across note types. They apply by default when inheritance is enabled. They are authoritative on [Collection Model](collection-model.md).

### Property Sets

A property set is a named reusable frontmatter field set defined under `<metadata_directory>/property-sets/`. Property sets never apply automatically; a note-type schema opts into them explicitly through `property_sets`. They are authoritative on [Collection Model](collection-model.md).

### Effective Note-Type Schema

The effective note-type schema is the normative result of taking one note-type schema and then applying collection-level inheritance, declared property sets, and local schema definitions in the order defined by this specification. Managed-note conformance is evaluated against that effective schema, not against isolated fragments.

### Relationships, Headings, and Templates

A note type governs more than metadata fields. It also defines typed relationship constraints, heading requirements, and a canonical template reference. These rules are authoritative on [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### System Definitions, Collection Instances, and Profiles

The specification distinguishes collection structure from packaging and instantiation metadata. `<metadata_directory>/system.yaml` defines reusable system-level packaging and scaffolding information, `<metadata_directory>/instance.yaml` defines an instantiated collection's identity and provenance, and profiles may layer starter content and house conventions on top of the core specification. These rules are authoritative on [System Definitions and Instances](system-definitions-and-instances.md).

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
- where notes of each type live
- which frontmatter fields, relationships, headings, and templates each type declares
- how systems and instantiated collections describe packaging, scaffolding, and provenance
- how conformance is evaluated

TypedMark is the structural contract for a note collection. Artifact-specific rules are authoritative only where this specification says they are.

## Design Principles

- The authoritative contract lives in `typedmark.yaml` and the metadata directory named by `typedmark.yaml`.
- One schema file defines one concrete note type.
- TypedMark is strongly typed.
- Agents and tools MUST be able to understand collection structure from `typedmark.yaml` and the configured metadata directory alone.
- Managed notes MUST remain directly readable and editable in any Markdown editor without transformation.
- Managed note metadata MUST live in YAML frontmatter and MUST use property types supported by this specification.
- The core specification defines reusable structure, not domain content.
- Concrete note sets, starter content, and house conventions belong to profiles or reference systems layered on top of the core specification.
- Examples in this specification are illustrative and non-normative unless a rule explicitly says otherwise.

### Spec-Defined Names and Namespaces

TypedMark defines names in several namespaces rather than in one global pool of keys.

Rules:

- A name is spec-defined when this specification assigns it structural meaning in a specific artifact position or metadata namespace.
- Spec-defined names are scoped to the namespace where they are defined. The same spelling MAY be spec-defined in more than one namespace with different roles.
- When this specification defines a name in a namespace, it MUST also define that name's role, where it may appear, and the validation or conformance semantics that follow from its use in that namespace.
- `label`, `description`, and `icon` are already spec-defined in the note-type schema top-level namespace and in the field-definition metadata namespace.
- `catalog.tags` in `<metadata_directory>/system.yaml` and a managed-note frontmatter field named `tags` are different namespaces and MUST NOT be conflated.
- A managed-note frontmatter field named `description` and a field-definition metadata key named `description` are different namespaces and MUST NOT be conflated.
- Extensions, profiles, collection models, property sets, and note-type schemas MUST NOT assign incompatible meanings to a spec-defined name in the namespace where the core specification defines it.
- Mentioning a candidate or example name in prose does not by itself define that name normatively.

## Authoritative Artifact Map

A conforming TypedMark filesystem tree uses this artifact layout:

```text
typedmark.yaml
<metadata_directory>/
  system.yaml
  instance.yaml
  property-sets/
    <property_set>.yaml
  schemas/
    <note_type>.yaml
  templates/
    <note_type_template>.md
```

In path notation below, `<metadata_directory>` is the directory name declared by `typedmark.yaml` `metadata_directory`.

The authoritative contract for each governed element lives in exactly one place:

- `typedmark.yaml`: [Collection Model](collection-model.md)
- `<metadata_directory>/system.yaml`: [System Definitions and Instances](system-definitions-and-instances.md)
- `<metadata_directory>/instance.yaml`: [System Definitions and Instances](system-definitions-and-instances.md)
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
- `<metadata_directory>/system.yaml` governs system identity, packaging, publishing, and import semantics; it does not override note-structure rules defined by `typedmark.yaml` and note-type schemas.
- `<metadata_directory>/instance.yaml` governs instantiated collection identity and provenance; it does not override note-structure rules defined by `typedmark.yaml` and note-type schemas.
