---
title: Managed Notes and Properties
parent: TypedMark
nav_order: 6
audience: essentials
---

# Managed Notes and Properties

Audience: collection authors.

Authoritative for:

- the managed note contract and note-type association
- field names and the core-defined fields: `note_type`, `id`, `deleted`, `archived`, `aliases`, and `template_regions`
- mandatory-tag conformance and materialization
- canonical field materialization and field optionality
- automation events, action effects, and propagation consistency

See also:

- [Field Definition Reference](field-definition-reference.md): property types and field-definition properties
- [Note Links](note-links.md): note-link syntax, resolution, and body extraction
- [Migration Effects](migration-effects.md): what migration operations do to managed notes
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): relationship cardinality, headings, template drift, and derived Markdown regions

## Notes in a Collection

TypedMark distinguishes between collection notes in general and managed notes specifically.

Rules:

- `MN-1` A collection note is a Markdown note that belongs to the collection as content rather than as a TypedMark artifact.
- `MN-2` A managed note is a collection note that is associated with exactly one known note type under this specification version's note-type association rules.
- `MN-3` The ordered note-type mapping rules are defined in [Collection Model](collection-model.md).
- `MN-4` The first matching note-type mapping rule determines the note's candidate note type.
- `MN-5` A collection note is managed only when the candidate note type from the winning mapping rule resolves to exactly one known concrete schema.
- `MN-6` A collection note is untyped when no mapping rule matches or when the winning mapping rule does not resolve to exactly one known concrete schema; the latter case is an `invalid_note_type_mapping` diagnostic under [Collection Model](collection-model.md).
- `MN-7` Untyped notes MAY exist in a collection.
- `MN-8` Untyped notes are outside the managed-note contract on this page and are not validated against note-type storage, relationship, heading, or frontmatter field-definition rules.
- `MN-9` Rules on this page apply only to managed notes unless a rule explicitly says otherwise.

## Managed Note Contract

The managed-note contract combines file format, note-type resolution, effective-schema conformance, and the governed note surfaces.

Rules:

- `MN-117` A managed note MUST be a Markdown file.
- `MN-118` A managed note MUST contain valid YAML frontmatter.
- `MN-119` A managed note MUST use YAML frontmatter as its metadata surface.
- `MN-120` A managed note MUST resolve to exactly one known concrete note type under the configured note-type mapping rules.
- `MN-121` A managed note MUST satisfy exactly one effective note-type schema as defined in [Note Type Schemas](note-type-schemas.md).
- `MN-122` A managed note MUST satisfy the field and materialization rules defined on this page.
- `MN-123` A managed note MUST satisfy the storage, relationship, and heading rules linked from its resolved note type.
- `MN-124` Each conformance evaluation MUST use the managed note's current normalized collection-relative path when resolving `folder_scopes`.

Common frontmatter shape:

```yaml
note_type: topic
tags:
  - managed
  - type/topic
title: Note Taking
description: ""
domain: ""
sources:
  - "[Introduction to Note Taking](Sources/Introduction%20to%20Note%20Taking.md)"
summary: ""
status: active
```

This remains a common stored shape, especially when a collection uses explicit frontmatter mapping or chooses to materialize the resolved note type in frontmatter.

Rules:

- `MN-10` `note_type`, when stored, defines the explicit note type value of the note.
- `MN-11` If stored, `note_type` MUST equal the schema identifier defined by the matching concrete schema file.
- `MN-12` `note_type` MAY be omitted when the configured note-type mapping rules resolve the note type from another surface.
- `MN-13` `id` MAY be omitted.
- `MN-14` A managed note MAY declare `id` when its schema includes an `id` field definition.
- `MN-15` If a managed note declares `id`, its `id` MUST be stable across renames and moves.
- `MN-16` `title` is human-facing and MAY change unless its field definition declares `immutable: true`.
- `MN-17` Display-oriented fields such as `title` and `description` are human-facing note metadata and MAY differ from the note's file name and storage path unless a schema rule explicitly couples them.
- `MN-18` A conforming managed note MUST remain usable as a normal Markdown note without preprocessing, transpilation, or note-local sidecar metadata.
- `MN-19` Managed-note conformance uses the effective note-type schema after default property sets, matching folder-scoped property sets, abstract-ancestor application, opt-in property sets, and local concrete schema definitions have been applied.
- `MN-20` The meanings of `relationship_kind`, `belongs_to`, and `related_to` are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `MN-21` Managed note frontmatter MUST follow the canonical field materialization rules defined on this page.

### Frontmatter Block Grammar

Rules:

