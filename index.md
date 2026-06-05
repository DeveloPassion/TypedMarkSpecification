---
title: TypedMark
nav_order: 1
has_children: true
permalink: /
---

# TypedMark

TypedMark is an open specification for typed Markdown note systems.

If you want the motivation behind the spec before the formal rules, start with the [Manifesto](manifesto.md).

## Normative Map

- [Foundations](foundations.md): purpose, design principles, artifact map, and structural precedence
- [Collection Model](collection-model.md): `typedmark.yaml`, property sets, inheritance, and validation defaults
- [System Definitions and Instances](system-definitions-and-instances.md): `.metadata/system.yaml`, `.metadata/instance.yaml`, and profiles
- [Note Type Schemas](note-type-schemas.md): note type registration, effective note-type schema, evaluation pipeline, schema shape, schema kinds, and storage rules
- [Managed Notes and Properties](managed-notes-and-properties.md): managed note contract, field rules, note-link syntax, field materialization, and canonical serialization
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationship semantics, heading constraints, and template requirements
- [Conformance and Roadmap](conformance-and-roadmap.md): non-goals, conformance modes, and implementation order

## Reading Path

1. [Manifesto](manifesto.md)
2. [Foundations](foundations.md)
3. [Collection Model](collection-model.md)
4. [System Definitions and Instances](system-definitions-and-instances.md)
5. [Note Type Schemas](note-type-schemas.md)
6. [Managed Notes and Properties](managed-notes-and-properties.md)
7. [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
8. [Conformance and Roadmap](conformance-and-roadmap.md)

If you want to understand one note type end to end, start with [Note Type Schemas](note-type-schemas.md), especially the effective note-type schema section, then follow the linked rule pages only for the blocks that section references.
