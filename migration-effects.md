---
title: Migration Effects
parent: TypedMark
nav_order: 10
audience: advanced
---

# Migration Effects on Collection Content

Audience: system publishers and tool authors.

Authoritative for:

- the collection-content effect of every `history.md` change operation
- mandatory-tag policy changes during collection and note-type migrations
- application of shared field conversions during `retype_field` migrations
- template-region drift evaluation after `change_template`
- saved-view reference behavior after saved-view changes

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): the change history, the migration plan, and the update flow that orders these operations
- [Managed Notes and Properties](managed-notes-and-properties.md): the canonical materialization rules migrations must restore

## Migrating Managed Notes

When a collection is updated to newer versions of its source systems, the migration plan defined in [Systems, Composition, and Evolution](systems-composition-evolution.md) is applied to affected governed references and collection content. Each system change operation recorded in `history.md` has a defined effect here. The migration plan determines the order in which these operations are applied; this page defines what each one does to a note or governed reference.

Rules:

- `ME-1` A migration operation that names `note_type` applies only to managed notes whose resolved note type is that note type.
- `ME-2` A field operation that names `property_set` applies to every managed note whose path-dependent effective schema composes that property set.
- `ME-3` `add_field` MUST add the new field to every affected managed note, materialized to a freshly generated value when the field declares a generation strategy, and otherwise to its `default_value` or to `null` under the Canonical Field Materialization rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `ME-4` `remove_field` MUST remove the named field from every affected managed note.
- `ME-5` `rename_field` MUST move the stored value from the old field name to the new field name in every affected managed note, preserving the value unchanged.
- `ME-6` `retype_field` MUST convert each stored value under the shared [Field Compatibility and Conversion](field-definition-reference.md#field-compatibility-and-conversion) rules.
- `ME-7` `change_field` MUST re-validate every affected managed note against the field's new constraints; a stored value that violates the new constraints MUST be reported rather than silently dropped or altered.
- `ME-8` `rename_note_type` MUST update the stored `note_type` field when present, MUST re-resolve the note's storage path under the renamed type's effective storage rules, and MUST update internal note links and relationship-bearing fields that target the renamed type.
- `ME-9` `change_storage` MUST re-resolve the storage path of every affected managed note under the new effective storage rules, MUST move each note whose stored path no longer conforms, and MUST update internal note links so moved notes still resolve; a move or link update that cannot be applied safely MUST be reported for explicit resolution.
- `ME-10` `change_template` has no direct managed-note write effect; a migration tool MUST re-evaluate enrolled managed notes against the new canonical template.
- `ME-11` `change_headings` and `change_relationships` MUST re-validate every affected managed note against the new effective heading and relationship rules; violations MUST be reported, and a migration MUST NOT restructure note body content automatically.
- `ME-12` `change_note_type` and `change_collection` have the managed-note effect of the resulting change to each note's effective schema and mandatory-tag policy, evaluated through the operations above and re-validation.
- `ME-13` `add_note_type`, `remove_note_type`, `add_property_set`, `remove_property_set`, and `rename_property_set` change which schemas and property sets exist; their effect on an individual managed note is only the resulting change to that note's effective schema, evaluated through the field operations above.
- `ME-14` After a migration operation is applied, every affected managed note MUST satisfy the Canonical Field Materialization rules defined in [Managed Notes and Properties](managed-notes-and-properties.md).
- `ME-15` A migration MUST NOT discard managed-note data silently; any operation that cannot preserve data MUST be reported for explicit resolution, as required by [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `ME-16` A field whose name is changed by `rename_field` follows the managed-note field-name rules defined in [Managed Notes and Properties](managed-notes-and-properties.md); a rename whose target name violates those rules is invalid.
- `ME-20` When `change_note_type` or `change_collection` changes an affected note's effective mandatory tags, the migration MUST recompute that sequence from the migrated collection state.
- `ME-21` A migration MUST append every newly missing mandatory tag under the materialization rules in [Managed Notes and Properties](managed-notes-and-properties.md).
- `ME-22` A migration MUST NOT remove a stored tag solely because the migrated policy no longer mandates it.
- `ME-23` After mandatory-tag materialization, a migration MUST re-validate the complete stored `tags` value against the migrated effective field definition.
- `ME-24` `add_automation`, `remove_automation`, and `change_automation` have no direct managed-note effect; the migrated effective automation set applies only to execution events processed after the migration commits.
- `ME-25` A `change_collection` operation that changes only `automation_defaults` has no direct managed-note effect.
- `ME-26` A `change_template` operation MUST NOT copy changed content-expansion descriptors or regions into existing managed notes.
- `ME-27` A `change_template` operation MUST preserve each affected note's body and `template_regions` receipts while computing its post-migration template-drift states.
- `ME-28` A migration tool MUST NOT reconcile a post-migration template-drift state without a separate reconciliation request under [Template Drift Tracking](relationships-headings-and-templates.md#reconciliation-and-detachment).
- `ME-29` `add_view` has no direct managed-note write effect.
- `ME-30` `change_view` MUST re-evaluate every auto-synchronized content expansion that references the changed saved view.
- `ME-31` `change_view` MUST NOT rewrite a manual content expansion that references the changed saved view without an explicit refresh request.
- `ME-32` Before applying `remove_view`, a migration MUST update, eject, or remove every reference to that saved view so the migrated collection does not contain an unresolved saved-view reference.
- `ME-33` `remove_view` MUST NOT delete materialized Markdown from an ejected content expansion.
- `ME-34` Before a migration containing `change_view` commits, every affected manual content expansion MUST be revalidated against the changed saved view.
- `ME-35` An affected manual content expansion whose materialized region no longer equals its current rendered source result MUST be explicitly refreshed or ejected before the migration commits.

### Field Type Conversions

A `retype_field` migration is one consumer of the shared conversion contract in [Field Definition Reference](field-definition-reference.md#field-compatibility-and-conversion). It changes the field definition and writes compatible converted values back to affected notes; other consumers can use the same conversion semantics without mutating their sources.

For example, retyping `estimate` from `integer` to `number` applies a lossless conversion to every stored value. Retyping it from `number` to `integer` proceeds automatically only when the complete affected value set contains no fractional value.

Rules:

- `ME-36` A lossless `retype_field` conversion MUST be applied automatically.
- `ME-37` A conditional `retype_field` conversion MUST be applied automatically only when every affected stored value is compatible with the target definition.
- `ME-17` A source-target pair classified as incompatible by `FDR-256` MUST be reported for explicit resolution.
- `ME-38` A source-target pair classified as incompatible by `FDR-256` MUST NOT be coerced destructively.
- `ME-18` After conversion, each stored value MUST satisfy the new field definition's constraints.
- `ME-39` A converted value that fails the new field definition MUST be reported for explicit resolution.
- `ME-40` A converted value that fails the new field definition MUST NOT be silently altered.
- `ME-19` A conversion to a non-nullable target MUST NOT introduce `null`.
- `ME-41` A value that cannot convert to a conforming non-null target value MUST be reported for explicit resolution.