- `MN-22` A note's frontmatter block is recognized under the Frontmatter Block Grammar defined in [Foundations](foundations.md).
- `MN-23` A note whose frontmatter block content parses as a non-mapping YAML document has no valid frontmatter and cannot satisfy the managed note contract.

### Field Names

A managed-note frontmatter field name is the YAML key under which a field definition stores its value. The same field-name rules apply wherever this specification declares field definitions: the `frontmatter` block of a note-type schema, the `frontmatter` block of a property set, and any nested `object.fields` mapping.

Rules:

- `MN-24` A field name MUST be a non-empty string.
- `MN-25` A field name MUST match the regular expression `^[a-z][a-z0-9_]*$`.
- `MN-26` A field name MUST start with a lowercase ASCII letter and MAY continue with lowercase ASCII letters, digits, and underscores.
- `MN-27` A field name MUST NOT contain uppercase letters, whitespace, dots, slashes, or any other character outside that grammar.
- `MN-28` Field names are case-sensitive; two names that differ only in case are different names.
- `MN-29` A field name MUST be unique within the `frontmatter` mapping or `object.fields` mapping that declares it.
- `MN-30` A note-type schema or property set that declares a field name violating these rules is invalid under its artifact contract.
- `MN-31` The core-defined managed-note field names defined below conform to this grammar and additionally carry the contracts defined in Core-Defined Frontmatter Field Names.
- `MN-32` Storage-pattern placeholders of the form `{field_name}` reference top-level field names that follow these rules, as defined in [Note Type Schemas](note-type-schemas.md).
- `MN-33` When two field definitions contributed through property-set composition or note-type inheritance share a field name, they are the same field and merge by name under the rules in [Collection Model](collection-model.md); this is not a uniqueness violation.

### Core-Defined Frontmatter Field Names

Managed-note frontmatter includes both generic schema-defined fields and core-defined field names whose meaning is assigned by this specification.

Rules:

