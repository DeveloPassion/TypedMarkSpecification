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

Core governs files at rest, not a particular app or domain schema. It does not
define editor widgets, rendering style, synchronization, storage backends,
version control, permissions, AI prompts, query-engine internals, or prose
outside governed surfaces. Optional contracts define portable behavior without
standardizing their implementations.

Rules:

- `CR-23` Tools MUST NOT coerce stored values while reading them.

## Conformance

Conformance evaluates a collection root, represented on disk as a directory tree, against the authoritative artifact contracts defined in [Collection Model](collection-model.md), [Systems, Composition, and Evolution](systems-composition-evolution.md), [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Conformance modes:

| Target/profile | Audience | Minimum artifact set | Advanced features required |
| --- | --- | --- | --- |
| Core Profile instantiated collection | collection authors | `typedmark.md`, at least one concrete schema, and managed notes; explicit template references when supplied | none |
| Valid instantiated collection | collection authors and tools | all artifacts used by the collection, including optional reuse and composition metadata when present | only the features physically used |
| Valid system definition | system publishers | collection model plus system fields, scaffold, schemas, templates, and optional history | publishing, composition, and migration support |

### Validation Reports

Reports identify evaluated contracts, completeness, and findings. Incomplete
evaluation cannot establish conformance, even with no errors. Producers populate
coverage from actual evaluation, not by blindly relabeling an old report.
Extension maps follow [Extensions and Capabilities](extensions.md).

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

The required artifact set belongs to [Systems](systems-composition-evolution.md#valid-system-definition).

### Valid Instantiated Collection

A collection root conforms as a valid instantiated collection when:

1. `CR-7` `typedmark.md` is present at the collection root and valid under [Collection Model](collection-model.md).
2. `CR-8` If `typedmark.md` declares `composition`, it is valid under [Collection Model](collection-model.md), and the collection is self-contained so that conformance does not require re-resolving its sources.
4. `CR-10` Every schema file under `<metadata_directory>/schemas/`, if present, is valid under [Note Type Schemas](note-type-schemas.md), and every concrete note type used by managed notes resolves to exactly one such schema file.
5. `CR-21` Each concrete schema's explicit or derived starter template satisfies [Templates](relationships-headings-and-templates.md#templates).
6. `CR-11` Managed notes resolve to valid concrete note types under the configured note-type mapping rules and satisfy the managed note contract under [Managed Notes and Properties](managed-notes-and-properties.md).
7. `CR-12` Managed notes satisfy their schema storage rules under [Note Type Schemas](note-type-schemas.md).
8. `CR-13` Managed notes satisfy their schema relationship and heading rules under [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

Additional rules:

- `CR-14` Validators MUST evaluate conformance against an explicit target mode: system definition, instantiated collection, or both.
- `CR-15` A collection root is a system definition when `typedmark.md` declares the system fields, and an instantiated collection when `typedmark.md` governs managed notes; neither requires a separate system or instance manifest.
- `CR-16` A single collection root MAY conform simultaneously as both a valid system definition and a valid instantiated collection.
- `CR-17` Untyped notes MAY exist in an instantiated collection and do not by themselves make the collection non-conforming.
- `CR-18` Structural precedence across artifacts remains defined in [Foundations](foundations.md).
- `CR-19` A Core Profile instantiated collection satisfies the positive Core concern set in [Foundations](foundations.md#purpose) without requiring an optional contract.
- `CR-20` Validators MUST apply the defaulted shorthand values defined in [Collection Model](collection-model.md) and [Note Type Schemas](note-type-schemas.md) before evaluating any conformance mode.
- `CR-22` Validators MUST evaluate every winning note-type mapping candidate under `CM-114`, including candidates that do not resolve to a concrete schema.

## Recommended Next Steps

The [semantic conformance runner guide](schema/docs/conformance-runner.md)
describes the non-normative adapter boundary, capability-based vector selection,
and report comparison used to collect implementation evidence. It does not
replace the rules on this page.

Start with collection discovery and local schema validation, then effective
values, storage, links, and headings. Run the Core vectors through an actual
semantic adapter before claiming conformance. Add optional contracts only with
their declared capabilities and dependencies; their owning pages describe the
additional behavior.
