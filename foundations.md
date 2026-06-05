---
title: Foundations
parent: TypedMark
nav_order: 1
---

# Foundations

This page is authoritative for the purpose of TypedMark, its design principles, the authoritative artifact map, and structural precedence. Artifact-specific contracts are defined only in the linked pages.

## 1. Purpose

TypedMark defines:

- which note types exist
- which reusable property sets exist
- which collection-wide rules apply
- where notes of each type live
- which metadata fields each type requires or allows
- which relationship constraints each type declares
- which heading constraints each type declares
- which templates define canonical starter structure
- how governed artifacts are serialized
- how conformance is evaluated

TypedMark is the structural contract for a note collection. Artifact-specific rules are authoritative only where this specification says they are.

## 2. Design Principles

- The authoritative contract lives in `typedmark.yaml` and `.metadata/`.
- One schema file defines one concrete note type.
- TypedMark is strongly typed.
- Agents and tools MUST be able to understand collection structure from `typedmark.yaml` and `.metadata/` alone.
- Managed notes MUST remain directly readable and editable in any Markdown editor without transformation.
- Managed note metadata MUST live in YAML frontmatter and MUST use property types supported by this specification.
- The core specification defines reusable structure, not domain content.
- Concrete note sets, starter content, and house conventions belong to profiles or reference systems layered on top of the core specification.
- Examples in this specification are illustrative and non-normative unless a rule explicitly says otherwise.

### Normative Keywords

The uppercase keywords `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY`, `OPTIONAL`, and `RECOMMENDED` in this specification are to be interpreted as described in RFC 2119 and RFC 8174.

Rules:

- Uppercase normative keywords are normative everywhere in this specification.
- Lowercase modal verbs such as "must", "should", "may", "can", and "could" are ordinary English unless they appear inside a quoted example.

### Specification Versioning

`specification_version` identifies the version of the TypedMark core specification that governs an artifact.

Rules:

- `specification_version` MUST be a Semantic Versioning x.y.z string.

## 3. Authoritative Artifact Map

A conforming TypedMark filesystem tree uses this artifact layout:

```text
typedmark.yaml
.metadata/
  system.yaml
  instance.yaml
  property-sets/
    <property_set>.yaml
  schemas/
    <note_type>.yaml
  templates/
    <note_type>.md
```

The authoritative contract for each governed element lives in exactly one place:

- `typedmark.yaml`: [Collection Model](collection-model.md)
- `.metadata/system.yaml`: [System Definitions and Instances](system-definitions-and-instances.md)
- `.metadata/instance.yaml`: [System Definitions and Instances](system-definitions-and-instances.md)
- `.metadata/property-sets/<property_set>.yaml`: [Collection Model](collection-model.md)
- `.metadata/schemas/<note_type>.yaml`: [Note Type Schemas](note-type-schemas.md)
- `.metadata/templates/<note_type>.md`: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- managed note frontmatter, field definitions, note-link syntax, field materialization, and canonical serialization: [Managed Notes and Properties](managed-notes-and-properties.md)
- relationship semantics, heading constraints, and template obligations: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- conformance modes and required artifact sets: [Conformance and Roadmap](conformance-and-roadmap.md)

`typedmark.yaml` MUST live at the root of the managed collection, such as the root folder of an Obsidian vault.

Files outside `typedmark.yaml` and `.metadata/` MAY exist for humans, publishing, or navigation, but they are not authoritative for structure.

## 4. Authority and Precedence

When two artifacts or surfaces appear to disagree, structural conflicts MUST be resolved in this order:

1. `typedmark.yaml`
2. `.metadata/schemas/<note_type>.yaml`
3. `.metadata/property-sets/<property_set>.yaml`
4. `.metadata/templates/<note_type>.md`
5. note contents
6. human-facing generated reference pages

Rules:

- Agents MUST rely on `typedmark.yaml` and `.metadata/` for structural understanding.
- Agents MUST NOT infer note types or structural rules from prose guidance when authoritative artifacts exist.
- Human-facing generated reference pages MAY restate the specification for convenience, but they are never authoritative.
- `.metadata/system.yaml` governs system identity, packaging, publishing, and import semantics; it does not override note-structure rules defined by `typedmark.yaml` and note-type schemas.
- `.metadata/instance.yaml` governs instantiated collection identity and provenance; it does not override note-structure rules defined by `typedmark.yaml` and note-type schemas.
