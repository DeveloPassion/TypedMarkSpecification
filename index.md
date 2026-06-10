---
title: TypedMark
nav_order: 1
has_children: true
permalink: /
---

# TypedMark

TypedMark is an open specification for typed Markdown note systems.

If you want the motivation behind the spec, start with the [Manifesto](manifesto.md).

## Index

- [Foundations](foundations.md): purpose, design principles, artifact map, and structural precedence
- [Collection Model](collection-model.md): `typedmark.md`, note-type mappings, property sets, default property sets, property-set composition, composition provenance, and validation defaults
- [Note Type Schemas](note-type-schemas.md): note type registration, abstract note types, note-type inheritance, effective note-type schema, evaluation pipeline, schema shape, schema kinds, and storage rules
- [Managed Notes and Properties](managed-notes-and-properties.md): managed note contract, note-type association, field rules, note-link syntax, field materialization, required-versus-optional field semantics, and managed-note migration
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationship semantics, heading constraints, and template requirements
- [Systems, Composition, and Evolution](systems-composition-evolution.md): system fields in `typedmark.md`, versioning, deterministic composition, change history, and the migration and update flow
- [Conformance and Roadmap](conformance-and-roadmap.md): non-goals, conformance modes, and implementation order

## Reading Path

1. [Manifesto](manifesto.md)
2. [Foundations](foundations.md)
3. [Collection Model](collection-model.md)
4. [Note Type Schemas](note-type-schemas.md)
5. [Managed Notes and Properties](managed-notes-and-properties.md)
6. [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
7. [Systems, Composition, and Evolution](systems-composition-evolution.md)
8. [Conformance and Roadmap](conformance-and-roadmap.md)

## Machine-Readable Schemas

The governed artifacts have machine-readable JSON Schemas, fixtures, and a boundary document under [schema/](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema). The prose specification remains the single source of truth.

## Related Repositories

- [TypedMark](https://github.com/DeveloPassion/TypedMark): the tooling, website, and documentation around the specification
- [TypedMarkExample](https://github.com/DeveloPassion/TypedMarkExample): a concrete system example built on this specification
- [TypedMarkSystemsMarketplace](https://github.com/DeveloPassion/TypedMarkSystemsMarketplace): the systems marketplace, hosting systems, a browsing and composition website under `docs/`, and the `marketplace.json` catalog of known systems defined by this specification
