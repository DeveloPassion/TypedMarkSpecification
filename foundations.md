---
title: Foundations
parent: TypedMark
nav_order: 2
audience: essentials
---

# Foundations

Audience: everyone — start here after the [Manifesto](manifesto.md).

Authoritative for:

- the core concepts and the vocabulary the other pages build on
- specification versioning, parsing and matching baselines, and string comparison
- the governed artifact format, the artifact map, and structural precedence
- the authoring profiles and the distinction between authored shorthand and effective canonical values

See also:

- [Collection Model](collection-model.md): the structural fields of `typedmark.md`
- [Extensions and Capabilities](extensions.md): required optional contracts and inert vendor metadata
- [Expressions](expressions.md): the optional shared expression language and computed fields
- [Note Type Schemas](note-type-schemas.md): effective note-type schemas
- [Conformance and Roadmap](conformance-and-roadmap.md): conformance modes and artifact sets

## Purpose

Core answers three questions from the files at rest: what type a note has,
whether it conforms to that type, and where it belongs. Its contract is defined
positively by the following concerns, not by subtracting a growing list of
features from the whole specification.

| Core concern | Authoritative contract |
| --- | --- |
| Collection configuration and boundaries | [Collection Model](collection-model.md) |
| Local concrete note types and effective schemas | [Note Type Schemas](note-type-schemas.md) |
| Field types, constraints, and deterministic defaults | [Field Definition Reference](field-definition-reference.md) |
| Managed notes, core fields, and effective values | [Managed Notes and Properties](managed-notes-and-properties.md) |
| Storage and archive placement | [Note Type Schemas](note-type-schemas.md#storage-rules) |
| Internal note links and resolution | [Note Links](note-links.md) |
| Relationships and body headings | [Relationships, Headings, and Templates](relationships-headings-and-templates.md) |
| Optional starter templates and derivation | [Relationships, Headings, and Templates](relationships-headings-and-templates.md#templates) |
| Parsing, matching, and version interpretation | This page |
| Conformance and required-capability reporting | [Conformance](conformance-and-roadmap.md) and [Extensions](extensions.md) |

Vocabularies belong to Core. All abstract inheritance, property-set composition,
and conditional constraints belong to Reuse. Queries, views, automation,
expressions, extended authoring, tracking, expansion, and systems are optional
contracts, not prerequisites for a Core validator.

For example, a collection with one local concrete schema and no optional
contracts can be validated without a query engine, event processor, or system
resolver. A collection that declares an unsupported contract receives an
incomplete report rather than a full-conformance claim.

## Core Concepts

| Term | Meaning |
| --- | --- |
| Collection | A rooted set of notes, assets, and governing artifacts |
| Configuration | `typedmark.md`, declaring identity and collection-wide settings |
| Note type | A named structural contract; managed notes use concrete types |
| Schema | The Markdown artifact defining one note type |
| Managed note | A collection note associated with a known concrete schema |
| Untyped note | A note outside Core's managed-note constraints; explicit extensions can govern other surfaces |
| Asset | Content that is neither a Markdown note nor a governed artifact |
| Frontmatter | The note's YAML metadata surface |
| Effective schema | Local definitions plus enabled reuse and deterministic defaults |
| Effective record | Stored note values plus applicable deterministic defaults |
| Property set | An optional reusable field/relationship/heading bundle |
| Dataset or view | An optional query or presentation contract |
| System | A reusable, versioned collection model with optional publishing/composition contracts |
| Conformance | Evaluation of the applicable contracts, with explicit completeness and findings |

Rules:

- `FND-2` A collection root is any directory that contains `typedmark.md`.

The authoritative artifact map below links each concern to its owner. For
example, a collection can contain untyped prose notes beside managed project
notes without turning all prose into schema definitions.


## Keywords

Rules:

- `FND-3` The uppercase keywords `MUST`, `MUST NOT`, `REQUIRED`, `SHOULD`, `SHOULD NOT`, `MAY`, `OPTIONAL`, and `RECOMMENDED` are normative and are interpreted as described in RFC 2119 and RFC 8174.

## Specification Versioning

`specification_version` selects an artifact's Core contract. System release
versions and history are separate, as defined in [Systems](systems-composition-evolution.md).

The specification's own version uses Semantic Versioning change classes. A
*compatibility line* is one major version from `1.0.0` onward, or one `0.MINOR`
line before `1.0.0`. For example, `0.0.x` and `0.1.x` are different compatibility
lines, while `1.2.x` and `1.3.x` belong to the same line.

- MAJOR: a new compatibility line that can introduce breaking changes.
- MINOR: before `1.0.0`, a new compatibility line that can introduce breaking
  changes; from `1.0.0` onward, a backward-compatible addition such as a new
  optional field, property type, or construct.
- PATCH: a compatible editorial clarification that does not change structural
  requirements.

For example, `0.1.0` support does not imply `0.0.1` or `0.2.0` support.
`0.1.1` remains in the same compatibility line.

Rules:

- `FND-5` `specification_version` MUST be a Semantic Versioning x.y.z string.
- `FND-6` Every governed artifact other than a template declares its own `specification_version` in its frontmatter, and each artifact is evaluated under the rules of the version it declares.
- `FND-89` A template MUST be evaluated under the specification version declared by the concrete note-type schema that references it.
- `FND-7` Governed artifacts in one collection MAY declare different `specification_version` values, because composition MAY combine artifacts authored against different specification versions; each artifact is evaluated under its own declared version.
- `FND-8` A tool MUST advertise each specification compatibility line it implements together with the highest specification version it implements within that line.
- `FND-9` Within an implemented compatibility line, a tool MUST evaluate an artifact whose declared version is less than or equal to its highest implemented version under that artifact's declared version.
- `FND-10` If an artifact declares a newer version within a compatibility line the tool implements, the tool MUST evaluate it on a best-effort basis under its highest implemented version in that line.
- `FND-90` A tool MUST NOT classify an artifact as invalid solely because its version is newer within an implemented compatibility line.
- `FND-91` During best-effort evaluation of a newer version in an implemented compatibility line, a tool SHOULD report constructs it does not recognize as warnings rather than errors.
- `FND-11` A construct introduced by a newer version that a tool does not recognize MUST be reported under `unknown_field` or as an unrecognized construct; it MUST NOT be silently accepted as structure the tool understands.
- `FND-12` If an artifact declares a compatibility line the tool does not implement, the tool MUST NOT assert conformance for that artifact.
- `FND-92` A tool MUST report an artifact in an unimplemented compatibility line as `unsupported_specification_version`, as defined in [Collection Model](collection-model.md).
- `FND-13` A deprecated feature MUST NOT be removed until a subsequent compatibility line.
- `FND-14` A release that starts a new compatibility line MUST document the breaking changes it introduces, so that migration tools can transform artifacts from the previous line to the new one.
- `FND-15` Migrating a system's own schemas across its releases uses `history.md` and the migration flow defined in [Systems, Composition, and Evolution](systems-composition-evolution.md); that mechanism is independent of `specification_version`.


## Authoring Profiles and Canonical Expansion

Authors can omit defined defaults; tools expand them before conformance.
Optional contracts extend rather than replace Core.

Here, *canonical expansion* means filling deterministic defaults in governed artifacts. It is distinct from the marker-delimited *content expansion* defined in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion), which materializes derived Markdown inside note and template bodies.

Core is the minimal instantiated-collection profile. Reuse and Systems add
only the capabilities explicitly used; they do not form a compulsory ladder.

Rules:

- `FND-74` The Core Profile is the minimal authoring profile for a conforming instantiated collection.
- `FND-75` A Core Profile collection MUST declare `typedmark.md`.
- `FND-76` A Core Profile collection MUST declare at least one concrete note-type schema.
- `FND-77` A collection MUST satisfy the explicit-reference and derived-template obligations in [Templates](relationships-headings-and-templates.md#templates).
- `FND-95` Core conformance MUST be evaluated against the positive Core concern set above.
- `FND-79` Authoring shorthand is a governed artifact shape that omits a value only when the authoritative rule for that key defines one deterministic effective default.
- `FND-80` A conforming tool MUST expand omitted shorthand defaults before computing effective note-type schemas, storage paths, template paths, validation severities, relationship constraints, heading constraints, or conformance results.
- `FND-81` Canonical expansion MUST NOT invent domain content or undeclared structure; explicitly specified deterministic derivation, including template starter state, remains permitted.
- `FND-82` When a shorthand key is physically present, its stored value overrides the default defined for that key.
- `FND-83` Canonical serialization of governed artifacts MAY write expanded defaults physically, but handwritten artifacts are not required to store defaulted keys unless an artifact-specific rule says the key is physically required.

## Design Principles

Files remain readable and app-independent. The root configuration and metadata
directory carry the structural contract; concrete domain content belongs to
systems, not Core. Composition is reproducible and materialized collections
remain self-contained. Examples are illustrative unless explicitly stated
otherwise.

### Spec-Defined Names and Namespaces

TypedMark defines names in several namespaces rather than in one global pool of
keys. A spec-defined name has structural meaning in a particular artifact
position; the same spelling can have a different role in another position.

Rules:

- `FND-23` Extensions, systems, collection models, property sets, and note-type schemas MUST NOT assign incompatible meanings to a spec-defined name in the namespace where the core specification defines it.

For example, collection `name` and `publisher.name` have different roles, as do
collection `description` and a note's `description`. A spelling in an example
does not create another structural name.

## Parsing and Matching Baselines

Conforming tools must parse and match the same inputs the same way. This section pins the cross-cutting baselines; artifact-specific rules state where each baseline applies.

### YAML Baseline

Rules:

- `FND-25` Governed artifact frontmatter and managed-note frontmatter are parsed as YAML 1.2 using the core schema.
- `FND-27` A duplicate key within one YAML mapping makes the containing document invalid.
- `FND-28` Governed artifacts and managed notes MUST be encoded as UTF-8; a leading byte-order mark, when present, MUST be ignored.

For example, `yes`, `no`, `on`, and `off` are strings under this baseline, not
the boolean values some YAML 1.1 parsers assign to them.

### Regular Expression Dialect

Rules:

- `FND-29` Every regular expression on a governed surface — the `regex` field constraint, `when.path.regex`, and `when.frontmatter` `regex` predicates — uses the ECMAScript (ECMA-262) regular expression dialect.
- `FND-30` Whether a pattern is matched against the entire value or searched within it is defined by each declaring rule.
- `FND-31` A pattern that is not a valid ECMA-262 regular expression makes its declaring artifact invalid.
- `FND-93` A governed regular expression MUST use Unicode mode (`u`) without the `i`, `m`, `s`, `g`, `y`, or `v` flags.

For example, an unescaped `.` matches one Unicode code point but not a line
terminator; matching does not become case-insensitive because the host filesystem
is case-insensitive.

### Markdown Baseline

Markdown block structure is shared by heading detection and extraction of
governed body surfaces. Wikilinks and marker contracts add only their expressly
defined syntax; they do not replace the block parser.

Rules:

- `FND-94` Markdown block parsing MUST follow [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/).

For example, heading-like text inside a fenced code block is code, not a heading
or an active marker declaration.

### Frontmatter Block Grammar

This grammar defines how the YAML frontmatter block of any Markdown file — managed notes and governed artifacts alike — is recognized.

Rules:

- `FND-32` A Markdown file has frontmatter when its first line is exactly `---`, ignoring a leading byte-order mark per the YAML baseline above.
- `FND-33` The frontmatter block ends at the next subsequent line that is exactly `---` or `...`.
- `FND-34` If no closing line exists, the file has no frontmatter.
- `FND-35` A file has at most one frontmatter block; any later delimiter lines are ordinary body content.
- `FND-36` The frontmatter block content MUST parse as a YAML mapping under the YAML baseline above; an empty block is an empty mapping.

A non-mapping YAML document is not valid frontmatter; an empty block represents
an empty mapping rather than an explicitly stored null.

### Unicode Normalization and String Comparison

Rules:

- `FND-38` Every exact string comparison defined by this specification compares Unicode code points after normalizing both operands to Normalization Form C (NFC).
- `FND-40` String comparisons are case-sensitive; this specification defines no case folding.
- `FND-41` Code-point counts, such as `min` and `max` on text values, count the code points of the NFC-normalized value.
- `FND-43` Regular-expression matching operates on the NFC-normalized value.

## Governed Artifact Format

Governed artifact definitions use Markdown with YAML frontmatter. Templates are
the exception: they are starter Markdown whose optional frontmatter overrides
derived starter values under their dedicated contract.

Rules:

- `FND-44` A governed artifact's frontmatter is its governed content. When this specification says an artifact contains, declares, or defines a key, it refers to that artifact's frontmatter.
- `FND-45` A governed artifact other than a template MUST have valid frontmatter under the Frontmatter Block Grammar.
- `FND-46` Except for the governed template-body contract under `FND-50`, tools MUST ignore artifact bodies for structural reasoning.
- `FND-88` A tool that rewrites governed artifact frontmatter MUST preserve the artifact body.
- `FND-48` Governed artifact files are not collection notes: they are not evaluated for note-type mapping, are not candidates for note-link resolution, and are not validated as managed notes.
- `FND-49` `typedmark.md` at the collection root is reserved for the collection configuration; a managed note MUST NOT resolve its storage path to `typedmark.md`.
- `FND-50` Templates under `<metadata_directory>/templates/` follow the starter-content contract in [Templates](relationships-headings-and-templates.md#templates), including explicitly declared extension-governed surfaces.

A complete minimal `typedmark.md`, showing the governed frontmatter together with a free-form body:

<!-- typedmark-example: artifact=typedmark -->
```markdown
---
specification_version: 0.1.0
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
  automations/
    <automation>.md
  datasets/
    <dataset>.md
  property-sets/
    <property_set>.md
  schemas/
    <note_type>.md
  templates/
    <note_type_template>.md
  views/
    <view>.md
```

In path notation below, `<metadata_directory>` is the directory name declared by `typedmark.md` `metadata_directory`.

The authoritative contract for each governed element and cross-tool runtime surface lives in exactly one place, except that `typedmark.md` is documented by concern: its structural fields are authoritative on [Collection Model](collection-model.md) and its optional system fields are authoritative on [Systems, Composition, and Evolution](systems-composition-evolution.md).

| Artifact or concern | Authoritative owner |
| --- | --- |
| `typedmark.md` structural fields | [Collection Model](collection-model.md) |
| Extension declarations and vendor metadata | [Extensions](extensions.md) |
| System fields and `history.md` | [Systems](systems-composition-evolution.md) |
| `schemas/<type>.md` | [Note Type Schemas](note-type-schemas.md) |
| `templates/<file>.md` | [Templates](relationships-headings-and-templates.md#templates) |
| `property-sets/<id>.md` | [Property Sets](property-sets.md) |
| `automations/<id>.md` | [Automation Artifacts](automation-artifacts.md) |
| `datasets/<id>.md`, `views/<id>.md` | [Datasets and Views](datasets-and-views.md) |
| Note values and core fields | [Managed Notes](managed-notes-and-properties.md) |
| Field definitions | [Field Reference](field-definition-reference.md) |
| Field conversion | [Conversions](field-conversions.md) |
| Links | [Note Links](note-links.md) |
| Relationships and headings | [Body Contracts](relationships-headings-and-templates.md) |
| Tracking and expansion | [Tracking](template-tracking.md), [Expansion](content-expansion.md) |
| Expressions and extended authoring | [Expressions](expressions.md), [Authoring](authoring.md) |
| Queries | [Queries](queries.md) |
| Validation reports and conformance | [Conformance](conformance-and-roadmap.md) |
| Automation execution and reports | [Runtime](automation-runtime.md), [Reports](automation-reports.md) |
| Catalog | [Marketplace Catalog](marketplace-catalog.md) |
| Migration effects | [Migration](migration-effects.md) |

Artifact subpaths in this table are relative to `metadata_directory`.


`typedmark.md` lives at the root of the managed collection, as required by [Collection Model](collection-model.md).

Rules:

- `FND-84` When this specification fixes an artifact location by artifact kind, governed artifacts MUST derive that location from the authoritative artifact map and the `typedmark.md` `metadata_directory` value.
- `FND-85` Governed artifacts MUST NOT restate a fixed artifact path elsewhere unless an artifact-specific rule requires it.
- `FND-86` Files outside `typedmark.md` and the configured metadata directory MAY exist for humans, publishing, or navigation, but they are not authoritative for structure.

## Authority and Precedence

Artifact authority is concern-specific, not a universal override hierarchy.
For example, a local field can override a reused field only where the merge
contract allows it; a template does not override a field constraint merely
because it contains a different starter value.

Rules:

- `FND-87` Structural conflicts MUST be resolved by the authoritative contract for the affected concern, rather than an artifact-wide precedence ranking.

Generated references help people and agents navigate the contract, but the
artifact map identifies its authoritative sources. System metadata and history
do not replace the live note-type contract; their roles are defined in
[Systems, Composition, and Evolution](systems-composition-evolution.md).

## Shared Expression Language

The optional [expression contract](expressions.md#shared-expression-language) is authoritative on its own page.
