---
title: Migration Effects
parent: TypedMark
nav_order: 10
audience: advanced
---

# Migration Effects on Managed Notes

Authoritative for:

- the managed-note effect of every `history.md` change operation
- field type conversions during `retype_field` migrations

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): the change history, the migration plan, and the update flow that orders these operations
- [Managed Notes and Properties](managed-notes-and-properties.md): the canonical materialization rules migrations must restore

## Migrating Managed Notes

When a collection is updated to newer versions of its source systems, the migration plan defined in [Systems, Composition, and Evolution](systems-composition-evolution.md) is applied to managed notes. Each system change operation recorded in `history.md` has a defined effect on managed-note frontmatter, defined here. The migration plan determines the order in which these operations are applied; this page defines what each one does to a note.

Rules:

- `ME-1` A migration operation that names `note_type` applies only to managed notes whose resolved note type is that note type.
- `ME-2` A field operation that names `property_set` applies to managed notes of every note type whose effective schema composes that property set.
- `ME-3` `add_field` MUST add the new field to every affected managed note, materialized to a freshly generated value when the field declares a generation strategy, and otherwise to its `default_value` or to `null` under the Canonical Field Materialization rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `ME-4` `remove_field` MUST remove the named field from every affected managed note.
- `ME-5` `rename_field` MUST move the stored value from the old field name to the new field name in every affected managed note, preserving the value unchanged.
- `ME-6` `retype_field` MUST convert each stored value under the Field Type Conversions rules below: a defined lossless conversion is applied automatically, a conditional conversion is applied only when every affected value qualifies, and every other type pair MUST be reported for explicit resolution and MUST NOT be coerced destructively.
- `ME-7` `change_field` MUST re-validate every affected managed note against the field's new constraints; a stored value that violates the new constraints MUST be reported rather than silently dropped or altered.
- `ME-8` `rename_note_type` MUST update the stored `note_type` field when present, MUST re-resolve the note's storage path under the renamed type's effective storage rules, and MUST update internal note links and relationship-bearing fields that target the renamed type.
- `ME-9` `change_storage` MUST re-resolve the storage path of every affected managed note under the new effective storage rules, MUST move each note whose stored path no longer conforms, and MUST update internal note links so moved notes still resolve; a move or link update that cannot be applied safely MUST be reported for explicit resolution.
- `ME-10` `change_template` has no direct managed-note effect; tools MAY re-evaluate `template_drift` against the new canonical template.
- `ME-11` `change_headings` and `change_relationships` MUST re-validate every affected managed note against the new effective heading and relationship rules; violations MUST be reported, and a migration MUST NOT restructure note body content automatically.
- `ME-12` `change_note_type` and `change_collection` have the managed-note effect of the resulting change to each note's effective schema, evaluated through the operations above and re-validation.
- `ME-13` `add_note_type`, `remove_note_type`, `add_property_set`, `remove_property_set`, and `rename_property_set` change which schemas and property sets exist; their effect on an individual managed note is only the resulting change to that note's effective schema, evaluated through the field operations above.
- `ME-14` After a migration operation is applied, every affected managed note MUST satisfy the Canonical Field Materialization rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `ME-15` A migration MUST NOT discard managed-note data silently; any operation that cannot preserve data MUST be reported for explicit resolution, as required by [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `ME-16` A field whose name is changed by `rename_field` follows the managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md); a rename whose target name violates those rules is invalid.

### Field Type Conversions

A `retype_field` migration changes a field's declared `type`. Conversions fall into three tiers, defined by the source type and target type pair.

Defined lossless conversions are always information-preserving and a tool MUST apply them automatically:

- `integer` to `number`, because every integer is a valid number.
- `date` to `text`, `time` to `text`, `datetime` to `text`, and `link` to `text`, because these types are stored as strings and the stored characters are unchanged.
- `tags` to `list` when the target `items.type` is `text`, because every tag value is a valid text item and the stored sequence is unchanged.
- any type to `any`, because `any` accepts any non-null value.

Conditional conversions are information-preserving only for values that already satisfy the target type and its constraints. A tool MUST apply a conditional conversion only when every affected stored value qualifies, and MUST otherwise report the field for explicit resolution:

- `number` to `integer`, when every value has no fractional component.
- `text` to `link`, and `text` to `date`, `time`, or `datetime`, when every value satisfies the target type's `format`.
- `list` to `tags`, when the source `items.type` is `text` and every item is a non-empty string.
- `any` to a concrete type, when every value satisfies that type.

Rules:

- `ME-17` Any source and target type pair not listed above MUST be reported for explicit resolution and MUST NOT be coerced destructively.
- `ME-18` A conversion changes only the stored representation; after conversion, each value MUST satisfy the new field definition's constraints under the rules on this page, and a value that fails is reported rather than silently altered.
- `ME-19` A conversion to a non-nullable target MUST NOT introduce `null`; a value that cannot be converted to a conforming non-null value is reported for explicit resolution.

