---
title: TypedMark
nav_order: 0
has_children: true
permalink: /
audience: essentials
---

# TypedMark

Audience: everyone.

See also:

- [Manifesto](manifesto.md): the motivation for TypedMark
- [Getting Started](getting-started.md): a non-normative first collection
- [Foundations](foundations.md): the first normative specification page

TypedMark is an open specification for typed Markdown note systems.

**Current edition: 0.1.0 draft.** This edition is under development and is not
yet released. The refocusing work is tracked in
[#123](https://github.com/DeveloPassion/TypedMarkSpecification/issues/123).
See the [0.1.0 migration checklist](schema/docs/migration-0.1.md) for intentional compatibility changes.

### Changes in this draft

- Pre-1.0 minor lines are separate compatibility boundaries. Implementing
  `0.1.x` does not imply support for `0.0.x`; patch changes remain compatible.
- Templates take their specification version from their referencing concrete
  schema rather than storing it in starter note frontmatter.
- Required extensions use an exact-version map; validation reports distinguish
  complete interpretation from unsupported or deliberately limited evaluation.
- Unknown artifact-structure keys are errors under implemented contracts;
  explicitly scoped `x_*` metadata provides an inert carrier instead.

The authoritative rules are in
[Specification Versioning](foundations.md#specification-versioning),
[Extensions and Capabilities](extensions.md), and
[Validation Reports](conformance-and-roadmap.md#validation-reports). Other
decisions recorded in the epic remain planned until their corresponding
contracts land; this summary does not itself change those contracts.

New here? Read the [Manifesto](manifesto.md) for the why, then follow [Getting Started](getting-started.md) to build your first Core Profile collection in five minutes. The [Quick Reference](quick-reference.md) maps terms and everyday tasks to the rules that govern them.

## The Pages

- [Manifesto](manifesto.md): why note types matter
- [Getting Started](getting-started.md): your first typed collection, step by step (non-normative)
- [Foundations](foundations.md): the core concepts, the file format of governed artifacts, and the parsing baselines everything else builds on
- [Extensions and Capabilities](extensions.md): required optional contracts, capability matching, and inert vendor metadata
- [Collection Model](collection-model.md): collection configuration, mappings, vocabularies, and shared path matching
- [Note Type Schemas](note-type-schemas.md): local note-type definitions, storage, naming, and effective-schema construction
- [Field Definition Reference](field-definition-reference.md): every property a field can declare
- [Field Compatibility and Conversion](field-conversions.md): an optional shared contract for queries, datasets, and migrations
- [Managed Notes and Properties](managed-notes-and-properties.md): managed-note metadata and field materialization
- [Note Links](note-links.md): how links between notes are written and resolved
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): relationships, body headings, and starter templates
- [Schema Reuse](schema-reuse.md) and [Property Sets](property-sets.md): optional inheritance, shared blocks, and conditional constraints
- [Portable Queries](queries.md) and [Datasets and Views](datasets-and-views.md): optional querying and presentation contracts
- [Expressions](expressions.md) and [Authoring](authoring.md): optional derivation, extra generators, and immutability
- [Template Tracking](template-tracking.md) and [Content Expansion](content-expansion.md): optional tracked and derived body content
- [Automation Artifacts](automation-artifacts.md), [Automation Runtime](automation-runtime.md), and [Automation Interchange](automation-reports.md): optional automation declarations and execution
- [Systems, Composition, and Evolution](systems-composition-evolution.md): packaging a collection as a shareable, versioned, composable system
- [Migration Effects](migration-effects.md): what happens to existing notes when a system changes
- [Marketplace Catalog](marketplace-catalog.md): the companion distribution contract
- [Conformance and Roadmap](conformance-and-roadmap.md): what it means for a tool or collection to conform
- [Quick Reference](quick-reference.md): glossary and "how do I…" index (non-normative)

## Reading Paths

**Core Profile** — the shortest conforming path:

1. [Manifesto](manifesto.md)
2. [Getting Started](getting-started.md)
3. [Foundations](foundations.md)
4. [Collection Model](collection-model.md) for `typedmark.md` identity and defaults
5. [Note Type Schemas](note-type-schemas.md) for one concrete note type and the effective schema
6. [Managed Notes and Properties](managed-notes-and-properties.md), with the [Field Definition Reference](field-definition-reference.md) at hand
7. [Note Links](note-links.md) and [Relationships, Headings, and Templates](relationships-headings-and-templates.md) for links, headings, and starter templates

**Essentials plus reuse** — for larger personal or team collections:

8. [Collection Model](collection-model.md) for mappings and vocabularies, then [Property Sets](property-sets.md) when shared blocks are needed
9. [Schema Reuse](schema-reuse.md) for abstract inheritance and conditions; query and presentation contracts are separate optional reading

**Advanced** — for publishing, composing, and migrating systems:

10. [Systems, Composition, and Evolution](systems-composition-evolution.md)
11. [Migration Effects](migration-effects.md)

**Tool authors** — for implementing validators, importers, and editors:

12. [Conformance and Roadmap](conformance-and-roadmap.md)
13. The parsing and matching baselines in [Foundations](foundations.md) and the [machine-readable schemas](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema)
14. [Extensions and Capabilities](extensions.md) for interpreting declarations and reporting unsupported contracts

## Machine-Readable Schemas

The governed artifacts have machine-readable JSON Schemas, fixtures, and a boundary document under [schema/](https://github.com/DeveloPassion/TypedMarkSpecification/tree/main/schema). The prose specification remains the single source of truth.

## Related Repositories

- [TypedMark](https://github.com/DeveloPassion/TypedMark): the tooling, website, and documentation around the specification
- [TypedMarkExample](https://github.com/DeveloPassion/TypedMarkExample): a concrete system example built on this specification
- [TypedMarkSystemsMarketplace](https://github.com/DeveloPassion/TypedMarkSystemsMarketplace): the systems marketplace, hosting systems, a browsing and composition website under `docs/`, and the `marketplace.json` catalog of known systems defined by this specification
