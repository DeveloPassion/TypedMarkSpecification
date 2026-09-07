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
- evaluation completeness and the required/evaluated extension sets in reports
- the recommended implementation order

See also:

- [Foundations](foundations.md): authoring profiles and shared baselines
- [Extensions and Capabilities](extensions.md): declarations and capability matching
- [Automation Interchange Reports](automation-reports.md): event and execution-report formats
- [Collection Model](collection-model.md): collection-level validation severities
- [Systems, Composition, and Evolution](systems-composition-evolution.md): system-definition and migration contracts

## Non-Goals

This specification defines the structural contract for typed Markdown note collections. It deliberately does not define:

- **A specific schema for note types.** TypedMark describes how to define and document note types; concrete note sets, starter content, and house conventions belong to systems layered on top of the core, as stated in [Foundations](foundations.md).
- **Visual rendering and field widgets.** Saved views standardize their layout family, visible field order, labels, grouping, and board partition. Styling, dimensions, interaction controls, value widgets, note rendering, and opaque `icon` tokens remain tool-defined.
- **Editor user experience.** Forms, pickers, autocomplete behavior, and authoring workflows are application concerns.
- **Sync, storage backends, and version control.** TypedMark governs files at rest; how they move between machines — Git, sync services, backups — is out of scope.
- **Body prose.** Markdown content outside the governed surfaces — frontmatter, H2 headings, internal note links — is free; TypedMark does not constrain writing style or block-level structure.
- **Value coercion.** TypedMark is strictly typed: a stored value either satisfies its declared property type or it does not. Reading the string `"5"` as the integer `5` is coercion.
- **Query and index engine internals.** Execution strategy, caching internals, and performance characteristics are implementation concerns; the portable query contract governs results, not how they are produced, and index formats remain outside this version.
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

`evaluation` distinguishes an interpreted contract that has validation errors
from a contract the tool could not fully interpret. `valid: false` therefore
means conformance has not been established; with `evaluation: incomplete`, it
does not by itself prove that the collection is invalid. Extension declarations
and their map shape are authoritative in [Extensions and Capabilities](extensions.md).

This is a report-shape change from the `0.0` line. Producers populate the new
fields from actual evaluation; adding `evaluation: complete` to an old report
without establishing its coverage is not a migration. Consumers distinguish
incomplete evaluation from a complete report containing validation errors.

