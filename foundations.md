---
title: Foundations
parent: TypedMark
nav_order: 1
---

# Foundations

This page introduces the high-level concepts of TypedMark, its purpose, design principles, artifacts, ...

## Core Concepts

### Collection

A TypedMark collection is a rooted set of Markdown notes plus the TypedMark-based artifacts that define how those notes are structured. The main configuration file for a TypedMark collection is called `typedmark.md`.

Rules:

- `collection` is the primary abstraction used by this specification.
- A collection root is any directory that contains `typedmark.md`.

### Collection Configuration

The collection configuration is the collection-wide structural contract defined in `typedmark.md`. It declares the collection's identity (`name`, an optional `label`, `description`, and `keywords`) and collection-level rules such as the metadata directory, note-type mappings, validation defaults, excluded paths, default property sets, composition provenance, and other defaults that apply across note types. Details: [Collection Model](collection-model.md).

### Note Types

A note type is a named structural class that collection notes can be associated with. Note types may be abstract or concrete. Every managed note conforms to exactly one concrete note type, and both schema files and the core-defined note frontmatter field, when stored, use the identifier name `note_type`.

### Note Type Configuration (Schemas)

A note type configuration is the schema file for one note type, stored under `<metadata_directory>/schemas/`. It defines the note type's top-level metadata and the structural blocks that govern its notes or its descendants. Details: [Note Type Schemas](note-type-schemas.md).

### Notes (Collection Content)

The collection content is the set of Markdown notes and assets that belong to the collection as content rather than as TypedMark artifacts. Its notes can include both managed notes and untyped notes.

### Managed Notes

A managed note is a collection note that is associated with exactly one known note type under the note-type association rules defined by this specification version. Managed notes are the subset of notes whose structure, storage location, and conformance are governed by TypedMark. Details: [Managed Notes and Properties](managed-notes-and-properties.md).

### Untyped Notes

An untyped note is a collection note that is not associated with any known note type. Untyped notes MAY exist in a TypedMark collection, but they are outside the managed-note contract and are not validated against note-type schema, storage, relationship, or heading rules unless a future specification version defines additional rules for them.

### Assets

An asset is a collection file that is not a Markdown note and not a TypedMark artifact — an image, a PDF, an audio file, or any other resource referenced by notes. Assets are collection content, but they are not collection notes: they are not evaluated for note-type mapping, carry no frontmatter, and create no typed relationship instances. Asset links are defined in [Managed Notes and Properties](managed-notes-and-properties.md), and the optional `assets_directory` is defined in [Collection Model](collection-model.md).

### Frontmatter and Fields (Metadata / Properties)

A managed note's frontmatter is its YAML metadata surface. Field definitions describe the allowed metadata properties, their types, value constraints, defaulting and materialization behavior, and any typed-relationship contribution. These rules are authoritative on [Managed Notes and Properties](managed-notes-and-properties.md).

### Property Sets

A property set is the single named reusable bundle for shared `frontmatter`, `relationships`, and `headings`, defined under `<metadata_directory>/property-sets/`. A collection applies a property set in two ways: `typedmark.md` MAY name default property sets that apply to every note type, and a concrete note-type schema MAY name additional property sets to compose, opt out of specific default property sets, and subtract individual inherited fields. Property sets are authoritative on [Collection Model](collection-model.md).

### Effective Note-Type Schema

The effective note-type schema is the normative result of taking one concrete note-type schema, its abstract ancestor chain through `extends`, and then applying default property sets, composed property sets, and local schema definitions in the order defined by this specification. Managed-note conformance is evaluated against that effective schema, not against isolated fragments.

### Relationships, Headings, and Templates