- `MN-34` A managed-note frontmatter field name is core-defined only when this specification gives that field a normative contract.
- `MN-35` The normative contract for a core-defined managed-note field MUST define its meaning, whether it is required or optional or conditional, whether schemas may declare it explicitly, the constraints on its stored values, and any note-type association or conformance behavior that follows from its use.
- `MN-36` `note_type` is a core-defined managed-note field name in this specification version.
- `MN-37` `note_type` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-38` `note_type` MAY be omitted from stored frontmatter when the configured note-type mapping rules resolve the note type from another surface.
- `MN-39` If stored, `note_type` MUST be a non-empty string.
- `MN-40` If stored, `note_type` MUST equal the resolved note type for that note.
- `MN-41` If a property set or a note-type schema declares `note_type`, it MUST declare `type: text`.
- `MN-42` If a property set or a note-type schema declares `note_type`, it MUST declare either `value_from_schema: note_type` or `const_value` equal to the schema's top-level `note_type`. In a property set, only `value_from_schema: note_type` is permitted, because a property set has no top-level `note_type`.
- `MN-43` If a property set or a note-type schema declares `note_type`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-44` `id` is an optional core-defined managed-note field name in this specification version.
- `MN-45` Schemas MAY declare `id` when they require stable note-level identifiers.
- `MN-46` If a schema declares `id`, it MUST declare `type: text` and `format: slug`.
- `MN-47` If a schema declares `id`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-48` Stored `id` values MUST be unique across all managed notes in the collection, regardless of note type; a repeated `id` value is a `duplicate_unique_value` failure.
- `MN-49` `deleted` is an optional core-defined managed-note field name in this specification version.
- `MN-50` `deleted` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-51` If stored, `deleted` MUST be a YAML boolean.
- `MN-52` If omitted or stored as `false`, the note is not logically deleted.
- `MN-53` If stored as `true`, the note is logically deleted.
- `MN-54` Logical deletion is distinct from archiving. Setting `deleted: true` does not by itself move the note or apply archive storage rules.
- `MN-55` A logically deleted note remains a managed note and continues to use its resolved concrete note type in this specification version.
- `MN-56` A logically deleted note MUST still satisfy its effective note-type schema, including field, storage, relationship, and heading rules; logical deletion marks state, it does not relax conformance.
- `MN-57` A resolved internal note link to a logically deleted note still resolves; the effect on relationship counting is defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).
- `MN-58` Logical deletion is reversible: setting `deleted` back to `false` restores the note's non-deleted state without any other change.
- `MN-59` Hard deletion is the removal of the note file itself and is outside managed-note state; this specification version defines no tombstone artifact for hard-deleted notes.
- `MN-60` After hard deletion, internal note links to the removed note resolve to zero notes, and as unresolved placeholders they no longer satisfy minimum-cardinality requirements at their source notes.
- `MN-61` A tool that hard-deletes a managed note SHOULD report the inbound internal note links that will stop resolving before it deletes the note.
- `MN-62` A property set or a note-type schema MAY declare `deleted` when they want canonical materialization of deletion state.
- `MN-63` If a property set or a note-type schema declares `deleted`, it MUST declare `type: checkbox`.
- `MN-64` If a property set or a note-type schema declares `deleted`, it MUST declare `default_value: false`.
- `MN-65` If a property set or a note-type schema declares `deleted`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-66` `archived` is an optional core-defined managed-note field name in this specification version.
- `MN-67` `archived` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-68` If stored, `archived` MUST be a YAML boolean.
- `MN-69` If omitted or stored as `false`, the note is active.
- `MN-70` If stored as `true`, the note is archived.
- `MN-71` `archived` is the single marker of archived state; the storage rules in [Note Type Schemas](note-type-schemas.md) define where an archived note lives.
- `MN-72` Archived state changes which storage patterns govern the note's path, as defined in [Note Type Schemas](note-type-schemas.md); it does not by itself change relationship, heading, or field-conformance evaluation in this specification version.
- `MN-73` An archived note remains a managed note and continues to use its resolved concrete note type in this specification version.
- `MN-74` Archiving is distinct from logical deletion; `archived` and `deleted` are independent states and MAY both be `true` on the same note.
- `MN-75` A property set or a note-type schema MAY declare `archived` when they want canonical materialization of archived state.
- `MN-76` If a property set or a note-type schema declares `archived`, it MUST declare `type: checkbox`.
- `MN-77` If a property set or a note-type schema declares `archived`, it MUST declare `default_value: false`.
- `MN-78` If a property set or a note-type schema declares `archived`, it MUST NOT declare `optional: true` or `nullable: true`.
- `MN-79` `aliases` is an optional core-defined managed-note field name in this specification version.
- `MN-80` `aliases` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-81` If stored, `aliases` MUST be a YAML sequence of unique non-empty strings.
- `MN-82` An alias MUST NOT contain `/`, `\`, `#`, `^`, `|`, or line breaks, because those characters cannot appear in a simple wikilink target.
- `MN-83` Aliases are alternative names for the note and participate in note-link resolution through the alias pass defined in [Note Links](note-links.md).
- `MN-84` Two managed notes SHOULD NOT share an alias; a link using a shared alias is ambiguous and cannot resolve, and tools SHOULD report shared aliases.
- `MN-85` A property set or a note-type schema MAY declare `aliases` when they want canonical materialization of aliases.
- `MN-86` If a property set or a note-type schema declares `aliases`, it MUST declare `type: list` and `items` with `type: text`.
- `MN-87` A core-defined managed-note field name MUST NOT be repurposed as an ordinary user-defined field in a property set or a note-type schema unless the core field contract explicitly permits schema-level declaration of that field.
- `MN-88` Field names such as `title`, `description`, `tags`, `created_at`, and `updated_at` are ordinary schema-defined managed-note field names in this specification version unless a rule explicitly defines them otherwise.
- `MN-89` The `tags` property type defined below remains a first-class supported property type.
- `MN-90` The generic property-type and field-definition rules in this page apply to ordinary schema-defined fields unless a dedicated core field rule says otherwise.

`template_regions` is portable note-local tracking state, not a schema field. A baseline records the canonical region version last shared by the note and its template; a detached receipt records a deliberate opt-out for one identifier.

```yaml
template_regions:
  review-guidance:
    baseline: sha256:6d0e3caf8191b133d40ed62b20f304b24be2ee9f3e4de0a3d84b62ad976320a0
  legacy-footer:
    detached: true
```

Rules:

- `MN-284` `template_regions` is an optional core-defined managed-note field name in this specification version.
- `MN-285` `template_regions` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-286` A property set or a note-type schema MUST NOT declare `template_regions`.
- `MN-287` If stored, `template_regions` MUST be a YAML mapping.
- `MN-288` Every key in `template_regions` MUST be a slug identifying one template region.
- `MN-289` Every `template_regions` value MUST be a mapping containing exactly either `baseline` or `detached`.
- `MN-290` A `baseline` value MUST match `^sha256:[0-9a-f]{64}$`.
- `MN-291` A `detached` value MUST be the YAML boolean `true`.
- `MN-292` `template_regions` receipts MUST satisfy `schema/json-schema/template-tracking.schema.json`.
- `MN-293` Template frontmatter MUST NOT store `template_regions`.
- `MN-294` The `template_regions` mapping records whole-note enrollment and per-identifier receipt state for [Template Drift Tracking](relationships-headings-and-templates.md#template-drift-tracking).

### Mandatory Tags

Mandatory tags are value requirements on the ordinary top-level `tags` field. They do not turn `tags` into a core-defined field, and they do not authorize tools to overwrite author-added tags. A conforming note contains the effective policy values alongside any other tags allowed by its field definition.

```yaml
tags:
  - personal
  - managed
  - context/meeting
  - type/meeting