<!-- typedmark-example: artifact=validation-report -->
```json
{
  "specification_version": "0.1.0",
  "mode": "instantiated_collection",
  "evaluation": "complete",
  "required_extensions": {},
  "evaluated_extensions": {},
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

- `CR-24` A tool that serializes validation findings for interchange MUST encode the report as UTF-8 JSON with the top-level keys `specification_version`, `mode`, `evaluation`, `required_extensions`, `evaluated_extensions`, `valid`, and `results`.
- `CR-25` `specification_version` MUST identify the TypedMark specification version under which the validator evaluated the target.
- `CR-26` `mode` MUST be `system_definition`, `instantiated_collection`, or `both`, corresponding to the conformance targets defined on this page.
- `CR-27` `valid` MUST be `true` exactly when `evaluation` is `complete` and `results` contains no result whose `severity` is `error`.
- `CR-28` `results` MUST be a list containing zero or more validation-result objects.
- `CR-29` Each validation result MUST contain `code`, `severity`, `path`, `rule_id`, and `message`.
- `CR-30` `code` MUST be one of the validation keys defined authoritatively under `validation_defaults` in [Collection Model](collection-model.md).
- `CR-31` `severity` MUST be the result's effective severity after applying artifact-specific fixed severities and the applicable defaults and overrides defined in [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md).
- `CR-32` A validator MUST NOT emit a result whose effective configured severity is `off`.
- `CR-33` `path` MUST be the normalized collection-relative path of the governed artifact or managed note that the result describes, using forward slashes.
- `CR-34` `rule_id` MUST identify the stable rule whose violation produced the result.
- `CR-35` `message` MUST be a non-empty human-readable explanation of the specific finding.
- `CR-36` Consumers MUST NOT use `message` as a machine-stable identifier.
- `CR-37` A result MAY include `note_type`, `field`, `relationship`, `heading`, `expansion`, `dataset`, `view`, `template_region`, `drift_kind`, or `extension` when that context applies.
- `CR-38` A nested field context MUST use `field` as a dot-separated path from its top-level frontmatter field.
- `CR-39` Validators MUST order results by `path`, `rule_id`, `code`, `note_type`, `field`, `relationship`, `heading`, `expansion`, `dataset`, `view`, `template_region`, `drift_kind`, and `extension`, in that sequence, comparing each component as exact Unicode code points and treating absent values as empty strings.
- `CR-40` Validation MUST NOT modify the collection or any governed artifact it evaluates.
- `CR-86` Every `template_drift` result MUST contain `template_region` and `drift_kind`.
- `CR-97` `evaluation` MUST be either `complete` or `incomplete`.
- `CR-98` `required_extensions` and `evaluated_extensions` MUST each have the extension-identifier-to-exact-version map shape defined in [Extensions and Capabilities](extensions.md#required-extensions).
- `CR-99` `required_extensions` MUST record the collection's declared required extension map, using `{}` when the declaration is absent.
- `CR-100` Every entry in `evaluated_extensions` MUST occur with the same exact version in `required_extensions`.
- `CR-101` An extension MUST appear in `evaluated_extensions` exactly when its required contract was interpreted for the target, whether or not that evaluation found violations.
- `CR-102` `evaluation` MUST be `incomplete` if any applicable core version or required extension contract was not interpreted, including deliberately limited evaluation or best-effort evaluation under an older core version.
- `CR-103` `evaluation` MUST be `complete` otherwise, including when interpretation establishes that the target violates its contracts.
- `CR-104` Changing or suppressing a diagnostic's configured severity MUST NOT change evaluation completeness.
- `CR-105` Every `unsupported_extension` result MUST contain an `extension` identifying the required extension.
- `CR-106` `rule_id` MUST identify either a built-in rule from the evaluated specification or a qualified extension rule of the form `<extension-id>/<local-id>`, where `local-id` matches `[A-Z]{2,3}-[1-9][0-9]*`.
- `CR-107` A qualified extension rule's identifier prefix MUST equal its result's `extension` value.
- `CR-108` A result identifying a qualified extension rule MUST use the `extension_violation` category.
- `CR-109` Every `extension_violation` result MUST contain an `extension` identifying an evaluated required contract.

Built-in rule identifiers retain their existing spelling. A third-party
extension can report its own rule without reserving a global prefix in this
repository: `example:review/REV-1` is qualified by its required exact extension
version through the report's extension maps. For example:

<!-- typedmark-example: artifact=validation-report -->
```json
{
  "specification_version": "0.1.0",
  "mode": "instantiated_collection",
  "evaluation": "complete",
  "required_extensions": {"example:review": "1.2.0"},
  "evaluated_extensions": {"example:review": "1.2.0"},
  "valid": false,
  "results": [{
    "code": "extension_violation",
    "severity": "error",
    "path": "notes/review.md",
    "rule_id": "example:review/REV-1",
    "extension": "example:review",
    "message": "The review extension's declared constraint is not satisfied."
  }]
}
```

For example, this report cannot establish full conformance because the tool
does not support the required illustrative extension:

<!-- typedmark-example: artifact=validation-report -->
```json
{
  "specification_version": "0.1.0",
  "mode": "instantiated_collection",
  "evaluation": "incomplete",
  "required_extensions": {"example:review": "1.2.0"},
  "evaluated_extensions": {},
  "valid": false,
  "results": [
    {
      "code": "unsupported_extension",
      "severity": "error",
      "path": "typedmark.md",
      "rule_id": "EXT-19",
      "extension": "example:review",
      "message": "example:review at 1.2.0 is required but unsupported"
    }
  ]
}
```

Suppressing that diagnostic can make `results` empty, but leaves
`evaluation: incomplete` and `valid: false`. A Core-only evaluation of an
extension-using collection is similarly incomplete, rather than a claim about
the entire collection. Invalid field values under fully interpreted contracts,
on the other hand, yield a complete report with errors.

### Automation Run Reports

The authoritative contract is now in [Automation Run Reports](automation-reports.md).

### Valid System Definition

A collection root conforms as a valid system definition when:

1. `CR-1` `typedmark.md` is present at the root and valid under [Collection Model](collection-model.md).
2. `CR-2` `typedmark.md` declares the system fields `version` and `scaffold`, valid under [Systems, Composition, and Evolution](systems-composition-evolution.md).
3. `CR-3` `<metadata_directory>/history.md`, if present, is valid under [Systems, Composition, and Evolution](systems-composition-evolution.md) and reconstructs the current schema state when replayed.
4. `CR-4` Every property set file under `<metadata_directory>/property-sets/`, if present, is valid under [Collection Model](collection-model.md), and every property set reference from `typedmark.md` or a note-type schema resolves.
5. `CR-5` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md).
6. `CR-6` Every template referenced by a schema file exists and satisfies the template-frontmatter contract in [Relationships, Headings, and Templates](relationships-headings-and-templates.md) for its note type's effective schema.
7. `CR-59` Every automation file under `<metadata_directory>/automations/`, if present, is valid under [Collection Model](collection-model.md).
8. `CR-93` Every dataset file under `<metadata_directory>/datasets/`, if present, is valid under [Collection Model](collection-model.md).
9. `CR-89` Every saved-view file under `<metadata_directory>/views/`, if present, is valid under [Collection Model](collection-model.md), and every dataset reference from a saved view resolves.
10. `CR-91` Every saved-view reference from a template resolves.
11. `CR-94` Every dataset reference from a template resolves.
12. `CR-84` Every content expansion in a referenced template satisfies the template expansion contract in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion).
13. `CR-87` Every template region in a referenced template satisfies the marker, descriptor, pairing, nesting, and identifier rules in [Template Drift Tracking](template-tracking.md#template-drift-tracking).

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
9. `CR-60` Every automation file under `<metadata_directory>/automations/`, if present, is valid under [Collection Model](collection-model.md).
10. `CR-95` Every dataset file under `<metadata_directory>/datasets/`, if present, is valid under [Collection Model](collection-model.md).
11. `CR-90` Every saved-view file under `<metadata_directory>/views/`, if present, is valid under [Collection Model](collection-model.md), and every dataset reference from a saved view resolves.
12. `CR-92` Every saved-view reference from a collection note resolves.
13. `CR-96` Every dataset reference from a collection note resolves.
14. `CR-85` Every content expansion in a collection note satisfies the applicable marker, descriptor, source, rendering, synchronization, and persisted-state rules in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion).
15. `CR-88` Every template-region marker or `template_regions` receipt in a collection note belongs to an enrolled managed note and satisfies the receipt, marker-correspondence, and drift-classification rules in [Template Drift Tracking](template-tracking.md#template-drift-tracking).

Additional rules:

- `CR-14` Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- `CR-15` A collection root is a system definition when `typedmark.md` declares the system fields, and an instantiated collection when `typedmark.md` governs managed notes; neither requires a separate system or instance manifest.
- `CR-16` A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- `CR-17` Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- `CR-18` Structural precedence across artifacts remains defined in [Foundations](foundations.md).
- `CR-19` A Core Profile instantiated collection is a valid instantiated collection that omits system fields, composition provenance, `history.md`, automation rules, datasets, saved views, property sets, `folder_scopes`, vocabularies, and non-default note-type mappings.
- `CR-20` Validators MUST apply the defaulted shorthand values defined in [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md) before evaluating any conformance mode.
- `CR-22` Validators MUST evaluate every winning note-type mapping candidate under `CM-114`, including candidates that do not resolve to a concrete schema.

## Recommended Next Steps

The [semantic conformance runner guide](schema/docs/conformance-runner.md)
describes the non-normative adapter boundary, capability-based vector selection,
and report comparison used to collect implementation evidence. It does not
replace the rules on this page.

Recommended implementation order:

1. create a Core Profile `typedmark.md` using the defaults in [Collection Model](collection-model.md)
2. create the initial concrete note type schemas and let [Note Type Schemas](note-type-schemas.md) compute each effective schema
3. create canonical templates using the defaulted or explicit `template.file` paths in [Relationships, Headings, and Templates](relationships-headings-and-templates.md)
4. implement managed note parsing, field materialization, field compatibility and conversion, shared-expression evaluation, and note-link resolution using [Managed Notes and Properties](managed-notes-and-properties.md), [Field Definition Reference](field-definition-reference.md), [Foundations](foundations.md), and [Note Links](note-links.md)
5. add reusable property sets, abstract schemas, vocabularies, advanced mappings, heading rules, and relationship rules only when the collection needs them
6. add a validator and importer that evaluate the conformance modes defined on this page
7. populate the system fields in `typedmark.md`, and add a `<metadata_directory>/history.md` change log, if you are packaging a reusable, versioned system, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
8. implement deterministic system composition that materializes a self-contained collection and records its lineage in `typedmark.md` `composition`, using [Systems, Composition, and Evolution](systems-composition-evolution.md)
9. implement the migration and update flow that recomposes a collection at newer source versions and applies the resulting change operations to managed notes
10. implement one-hop automation events, declarative actions, and portable run reports
11. add dependency-graph propagation, fixed-point termination, recovery, and destructive previews
12. implement portable query evaluation and query-backed content expansion against the same effective collection model
13. generate the human-facing reference pages from the authoritative artifacts
