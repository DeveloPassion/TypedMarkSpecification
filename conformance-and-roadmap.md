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
- the portable validation-report format
- the recommended implementation order

See also:

- [Foundations](foundations.md): authoring profiles and shared baselines
- [Collection Model](collection-model.md): collection-level validation severities
- [Systems, Composition, and Evolution](systems-composition-evolution.md): system-definition and migration contracts

## Non-Goals

This specification defines the structural contract for typed Markdown note collections. It deliberately does not define:

- **A specific schema for note types.** TypedMark describes how to define and document note types; concrete note sets, starter content, and house conventions belong to systems layered on top of the core, as stated in [Foundations](foundations.md).
- **Rendering and presentation.** How notes, fields, views, or icons are displayed is tool-defined; `icon` is an opaque token, and presentation hints remain an open decision tracked separately.
- **Editor user experience.** Forms, pickers, autocomplete behavior, and authoring workflows are application concerns.
- **Sync, storage backends, and version control.** TypedMark governs files at rest; how they move between machines — Git, sync services, backups — is out of scope.
- **Body prose.** Markdown content outside the governed surfaces — frontmatter, H2 headings, internal note links — is free; TypedMark does not constrain writing style or block-level structure.
- **Value coercion.** TypedMark is strictly typed: a stored value either satisfies its declared property type or it does not. Reading the string `"5"` as the integer `5` is coercion.
- **Query and index engine internals.** Execution strategy, caching internals, and performance characteristics are implementation concerns, even where future versions define portable query or index contracts.
- **AI behavior.** Agents consume the structural contract; prompts, models, and agent workflows are outside the specification.
- **Identity, authentication, and permissions.** Multi-user access control is out of scope; visibility metadata is tracked separately as a possible future addition.

Rules:

- `CR-23` Tools MUST NOT coerce stored values while reading them.

## Conformance

Conformance evaluates a collection root, represented on disk as a directory tree, against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [Systems, Composition, and Evolution](systems-composition-evolution.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Conformance modes:

| Mode | Audience | Minimum artifact set | Advanced features required |
| --- | --- | --- | --- |
| Core Profile instantiated collection | collection authors | `typedmark.md`, at least one concrete schema, referenced or defaulted templates, and managed notes | none |
| Valid instantiated collection | collection authors and tools | all artifacts used by the collection, including optional reuse and composition metadata when present | only the features physically used |
| Valid system definition | system publishers | collection model plus system fields, scaffold, schemas, templates, and optional history | publishing, composition, and migration support |

### Validation Reports

Validators can serialize their findings as one portable JSON report for editors, CI pipelines, and other tools. The report states what was evaluated and whether any configured error remains; individual results identify both a stable diagnostic category and the exact normative rule that produced it.

```json
{
  "specification_version": "0.0.1",
  "mode": "instantiated_collection",
  "valid": false,
  "results": [
    {
      "code": "invalid_field_value",
      "severity": "error",
      "path": "notes/typed-mark.md",
      "rule_id": "FDR-198",
      "message": "priority must be one of low, medium, or high",
      "note_type": "topic",
      "field": "priority"
    }
  ]
}
```

Rules:

- `CR-24` A tool that serializes validation findings for interchange MUST encode the report as UTF-8 JSON with the top-level keys `specification_version`, `mode`, `valid`, and `results`.
- `CR-25` `specification_version` MUST identify the TypedMark specification version under which the validator evaluated the target.
- `CR-26` `mode` MUST be `system_definition`, `instantiated_collection`, or `both`, corresponding to the conformance targets defined on this page.
- `CR-27` `valid` MUST be `true` exactly when `results` contains no result whose `severity` is `error`.
- `CR-28` `results` MUST be a list containing zero or more validation-result objects.
- `CR-29` Each validation result MUST contain `code`, `severity`, `path`, `rule_id`, and `message`.
- `CR-30` `code` MUST be one of the validation keys defined authoritatively under `validation_defaults` in [Collection Model](collection-model.md).
- `CR-31` `severity` MUST be the result's effective configured severity after applying the defaults and overrides defined in [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md).
- `CR-32` A validator MUST NOT emit a result whose effective configured severity is `off`.
- `CR-33` `path` MUST be the normalized collection-relative path of the governed artifact or managed note that the result describes, using forward slashes.
- `CR-34` `rule_id` MUST identify the stable rule whose violation produced the result.
- `CR-35` `message` MUST be a non-empty human-readable explanation of the specific finding.
- `CR-36` Consumers MUST NOT use `message` as a machine-stable identifier.
- `CR-37` A result MAY include `note_type`, `field`, `relationship`, or `heading` when that context applies.
- `CR-38` A nested field context MUST use `field` as a dot-separated path from its top-level frontmatter field.
- `CR-39` Validators MUST order results by `path`, then `rule_id`, then `code`, then the optional context values, comparing each component as exact Unicode code points.
- `CR-40` Validation MUST NOT modify the collection or any governed artifact it evaluates.

### Valid System Definition

A collection root conforms as a valid system definition when:

1. `CR-1` `typedmark.md` is present at the root and valid under [Collection Model](collection-model.md).
2. `CR-2` `typedmark.md` declares the system fields `version` and `scaffold`, valid under [Systems, Composition, and Evolution](systems-composition-evolution.md).
3. `CR-3` `<metadata_directory>/history.md`, if present, is valid under [Systems, Composition, and Evolution](systems-composition-evolution.md) and reconstructs the current schema state when replayed.
4. `CR-4` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from `typedmark.md` or a note-type schema resolves.
5. `CR-5` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md).
6. `CR-6` Every template referenced by a schema file exists and satisfies the template-frontmatter contract in [Relationships, Headings, and Templates](relationships-headings-and-templates.md) for its note type's effective schema.

