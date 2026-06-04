---
title: Collection Model
parent: TypedMark
nav_order: 2
---

# Collection Model

This page is authoritative for `typedmark.json`, collection-level inheritance, and validation defaults. It is not authoritative for `.metadata/system.yaml` or `.metadata/instance.yaml`; those live in [System Definitions and Instances](system-definitions-and-instances.md). It is also not authoritative for note-type schema block semantics, managed note field semantics, or relationship and template semantics; those live in [Note Type Schemas](note-type-schemas.md), [Managed Notes and Properties](managed-notes-and-properties.md), and [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

## 5. Collection Model Specification

`typedmark.json` defines collection-model-wide rules.

Required fields:

```json
{
  "specification_version": "0.0.1",
  "collection_model_id": "example-knowledge-base",
  "relationship_kinds": [
    "belongs_to",
    "related_to"
  ],
  "exclude_paths": [
    ".git/**",
    ".metadata/**"
  ],
  "validation_defaults": {
    "path": "error",
    "missing_required_field": "error",
    "missing_declared_field": "error",
    "non_canonical_serialization": "error",
    "unknown_field": "warn",
    "invalid_allowed_value": "error",
    "invalid_note_link": "error",
    "invalid_relationship_definition": "error",
    "invalid_relationship_instance": "error",
    "invalid_heading": "error",
    "template_drift": "warn"
  }
}
```

Rules:

- `typedmark.json` MUST exist at the root of every conforming managed collection.
- A conforming system definition MUST also include `typedmark.json` at its root.
- The semantics of `specification_version` are defined in [Foundations](foundations.md).
- `collection_model_id` MUST be a non-empty slug.
- `collection_model_id` identifies the structural collection model described by `typedmark.json`.
- `collection_model_id` is not an instantiated collection identifier.
- Multiple instantiated collections MAY share the same `collection_model_id`.
- `relationship_kinds` MUST be exactly `belongs_to` and `related_to`.
- The meanings of `belongs_to` and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `exclude_paths` defines content that validators and agents MUST ignore for structural reasoning.
- `validation_defaults` provides default severity levels for collection-wide validation reporting.
- Supported validation severities are `error`, `warn`, `info`, and `off`.
- A note or artifact with any `error` violation is non-conforming.
- A note or artifact with only `warn` or `info` issues remains structurally usable.
- Validators SHOULD report the artifact path, note type when applicable, rule name, and failing field, relationship, or heading.
- `path` applies when a managed note path violates the storage rules defined in [Note Type Schemas](note-type-schemas.md).
- `missing_required_field` applies when a field declared in `required_fields` lacks a concrete value required for conformance after applying the rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- `missing_declared_field` applies when a field declared in either `required_fields` or `optional_fields` is absent from stored note frontmatter.
- `non_canonical_serialization` applies when a governed artifact is semantically valid but not serialized according to [Managed Notes and Properties](managed-notes-and-properties.md).
- `unknown_field` applies when an undeclared field appears in `typedmark.json`, any governed YAML artifact, or managed note frontmatter.
- `invalid_allowed_value` applies when a field value violates an `allowed_values` constraint.
- `invalid_note_link` applies when an internal note link violates the syntax or resolution rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `invalid_relationship_definition` applies when relationship declarations violate the relationship model defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_relationship_instance` applies when concrete note-to-note links violate the relationship constraints defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `invalid_heading` applies when a managed note violates the effective heading rules defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `template_drift` applies when a validator chooses to compare a managed note to its canonical template and detects material divergence that is not itself a core conformance failure.

### Global Property Definitions

`typedmark.json` MAY define `global_properties` to declare note properties that apply to all note types.

Example:

```json
{
  "global_properties": {
    "frontmatter": {
      "required_fields": {
        "note_type": {
          "type": "text",
          "value_from_schema": "note_type"
        },
        "id": {
          "type": "text",
          "format": "slug",
          "nullable": false
        },
        "title": {
          "type": "text",
          "nullable": true,
          "default_value": null
        }
      },
      "optional_fields": {
        "summary": {
          "type": "text",
          "nullable": true,
          "default_value": null
        }
      }
    },
    "relationships": {
      "belongs_to": {
        "allowed_note_types": {}
      },
      "related_to": {
        "allowed_note_types": {}
      }
    },
    "headings": {
      "required_h2": [],
      "optional_h2": [],
      "allow_other_h2": true,
      "require_order": false
    }
  }
}
```

Rules:

- `global_properties` MAY be omitted.
- `global_properties` MAY define shared defaults for `frontmatter`, `relationships`, and `headings`.
- The semantics of `frontmatter` are defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- The semantics of `relationships` and `headings` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- Every note type inherits `global_properties` by default.
- Note-type schemas MAY override inherited global properties locally.

Override and merge rules:

- `frontmatter.required_fields` and `frontmatter.optional_fields` merge by field name.
- If a field is defined both globally and locally, the local field definition replaces the global field definition for that field.
- `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types` merge by target note type.
- If a relationship target is defined both globally and locally, the local target definition replaces the global target definition for that target.
- `headings.required_h2` and `headings.optional_h2` use replace semantics: if a local list is present, it replaces the global list; otherwise the global list applies unchanged.
- Scalar heading settings such as `allow_other_h2` and `require_order` use replace semantics: a local value replaces the global value; otherwise the global value applies unchanged.
- Inheritance operates within the required `frontmatter`, `relationships`, and `headings` blocks of a note-type schema; those blocks remain mandatory even when much of their effective content is inherited.
- A note-type schema MAY omit individual inherited field definitions, relationship target definitions, or heading settings that remain unchanged.

### Disabling Inheritance

A note-type schema MAY explicitly disable inheritance from `global_properties`.

Example:

```yaml
note_type: glossary
inheritance:
  enabled: true
  frontmatter: false
  relationships: false
  headings: true
```

Rules:

- `inheritance` MAY be omitted.
- `inheritance.enabled` MAY be omitted; if omitted, it defaults to `true`.
- If `inheritance.enabled: false`, the note type inherits nothing from `global_properties`.
- `inheritance.frontmatter`, `inheritance.relationships`, and `inheritance.headings` MAY each be omitted; if omitted, each defaults to `true`.
- If one of those block-specific flags is `false`, the corresponding global block is ignored completely for that note type before merge rules are applied.
- If a block-specific flag is `false`, local definitions for that block still apply normally.
- Block-specific flags affect inheritance only; they do not make required schema blocks optional.
- Block-specific inheritance flags have no effect when `inheritance.enabled: false` because all inheritance is already disabled.
- Disable rules are evaluated before merge and override rules.