```

In this example, `personal` is author-added and the remaining entries are mandatory at collection, folder, and note-type scope. Their stored order need not mirror policy order when some were already present; membership is the conformance requirement.

Rules:

- `MN-125` A managed note's effective mandatory tags MUST be computed under the ordered merge rules in [Collection Model](collection-model.md).
- `MN-126` A conforming managed note MUST store every effective mandatory tag as an exact entry in its top-level `tags` sequence.
- `MN-127` Stored tags that are not mandatory remain valid when they satisfy the effective `tags` field definition.
- `MN-128` A validator MUST report each absent effective mandatory tag as an `invalid_field_value` failure on `tags`, as defined in [Collection Model](collection-model.md).
- `MN-129` A tool that creates, imports, scaffolds, normalizes, or modifies managed-note frontmatter MUST append every missing effective mandatory tag before saving.
- `MN-130` Missing mandatory tags MUST be appended after the existing stored tags and in effective mandatory-tag order.
- `MN-131` Mandatory-tag materialization MUST preserve the values and relative order of all existing stored tags.
- `MN-132` Mandatory-tag materialization MUST NOT introduce a duplicate tag under the string comparison rules in [Foundations](foundations.md).
- `MN-133` A tool MUST NOT remove a stored tag solely because the tag is not mandatory or is no longer mandatory.
- `MN-134` Mandatory-tag materialization MUST still satisfy every constraint of the effective `tags` field definition.

### Canonical Field Materialization

The canonical stored form of a managed note uses fully materialized frontmatter.

Rules:

- `MN-91` Every field declared in `frontmatter` MUST be physically present in stored note frontmatter.
- `MN-92` Declared fields MUST NOT be omitted merely because they currently have no concrete value.
- `MN-93` When no concrete value is known for a nullable field, the canonical stored value is `null`, unless an explicit non-null `default_value` is defined.
- `MN-94` When a field with `type: object` has a concrete mapping value, every field declared in that object's `fields` MUST be physically present in the stored mapping.
- `MN-95` Fields with `optional: false` and `optional: true` do not differ in physical materialization, but they do differ in value requirements.
- `MN-96` A field with `optional: false` MAY require a concrete non-null value, depending on `nullable` and `default_value`.
- `MN-97` A field with `optional: true` never requires a concrete non-null value; it remains valid when materialized as `null`.
- `MN-98` A missing field declared anywhere under `frontmatter` is a `missing_declared_field` validation failure.
- `MN-99` A missing nested field declared within an object field is also a `missing_declared_field` validation failure.
- `MN-100` Tools that create notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- `MN-101` Tools that import or scaffold notes MUST write back frontmatter that satisfies these canonical field materialization rules.
- `MN-102` Tools that normalize notes or modify managed note frontmatter MUST rewrite frontmatter so it satisfies these canonical field materialization rules before saving.

## Field Optionality

Field optionality is evaluated within the effective `frontmatter` block required by [Note Type Schemas](note-type-schemas.md).

Rules:

- `MN-103` `optional` defines value requirements, not sparse-storage behavior; canonical storage requirements are defined in Canonical Field Materialization.
- `MN-104` A field with `optional: false` MAY be nullable.
- `MN-105` A field with `optional: false` is part of the note's semantically expected metadata, even when `nullable: true` temporarily allows `null`.
- `MN-106` Fields with `optional: true` are semantically OPTIONAL, not sparse.
- `MN-107` Fields with `optional: true` MUST be nullable in the effective schema and MAY remain `null` indefinitely.
- `MN-108` Fields with `optional: true` MUST NOT be used for metadata that is REQUIRED to hold a concrete non-null value for conformance.
- `MN-109` If a field is intended to become invalid when no concrete value is present, it MUST declare `optional: false` and `nullable: false`.
- `MN-110` The same optionality distinction applies recursively within object field definitions.
- `MN-111` Unknown fields are evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md), at the effective severity for the note's resolved note type as defined in [Note Type Schemas](note-type-schemas.md).
- `MN-112` Unknown nested fields inside object values are also evaluated using the `unknown_field` rule defined in [Collection Model](collection-model.md).
- `MN-113` A field is unknown when it is absent from the note's effective note-type schema; the core-defined managed-note field names `note_type`, `deleted`, `archived`, `aliases`, and `template_regions` are never unknown fields, whether or not the effective schema declares them.
- `MN-114` If the effective `frontmatter` block declares `note_type`, `note_type` MUST be physically present in stored frontmatter.
- `MN-115` If the effective `frontmatter` block declares `note_type`, `note_type` MUST NOT declare `optional: true`.
- `MN-116` If `frontmatter` declares `id`, `id` MUST NOT declare `optional: true`.

## Automation Events and One-Hop Execution

Automation execution consumes an immutable event envelope and produces a staged collection patch. Event triggers describe note lifecycle changes; schedule triggers are represented at runtime by targeted `schedule.tick` events. A body-only update uses `body_changed: true` instead of inventing a frontmatter field change. This contract standardizes the observable inputs and effects, while [Collection Model](collection-model.md#automation-rules) owns the automation artifact itself.

```json
{
  "specification_version": "0.0.1",
  "event_id": "evt-01k0projectdone",
  "kind": "note.updated",
  "occurred_at": "2026-07-24T09:30:00+02:00",
  "origin": "user",
  "before": {
    "path": "Projects/TypedMark.md",
    "note_type": "project",
    "frontmatter": {
      "note_type": "project",
      "status": "doing"
    }
  },
  "after": {
    "path": "Projects/TypedMark.md",
    "note_type": "project",
    "frontmatter": {
      "note_type": "project",
      "status": "done"
    }
  },
  "changes": {
    "status": {
      "before": "doing",
      "after": "done"
    }
  }
}
```

Rules:

- `MN-135` An automation event MUST physically contain `specification_version`, `event_id`, `kind`, `occurred_at`, and `origin`.
- `MN-136` `event_id` MUST be unique within the execution history available to the executor.
- `MN-137` `occurred_at` MUST be an RFC 3339 timestamp denoting the instant represented by the event.
- `MN-138` `origin` MUST be `user`, `tool`, `watch`, `schedule`, `migration`, or `automation`.
- `MN-139` A note snapshot MUST contain the note's normalized collection-relative `path` and complete parsed `frontmatter` at that event boundary.
- `MN-185` A note snapshot MAY contain the note's resolved `note_type`.
- `MN-140` `note.created` MUST carry only an after snapshot.
- `MN-186` `note.deleted` MUST carry only a before snapshot.
- `MN-141` `note.archived` MUST carry before and after snapshots plus a non-empty `changes` mapping.
- `MN-271` `note.updated` MUST carry before and after snapshots plus at least one of a non-empty `changes` mapping or `body_changed: true`.
- `MN-272` `body_changed` MUST appear only on `note.updated` events.
- `MN-273` A present `body_changed` value MUST be `true`.
- `MN-274` `body_changed: true` asserts that the note-body source text differs across the represented event boundary.
- `MN-142` `note.moved` MUST carry before and after snapshots whose paths differ.
- `MN-143` Every entry in `changes` MUST name a top-level field and contain that field's parsed before and after values, including explicit `null` when applicable.
- `MN-144` `schedule.tick` MUST identify its target automation and scheduled instant.
- `MN-187` `schedule.tick` MUST NOT carry a note snapshot.
- `MN-145` An event produced by an automation rule MUST declare `caused_by` with the producing run, input event, and automation identifiers.
- `MN-281` An event produced by automatic content expansion MUST declare `caused_by` with the producing run, input event, and `operation: content_expansion`.
- `MN-282` A `caused_by` mapping MUST contain exactly one of `automation` or `operation`.
- `MN-283` An event caused by `operation: content_expansion` MUST be a `note.updated` event carrying `body_changed: true`.
- `MN-146` Event snapshots, field changes, and the body-change indicator are immutable execution inputs; an executor MUST NOT rewrite an input event to reflect later action effects.
- `MN-263` A snapshot `note_type`, when present, MUST equal the note type resolved at that event boundary.

### Execution Capabilities and Targets

Automation is optional operational behavior, not a new requirement on read-only validators. Capability identifiers let a caller discover whether a tool can safely perform the requested class of work.

Rules:

- `MN-147` The core execution capability identifiers are `automation.one_hop`, `automation.schedule`, `automation.propagation`, and `automation.destructive`.
- `MN-148` A tool MUST NOT claim an execution capability unless it implements every core rule attached to that capability.
- `MN-149` A tool asked to perform an unsupported capability MUST make no collection change.
- `MN-188` A tool asked to perform an unsupported capability MUST return an `unsupported_capability` diagnostic in an aborted automation run report.
- `MN-150` `automation.one_hop` covers event matching and every non-destructive action defined in [Collection Model](collection-model.md#automation-rules).
- `MN-151` `automation.schedule` additionally covers schedule evaluation and targeted `schedule.tick` emission.
- `MN-152` `automation.destructive` additionally covers approved `hard_delete_note` actions.
- `MN-265` `automation.propagation` additionally covers multi-wave execution through a fixed point.
- `MN-266` A propagation run containing `hard_delete_note` requires both `automation.propagation` and `automation.destructive`.
- `MN-153` An event-triggered automation evaluates `scope`, `when`, and `trigger.changed` against the immutable event snapshots selected by its trigger semantics.
- `MN-154` A schedule-triggered automation with `scope` or `when` evaluates the current managed notes in normalized path order and treats each matching note as one target.
- `MN-189` A schedule-triggered automation without `scope` or `when` executes its action list once for the scheduled occurrence.
- `MN-260` A `schedule.tick` event MUST be evaluated only by the automation named in its `schedule.automation` value.
- `MN-261` A `schedule.tick` event MUST declare `origin: schedule`.
- `MN-264` An executor MUST validate the effective automation set before evaluating an event.
- `MN-267` An invalid effective automation set is a `validation_failed` execution failure.
- `MN-268` An executor that detects an invalid effective automation set MUST abort before staging an action.
- `MN-156` All automation rules that match an input event MUST be selected before any action from that event is applied.
- `MN-157` Matching automation rules MUST be processed in the deterministic rule order defined by `CM-247`.
- `MN-158` A rule's actions MUST be processed in declared list order.
- `MN-159` Trigger, scope, and `when` evaluation MUST NOT observe patches produced earlier in the same one-hop run.

### Action Effects and Atomicity

Actions request ordinary TypedMark operations; they do not bypass effective schemas, canonical materialization, storage, relationships, or mandatory-tag policies. The executor builds the complete result before changing collection files.

Rules:

- `MN-160` Every action effect MUST be staged before any staged collection file is committed.
- `MN-259` A successful one-hop run MUST commit its complete staged changes as one logical transaction.
- `MN-161` Two staged actions in one wave that assign unequal parsed values to the same field of the same note are a `conflicting_write` failure.
- `MN-162` Two staged actions that request the same semantic change MAY be coalesced into one change.
- `MN-163` `set_field` MUST target a top-level field declared in the target note's effective `frontmatter`.
- `MN-164` `set_field` MUST NOT target a field declaring `computed`, `immutable: true`, `const_value`, or `value_from_schema`.
- `MN-165` A `set_field` value MUST satisfy the target field's effective type, nullability, and value constraints.
- `MN-166` `add_tag` MUST append its tag when absent.
- `MN-167` `remove_tag` MUST remove only the exact stored tag named by the action.
- `MN-168` `remove_tag` targeting an effective mandatory tag is an `action_failed` failure.
- `MN-169` `add_tag` and `remove_tag` MUST preserve the relative order of every unaffected stored tag.
- `MN-170` `move_note` MUST produce a final path conforming to the target note's effective storage rules.
- `MN-171` `move_note` MUST update resolvable internal references whose targets would otherwise break, or abort before committing the move.
- `MN-172` `archive_note` MUST set the core `archived` field to `true`.
- `MN-190` `archive_note` MUST apply the note type's effective archive storage policy.
- `MN-173` `create_note` MUST invoke the ordinary typed-note creation pipeline using the declared note type and supplied values.
- `MN-174` `logical_delete_note` MUST apply the logical deletion semantics defined for the core `deleted` field on this page.
- `MN-175` `hard_delete_note` MUST apply the hard deletion semantics defined on this page.
- `MN-191` `hard_delete_note` MUST report affected inbound links before commit.
- `MN-176` `hard_delete_note` MUST NOT execute without explicit approval for the current run.
- `MN-177` Every staged note that remains after the action list MUST undergo generation, schema-derived value application, computed-field recomputation, mandatory-tag materialization, and canonical field materialization before validation.
- `MN-270` Every staged note whose path or frontmatter changed MUST be re-associated through the note-type mapping pipeline before effective-schema materialization.
- `MN-178` The complete staged result MUST pass instantiated-collection conformance before an automation run commits.
- `MN-179` If trigger evaluation, an action, materialization, or validation fails, a one-hop run MUST commit none of its staged changes.
- `MN-262` Automation-origin events from an aborted run MUST NOT be published outside that run.
- `MN-180` A failed run triggered by an already-observed external file change MUST leave every automation-produced dependent patch uncommitted.
- `MN-192` A failed automation run MUST NOT revert an external source change that was already observed before the run began.
- `MN-181` A semantic no-op MUST NOT produce a new automation event.
- `MN-182` Events describing committed one-hop action effects MUST carry `origin: automation` and their `caused_by` chain.
- `MN-183` One-hop mode MUST NOT consume the automation-origin events it produces during the same run.
- `MN-184` Every one-hop execution attempt MUST produce the portable automation run report defined in [Conformance and Roadmap](conformance-and-roadmap.md#automation-run-reports).
- `MN-193` For each execution target, every action except `create_note` applies to that target note.
- `MN-194` A `create_note` action creates a distinct managed note through the ordinary creation pipeline.
- `MN-195` Committed one-hop `set_field`, `add_tag`, `remove_tag`, and `logical_delete_note` effects produce `note.updated` events.
- `MN-196` A committed one-hop `move_note` effect produces a `note.moved` event.
- `MN-197` A committed one-hop `archive_note` effect produces a `note.archived` event.
- `MN-198` A committed one-hop `create_note` effect produces a `note.created` event.
- `MN-199` A committed one-hop `hard_delete_note` effect produces a `note.deleted` event.
- `MN-200` `add_tag` MUST have no effect when the exact tag is already stored.

## Dependency Propagation and Consistency

Propagation mode deliberately follows automation-produced and derived body-update events beyond the first hop. It derives a transient dependency graph from the effective collection, evaluates changes in deterministic waves against one staged state, and commits only after the cascade reaches a valid fixed point. The graph is an execution aid, never a second source of truth.

```json
{
  "specification_version": "0.0.1",
  "run_id": "run-01k0propagation",
  "mode": "propagation",
  "status": "committed",
  "root_event_ids": ["evt-project-done"],
  "waves": [
    {
      "index": 0,
      "event_ids": ["evt-project-done"],
      "automations": ["clear-project-review"],
      "changes": [
        {
          "kind": "field",
          "path": "Projects/TypedMark.md",
          "field": "review_needed",
          "before": true,
          "after": false
        }
      ]
    },
    {
      "index": 1,
      "event_ids": ["evt-review-cleared"],
      "automations": ["archive-reviewed-project"],
      "changes": [
        {
          "kind": "note",
          "path": "Projects/TypedMark.md",
          "operation": "archive"
        }
      ]
    }
  ],
  "diagnostics": []
}
```

### Propagation Inputs and Dependency Graph

The graph makes all currently defined read and write dependencies explicit enough to order recomputation and detect feedback. Implementations may cache it, but each wave is evaluated against the graph implied by the current staged artifacts and notes.

Rules:

- `MN-201` An `automation.propagation` run MUST begin from one or more immutable root events.
- `MN-202` Root events MUST be ordered by `occurred_at` instant and then by exact `event_id` in ascending Unicode code-point order.
- `MN-203` Every event in one propagation wave observes the same staged collection state produced by the preceding wave.
- `MN-204` All automation matches for a wave MUST be selected before any action in that wave is applied.
- `MN-205` Matching automations in a propagation wave MUST use the deterministic order defined by `CM-247`.
- `MN-206` An automation's actions in propagation mode MUST use declared list order.
- `MN-207` An automation-origin event produced by one wave MUST NOT be consumed before the next wave.
- `MN-252` Events generated by one wave MUST preserve the semantic production order of parent event, automation, target path, action, and derived operation.
- `MN-208` A propagation executor MUST derive its dependency graph from the effective governed artifacts and current staged collection state.
- `MN-209` A graph data node identifies one immutable event value, scheduled instant, collection-note existence, resolved note type, normalized path, note body, body-link target, or top-level frontmatter field.
- `MN-210` A graph operation node identifies one note-type mapping, automation rule, computed-field evaluation, mandatory-tag materialization, storage-path evaluation, internal-link repair, or automatic content-expansion evaluation.
- `MN-211` A graph read edge connects a data node to every operation whose declared trigger, scope, predicate, expression, path pattern, or link resolution reads that data.
- `MN-212` A graph write edge connects an operation to every data node whose semantic value it can change.
- `MN-213` Every sibling-field reference in a `computed` expression creates a read edge to the computed field's operation node.
- `MN-214` Every field placeholder in an effective storage pattern creates a read edge to the storage-path operation node.
- `MN-215` Every resolvable internal note link creates a read edge from its target's existence and path to the link-repair operation node.
- `MN-275` Every applicable source input declared by an `auto` content expansion MUST create a read edge to that expansion's operation node.
- `MN-276` An automatic content-expansion operation MUST create a write edge to its identified materialized region.
- `MN-277` A `manual`, materialized `once`, or `once_and_eject` expansion MUST NOT create an automatic content-expansion operation node.
- `MN-216` An executor MUST rebuild affected graph nodes and edges after each staged wave.
- `MN-217` A cached dependency graph MUST be disposable and reproducible from authoritative collection state.
- `MN-218` A dependency graph or graph cache MUST NOT become authoritative collection input.

### Waves, Fixed Points, and Cycles

Each wave stages ordinary TypedMark operations, recomputes directly affected derived values, and emits only semantic changes. Repeated collection state is a cycle; excessive forward progress is bounded by the configured wave limit.

Rules:

- `MN-219` Each propagation wave MUST stage action effects through the one-hop action semantics on this page.
- `MN-269` Each propagation wave MUST re-resolve affected note-type mappings before it recomputes schema-dependent values.
- `MN-220` Each propagation wave MUST recompute affected computed fields before it produces events for the next wave.
- `MN-221` Each propagation wave MUST re-evaluate affected storage paths before it produces events for the next wave.
- `MN-222` Each propagation wave MUST repair affected resolvable internal links before it produces events for the next wave.
- `MN-278` Each propagation wave MUST refresh affected `auto` content expansions after recomputing fields, paths, and repaired links for that wave.
- `MN-279` A changed materialized region MUST produce a `note.updated` event carrying `body_changed: true` for the next wave.
- `MN-280` A changed materialized region MUST be recorded as an `expansion` change in the portable run report.
- `MN-223` A semantic change produced by a wave MUST emit the corresponding automation-origin event for the next wave.
- `MN-224` A semantic no-op in a propagation wave MUST NOT emit an event.
- `MN-225` Unequal writes to the same data node within one wave are a `conflicting_write` failure.
- `MN-257` A wave that stages hard deletion of a note and another write to the same note is a `conflicting_write` failure.
- `MN-258` Two note creations that resolve to the same normalized path in one run are a `conflicting_write` failure.
- `MN-226` Equal writes to the same data node within one wave MAY be coalesced.
- `MN-227` A later wave MAY replace a value staged by an earlier wave.
- `MN-228` A propagation run reaches a fixed point when no semantic change leaves an event pending for another wave.
- `MN-229` A propagation executor MUST compute a deterministic fingerprint of the complete staged collection state and semantic pending-event payloads after each wave, excluding event identifiers, timestamps, and causal identifiers.
- `MN-230` Repetition of a propagation fingerprint within one run is a `cycle_detected` failure.
- `MN-231` The effective `automation_defaults.max_propagation_waves` counts every processed wave, including wave `0`.
- `MN-232` A propagation executor MUST NOT process more than the effective `max_propagation_waves`.
- `MN-233` A run with pending events after its permitted final wave is a `wave_limit_exceeded` failure.
- `MN-234` A propagation run MUST reach a fixed point before committing any staged change.

### Atomic Commit, Recovery, and Approval

The entire propagation closure is one logical transaction. Destructive work is previewed against that closure, while a recovery record ensures an interrupted multi-file commit can be completed or rolled back before another run starts.

Rules:

- `MN-235` A propagation executor MUST stage the complete cascade before changing a collection file.
- `MN-236` The fixed-point staged collection MUST pass instantiated-collection conformance before commit.
- `MN-237` A propagation failure before commit MUST leave every propagation-produced patch uncommitted.
- `MN-238` A propagation failure MUST NOT revert a root change that existed before the run began.
- `MN-239` A successful propagation run MUST commit its complete staged closure as one logical transaction.
- `MN-240` Before replacing the first collection file, an executor MUST persist a recovery record sufficient to establish either the complete pre-run or complete post-run state.
- `MN-241` A recovery record MUST be stored outside authoritative collection input or under excluded tool state.
- `MN-242` After interruption, an executor MUST complete recovery before starting another automation run.
- `MN-243` An executor that cannot establish either complete transaction state MUST report `incomplete_commit`.
- `MN-244` An executor that reports `incomplete_commit` MUST block further automation writes until recovery succeeds.
- `MN-253` An executor MUST NOT expose a collection as transactionally settled while automation recovery is pending.
- `MN-254` Automation write transactions MUST be serialized within one collection.
- `MN-255` An executor MUST fingerprint the collection state from which an automation run is staged.
- `MN-256` A change to that baseline before commit is a `concurrent_change` failure.
- `MN-245` A propagation closure containing `hard_delete_note` MUST be previewed before commit.
- `MN-246` A destructive preview MUST identify every note selected for hard deletion.
- `MN-247` A destructive preview MUST identify every inbound link affected by the selected hard deletions.
- `MN-248` Destructive approval MUST bind the current `run_id` and the previewed closure fingerprint.
- `MN-249` A change to the previewed destructive closure invalidates its approval.
- `MN-250` A destructive propagation closure without valid explicit approval is an `approval_required` failure.
- `MN-251` Every propagation execution attempt MUST produce a portable automation run report.

