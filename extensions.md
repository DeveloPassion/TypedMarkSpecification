---
title: Extensions and Capabilities
parent: TypedMark
nav_order: 3
audience: tool-authors
---

# Extensions and Capabilities

Audience: collection authors and tool authors using optional contracts.

Authoritative for:

- required extension declarations in `typedmark.md`
- extension identity, version selection, dependencies, and capability matching
- the explicitly scoped inert vendor-metadata namespace

See also:

- [Foundations](foundations.md): artifact-local core versions and name ownership
- [Collection Model](collection-model.md): collection configuration and diagnostic categories
- [Conformance and Roadmap](conformance-and-roadmap.md): complete and incomplete validation reports

An extension adds an explicitly identified contract; vendor metadata merely
carries data that does not affect conformance. Neither is executable code.
Declaring an extension does not install a plugin, fetch a schema, or grant
permission to modify notes.

This page defines the extension mechanism. Existing features become extension
requirements only when their authoritative contracts assign them an extension
identity; adding this mechanism does not silently reclassify every existing
feature. The following `example:review` identifier is illustrative.

## Required Extensions

The collection declares exact versions so interpretation does not depend on
what happens to be installed today. An omitted declaration is the empty map;
there is no implicit selection of a latest version.

<!-- typedmark-example: artifact=typedmark -->
```yaml
specification_version: 0.1.0
name: review-notes
description: A collection using an illustrative review extension.
extensions:
  example:review: 1.2.0
```

Rules:

- `EXT-1` `typedmark.md` MAY declare `extensions`.
- `EXT-2` A present `extensions` MUST be a mapping from extension identifiers to exact version strings.
- `EXT-3` An omitted `extensions` has the effective value `{}`.
- `EXT-4` An extension identifier MUST match `^[a-z0-9]+(?:[.-][a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$` as a complete string.
- `EXT-5` The `typedmark` identifier namespace is reserved for extensions defined by the TypedMark specification.
- `EXT-6` An extension version MUST be a complete Semantic Versioning version, including any declared prerelease or build suffix.
- `EXT-7` Every entry in `extensions` is a required contract for full collection conformance.
- `EXT-8` Version selection MUST compare the complete declared version string exactly, including prerelease and build suffixes.
- `EXT-9` Tools MUST NOT replace a declared extension version with a range, wildcard, newer installed version, or inferred default.

The map's key uniqueness follows the YAML parsing baseline in Foundations.
Extension versions are independent of `specification_version` and of a system's
release `version`; the core's compatible-version fallback is not extension
version negotiation.

## Contract Ownership and Dependencies

An extension describes its own structural additions and prerequisites. Those
additions remain distinct from inert vendor data and cannot redefine names
owned by Core under the namespace rules in Foundations.

For example, if `example:review` at `1.2.0` requires `example:labels` at `2.0.0`,
both entries appear in the collection declaration:

<!-- typedmark-example: fragment: Required extension dependency declaration. -->
```yaml
extensions:
  example:review: 1.2.0
  example:labels: 2.0.0
```

Rules:

- `EXT-10` An extension contract MUST identify the exact extension version it defines.
- `EXT-11` An extension contract MUST identify the core compatibility lines it supports.
- `EXT-12` An extension contract MUST identify the structural names and artifact positions it owns.
- `EXT-13` An extension contract MUST declare its required extensions and their exact versions, or state that it has none.
- `EXT-14` Every transitive required extension MUST appear at its required version in the collection's `extensions` map.
- `EXT-15` Conflicting dependency versions or a dependency cycle make the collection's extension declaration invalid.
- `EXT-16` Use of a construct whose authoritative contract requires an extension MUST be accompanied by that extension's declaration.
- `EXT-17` Reading an extension declaration MUST NOT execute code, install components, access the network, or modify collection files.

Resolving declared contracts means selecting already supported interpretations,
not downloading them. A tool can offer a separate, explicitly authorized
installation workflow, but that workflow is outside validation.

## Capability Matching

Tools can support different sets of contracts. Their reports distinguish
checking a contract and finding an error from being unable to interpret that
contract at all. Merely understanding a declaration's shape does not establish
support for its extension.

| Situation | Interpretation |
| --- | --- |
| Required exact version supported and evaluated | Included in the report's evaluated set, even if validation finds errors |
| Required version unknown or unsupported | Incomplete evaluation; `unsupported_extension` category |
| Supported contract deliberately not evaluated | Incomplete evaluation; no full-conformance claim |
| Known dependency omitted or conflicting | Invalid declaration; `invalid_extension_declaration` category |
| Known extension-owned construct used without declaration | Invalid declaration; `invalid_extension_declaration` category |
| Inert vendor metadata only | No extension requirement is created |

Rules:

- `EXT-18` A validation tool MUST advertise the exact extension versions it can evaluate.
- `EXT-19` A required extension version that the tool cannot interpret makes evaluation incomplete.
- `EXT-20` A required extension whose contract excludes an applicable artifact's core compatibility line makes the extension declaration invalid.
- `EXT-21` A tool MUST NOT claim to have evaluated an extension merely because it accepted the extension's declaration or retained its data.
- `EXT-22` A tool lacking a required contract MUST NOT diagnose a potentially extension-owned construct as invalid solely because it is absent from the tool's core schema.

Known core constraints still apply when they can be evaluated independently.
The report shape, evaluated-set consistency, and effect of incomplete evaluation
are defined only in [Validation Reports](conformance-and-roadmap.md#validation-reports).
Validation support does not imply support for creating, editing, or executing
extension-owned behavior.

## Inert Vendor Metadata

Tools sometimes need to preserve UI preferences or other private metadata without
making that metadata part of the structural contract. The `x_*` carrier is
limited to the top-level frontmatter of these governed artifacts:
`typedmark.md`, note-type schemas, property sets, automation rules, datasets,
saved views, and `history.md`.

It does not grant a blanket exception to nested structural objects, descriptors,
reports, template starter frontmatter, or managed-note fields. A managed-note
field named `x_notes`, for example, is still governed by its effective schema.

<!-- typedmark-example: artifact=typedmark -->
```yaml
specification_version: 0.1.0
name: personal-notes
description: Notes with an application preference that has no structural effect.
x_editor:
  color: blue
```

Rules:

- `EXT-23` In the top-level frontmatter namespaces listed above, a vendor-metadata key MUST match `^x_[a-z][a-z0-9_]*$` as a complete string.
- `EXT-24` A permitted vendor-metadata value MAY be any value accepted by the YAML parsing baseline.
- `EXT-25` Permitted vendor metadata MUST NOT affect note-type association, effective schemas, validation results, or extension requirements.
- `EXT-26` A validator MUST NOT report a permitted vendor-metadata key as an unknown structural key.
- `EXT-27` A tool rewriting or composing an artifact MUST preserve its vendor-metadata values unless the user explicitly requests their modification or removal.
- `EXT-28` Composition that would combine different values at the same vendor-metadata key MUST report a conflict instead of silently choosing a value.

An `x_*` value is not a place to hide required validation or executable behavior.
Such behavior needs a declared extension and its own authoritative contract.