A note type governs more than metadata fields. It also defines typed relationship constraints, heading requirements, and a canonical template reference. These rules are authoritative on [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Systems, Composition, and Evolution

The specification distinguishes collection structure from the systems that package and evolve it. A system is the domain layer of TypedMark: a collection becomes a reusable, versioned, publishable system by declaring the optional system fields of `typedmark.md` — release version, publishing metadata, and scaffold — on top of the domain-agnostic core. There is no separate system manifest. A collection MAY be composed from several systems; the resulting collection is materialized self-contained, and its composition lineage is recorded as provenance in `typedmark.md`. `<metadata_directory>/history.md` records the event-sourced change history that drives migrating a collection to newer system versions. These rules are authoritative on [Systems, Composition, and Evolution](systems-composition-evolution.md).

### Conformance

Conformance is the process of evaluating whether the required artifacts exist and whether governed artifacts and managed notes satisfy the applicable TypedMark rules. Conformance modes and required artifact sets are defined on [Conformance and Roadmap](conformance-and-roadmap.md).

### Keywords

The uppercase keywords `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY`, `OPTIONAL`, and `RECOMMENDED` in this specification are to be interpreted as described in RFC 2119 and RFC 8174.

Rules:

- Uppercase normative keywords are normative everywhere in this specification.
- Lowercase modal verbs such as "must", "should", "may", "can", and "could" are ordinary English unless they appear inside a quoted example.

### Specification Versioning

`specification_version` identifies the version of the TypedMark core specification that governs an artifact. It is distinct from a system's release `version` and from the change history in `<metadata_directory>/history.md`, both defined in [Systems, Composition, and Evolution](systems-composition-evolution.md): `specification_version` versions the specification itself, while `version` and `history.md` version a system built with it.

The specification's own version uses Semantic Versioning change classes:

- MAJOR: a breaking change to the specification. An artifact valid under an earlier major MAY be invalid under a new major.
- MINOR: a backward-compatible addition, such as a new optional field, property type, or construct. An artifact valid under `x.y` remains valid under `x.(y+1)`.
- PATCH: an editorial clarification that does not change structural requirements.

Rules:

- `specification_version` MUST be a Semantic Versioning x.y.z string.
- Every governed artifact declares its own `specification_version` in its frontmatter, and each artifact is evaluated under the rules of the version it declares.
- Governed artifacts in one collection MAY declare different `specification_version` values, because composition MAY combine artifacts authored against different specification versions; each artifact is evaluated under its own declared version.
- A tool MUST advertise the specification major version, and the highest minor within it, that it implements.
- Within a single major, the specification is additive and forward-compatible: a tool MUST evaluate an artifact whose declared minor is less than or equal to the tool's implemented minor under that artifact's declared version.
- If an artifact declares a minor greater than the tool's implemented minor within a major the tool implements, the tool MUST evaluate it on a best-effort basis under the highest minor it implements, MUST NOT reject it solely because the minor is newer, and SHOULD report constructs it does not recognize as warnings rather than errors.
- A construct introduced by a newer minor that a tool does not recognize MUST be reported under `unknown_field` or as an unrecognized construct; it MUST NOT be silently accepted as structure the tool understands.
- If an artifact declares a major the tool does not implement, the tool MUST NOT assert conformance for that artifact and MUST report `unsupported_specification_version`, as defined in [Collection Model](collection-model.md).
- The specification MAY mark a feature deprecated in a minor release and MAY remove it only in a subsequent major release.
- A major release of the specification MUST document the breaking changes it introduces, so that migration tools can transform artifacts from the previous major to the new one.
- Migrating a system's own schemas across its releases uses `history.md` and the migration flow defined in [Systems, Composition, and Evolution](systems-composition-evolution.md); that mechanism is independent of `specification_version`.


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

- The authoritative contract lives in `typedmark.md` and the metadata directory named by `typedmark.md`.
- One schema file defines one note type.
- TypedMark is strongly typed.
- Agents and tools MUST be able to understand collection structure from `typedmark.md` and the configured metadata directory alone.
- Managed notes MUST remain directly readable and editable in any Markdown editor without transformation.
- Managed note metadata MUST live in YAML frontmatter and MUST use property types supported by this specification.
- The core specification defines reusable structure, not domain content.
- Concrete note sets, starter content, and house conventions belong to systems layered on top of the core specification.
- A collection composed from several systems is materialized self-contained, so it remains understandable from `typedmark.md` and the metadata directory alone, without re-resolving its sources.
- Composing the same systems at the same versions MUST reproduce the same collection.
- Examples in this specification are illustrative and non-normative unless a rule explicitly says otherwise.

### Spec-Defined Names and Namespaces

TypedMark defines names in several namespaces rather than in one global pool of keys.

Rules:

- A name is spec-defined when this specification assigns it structural meaning in a specific artifact position or metadata namespace.
- Spec-defined names are scoped to the namespace where they are defined. The same spelling MAY be spec-defined in more than one namespace with different roles.
- When this specification defines a name in a namespace, it MUST also define that name's role, where it may appear, and the validation or conformance semantics that follow from its use in that namespace.
- `label`, `description`, and `icon` are already spec-defined in the `typedmark.md` top-level namespace, the note-type schema top-level namespace, and the field-definition metadata namespace.
- `keywords` in `typedmark.md` and a managed-note frontmatter field named `tags` are different namespaces and MUST NOT be conflated.
- `name` in the `typedmark.md` top-level namespace is the collection identity, while `name` under `publisher` is the publisher's name; they are different namespaces and MUST NOT be conflated.
- A managed-note frontmatter field named `description`, a field-definition metadata key named `description`, the note-type schema top-level `description`, and the collection-level `description` in `typedmark.md` are different namespaces and MUST NOT be conflated.
- Extensions, systems, collection models, property sets, and note-type schemas MUST NOT assign incompatible meanings to a spec-defined name in the namespace where the core specification defines it.
- Mentioning a candidate or example name in prose does not by itself define that name normatively.

## Parsing and Matching Baselines

Conforming tools must parse and match the same inputs the same way. This section pins the cross-cutting baselines; artifact-specific rules state where each baseline applies.

### YAML Baseline

Rules:

- Governed artifact frontmatter and managed-note frontmatter are parsed as YAML 1.2 using the core schema.
- YAML 1.1 boolean spellings such as `yes`, `no`, `on`, and `off` are strings under this baseline, not booleans.
- A duplicate key within one YAML mapping makes the containing document invalid.
- Governed artifacts and managed notes MUST be encoded as UTF-8; a leading byte-order mark, when present, MUST be ignored.

### Regular Expression Dialect

Rules:

- Every regular expression on a governed surface — the `regex` field constraint, `when.path.regex`, and `when.frontmatter` `regex` predicates — uses the ECMAScript (ECMA-262) regular expression dialect.
- Whether a pattern is matched against the entire value or searched within it is defined by each declaring rule.
- A pattern that is not a valid ECMA-262 regular expression makes its declaring artifact invalid.

### Frontmatter Block Grammar

This grammar defines how the YAML frontmatter block of any Markdown file — managed notes and governed artifacts alike — is recognized.

Rules:

- A Markdown file has frontmatter when its first line is exactly `---`, ignoring a leading byte-order mark per the YAML baseline above.
- The frontmatter block ends at the next subsequent line that is exactly `---` or `...`.
- If no closing line exists, the file has no frontmatter.
- A file has at most one frontmatter block; any later delimiter lines are ordinary body content.
- The frontmatter block content MUST parse as a YAML mapping under the YAML baseline above; an empty block is an empty mapping.
- If the block content parses as a non-mapping YAML document, the file has no valid frontmatter.

### Unicode Normalization and String Comparison

Rules:

- Every exact string comparison defined by this specification compares Unicode code points after normalizing both operands to Normalization Form C (NFC).
- This applies wherever this specification compares stored strings, including `unique` equality, `allowed_values` and `const_value` equality, frontmatter mapping `equals` predicates on strings, note-link target, `id`, file-name, and alias comparison, and heading-text comparison.
- String comparisons are case-sensitive; this specification defines no case folding.
- Code-point counts, such as `min` and `max` on text values, count the code points of the NFC-normalized value.
- Spec-defined identifier grammars, such as collection names, slugs, and field names, restrict their values to ASCII, so normalization does not alter them.
- Regular-expression matching operates on the NFC-normalized value.

## Governed Artifact Format

Every governed TypedMark artifact — `typedmark.md`, the note-type schemas, the property sets, and `history.md` — is a Markdown file with YAML frontmatter.

Rules:

- A governed artifact's frontmatter is its governed content. When this specification says an artifact contains, declares, or defines a key, it refers to that artifact's frontmatter.
- A governed artifact MUST have a frontmatter block under the Frontmatter Block Grammar defined above; an artifact without valid frontmatter is invalid.
- The artifact body is non-normative explanatory content for humans and agents. Tools MUST ignore it for structural reasoning and MUST preserve it when rewriting the artifact's frontmatter.
- The artifact body MUST NOT be required to understand or evaluate collection structure; everything structural lives in frontmatter.
- Governed artifact files are not collection notes: they are not evaluated for note-type mapping, are not candidates for note-link resolution, and are not validated as managed notes.
- `typedmark.md` at the collection root is reserved for the collection configuration; a managed note MUST NOT resolve its storage path to `typedmark.md`.
- Templates under `<metadata_directory>/templates/` are governed artifacts with their own contract: their frontmatter is starter note frontmatter and their body is starter note content, as defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Examples of governed artifacts in this specification show frontmatter content unless frontmatter delimiters are shown.

A complete minimal `typedmark.md`, showing the governed frontmatter together with a free-form body:

```markdown
---
specification_version: 0.0.1
name: example-knowledge-base
description: Personal knowledge base.
metadata_directory: .typedmark
exclude_paths:
  - .git/**
validation_defaults: {}
---

# Example Knowledge Base

Everything above the closing delimiter is the governed collection
configuration. This body is free Markdown: use it to explain the
collection to humans and agents. Tools ignore it for structural
reasoning and preserve it when they rewrite the frontmatter.
```

## Authoritative Artifact Map

A conforming TypedMark collection uses this artifact layout:

```text
typedmark.md
<metadata_directory>/
  history.md
  property-sets/
    <property_set>.md
  schemas/
    <note_type>.md
  templates/
    <note_type_template>.md
```

In path notation below, `<metadata_directory>` is the directory name declared by `typedmark.md` `metadata_directory`.

The authoritative contract for each governed element lives in exactly one place, except that `typedmark.md` is documented by concern: its structural fields are authoritative on [Collection Model](collection-model.md) and its optional system fields are authoritative on [Systems, Composition, and Evolution](systems-composition-evolution.md).

- `typedmark.md` structural fields: [Collection Model](collection-model.md)
- `typedmark.md` system fields, including release version, publishing metadata, and scaffold: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- `<metadata_directory>/history.md`: [Systems, Composition, and Evolution](systems-composition-evolution.md)
- `<metadata_directory>/property-sets/<property_set>.md`: [Collection Model](collection-model.md)
- `<metadata_directory>/schemas/<note_type>.md`: [Note Type Schemas](note-type-schemas.md)
- `<metadata_directory>/templates/<note_type_template>.md`: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- managed note frontmatter, field definitions, note-link syntax, and field materialization: [Managed Notes and Properties](managed-notes-and-properties.md)
- relationship semantics, heading constraints, and template obligations: [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
- conformance modes and required artifact sets: [Conformance and Roadmap](conformance-and-roadmap.md)

`typedmark.md` MUST live at the root of the managed collection.

When this specification fixes an artifact location by artifact kind, governed artifacts MUST derive that location from the authoritative artifact map above and the `typedmark.md` `metadata_directory` value. They MUST NOT restate the same path redundantly elsewhere unless an artifact-specific rule explicitly requires the restated path.

Files outside `typedmark.md` and the configured metadata directory MAY exist for humans, publishing, or navigation, but they are not authoritative for structure.

## Authority and Precedence

When two artifacts or surfaces appear to disagree, structural conflicts MUST be resolved in this order:

1. `typedmark.md`
2. `<metadata_directory>/schemas/<note_type>.md`
3. `<metadata_directory>/property-sets/<property_set>.md`
4. `<metadata_directory>/templates/<note_type_template>.md`
5. note contents

Rules:

- Agents MUST rely on `typedmark.md` and the configured metadata directory for structural understanding.
- Agents MUST NOT infer note types or structural rules from prose guidance when authoritative artifacts exist.
- Human-facing generated reference pages MAY restate the specification for convenience, but they are never authoritative.
- The system fields of `typedmark.md` govern system identity, packaging, publishing, composition, and import semantics; they do not override the note-structure rules defined by the structural fields of `typedmark.md` and note-type schemas.
- `<metadata_directory>/history.md` governs the system's change history and the migration of collections to newer versions; it does not override the live note-structure rules defined by `typedmark.md` and note-type schemas.
- A collection's composition provenance in `typedmark.md` records how the collection was built but does not override any governed artifact physically present under the metadata directory.