### Valid Instantiated Collection

A collection root conforms as a valid instantiated collection when:

1. `CR-7` `typedmark.md` is present at the collection root and valid under [Collection Model](collection-model.md).
2. `CR-8` If `typedmark.md` declares `composition`, it is valid under [Collection Model](collection-model.md), and the collection is self-contained so that conformance does not require re-resolving its sources.
3. `CR-9` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from `typedmark.md` or a note type used by managed notes resolves.
4. `CR-10` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md), and every concrete note type used by managed notes resolves to exactly one such schema file.
5. `CR-21` Every template referenced or defaulted by a concrete schema exists and satisfies the template-frontmatter contract in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
6. `CR-11` Managed notes resolve to valid concrete note types under the configured note-type mapping rules and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
7. `CR-12` Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
8. `CR-13` Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- `CR-14` Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- `CR-15` A collection root is a system definition when `typedmark.md` declares the system fields, and an instantiated collection when `typedmark.md` governs managed notes; neither requires a separate system or instance manifest.
- `CR-16` A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- `CR-17` Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- `CR-18` Structural precedence across artifacts remains defined in [Foundations](foundations.md).
- `CR-19` A Core Profile instantiated collection is a valid instantiated collection that omits system fields, composition provenance, `history.md`, property sets, `folder_scopes`, vocabularies, and non-default note-type mappings.
- `CR-20` Validators MUST apply the defaulted shorthand values defined in [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md) before evaluating any conformance mode.
- `CR-22` Validators MUST evaluate every winning note-type mapping candidate under `CM-114`, including candidates that do not resolve to a concrete schema.

## Recommended Next Steps

Recommended implementation order:

1. create a Core Profile `typedmark.md` using the defaults in [Collection Model](collection-model.md)
2. create the initial concrete note type schemas and let [Note Type Schemas](note-type-schemas.md) compute each effective schema
3. create canonical templates using the defaulted or explicit `template.file` paths in [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, shared-expression evaluation, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md), [Field Definition Reference](field-definition-reference.md), [Foundations](foundations.md), and [Note Links](note-links.md)
5. add reusable property sets, abstract schemas, vocabularies, advanced mappings, heading rules, and relationship rules only when the collection needs them
6. add a validator and importer that evaluate the conformance modes defined on this page
7. populate the system fields in `typedmark.md`, and add a `<metadata_directory>/history.md` change log, if you are packaging a reusable, versioned system, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
8. implement deterministic system composition that materializes a self-contained collection and records its lineage in `typedmark.md` `composition`, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
9. implement the migration and update flow that recomposes a collection at newer source versions and applies the resulting change operations to managed notes
10. generate the human-facing reference pages from the authoritative artifacts
