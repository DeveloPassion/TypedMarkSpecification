---
title: Automation Artifacts
parent: TypedMark
nav_order: 23
audience: advanced
---

# Automation Artifacts

Audience: collection authors declaring portable automation rules and tool authors interpreting them.

Authoritative for:

- governed automation rule artifacts
- event and schedule triggers, scope transitions, targeting predicates, and action vocabulary

See also:

- [Collection Model](collection-model.md): automation defaults, timezone, note-type mapping predicates, and shared path matching
- [Managed Notes and Properties](managed-notes-and-properties.md): automation execution and dependency propagation
- [Field Definition Reference](field-definition-reference.md): field-value equality and tags
- [Conformance and Roadmap](conformance-and-roadmap.md): portable automation interchange

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.md` `metadata_directory`.

## Automation Rules

Automation rules declare portable reactions without embedding executable code. Each rule is a governed Markdown artifact under `<metadata_directory>/automations/`; its frontmatter identifies one trigger, optional targeting predicates, and an ordered action list, while its body explains the rule to humans and agents. Execution and propagation behavior are authoritative in [Managed Notes and Properties](managed-notes-and-properties.md).

<!-- typedmark-example: artifact=automation -->
```yaml
specification_version: 0.1.0
automation: project-completed
description: Archive a project when its status becomes done.
priority: 100
trigger:
  kind: event
  event: note.updated
  changed:
    status:
      to: done
scope:
  note_types:
    - project
when:
  archived:
    equals: false
actions:
  - kind: set_field
    field: review_needed
    value: false
  - kind: add_tag
    tag: state/completed
  - kind: archive_note
failure: abort
```

Rules:

- `CM-240` `<metadata_directory>/automations/` MAY be omitted when the collection defines no automation rules.
- `CM-241` Every Markdown file directly under `<metadata_directory>/automations/` defines exactly one automation rule.
- `CM-242` An automation file's basename without `.md` MUST equal its top-level `automation` value.
- `CM-243` An automation rule MUST physically contain `specification_version`, `automation`, `description`, `trigger`, and `actions`.
- `CM-244` `automation` MUST be a slug that is unique across the collection's effective automation rules.
- `CM-245` `description` MUST be a non-empty human-facing string.
- `CM-246` `priority` MAY be omitted, and when omitted its effective value is `0`.
- `CM-247` Automation rules are ordered by descending effective `priority`, with equal-priority rules ordered by exact `automation` identifier in ascending Unicode code-point order.
- `CM-248` `trigger.kind` MUST be `event` or `schedule`.
- `CM-249` An event trigger MUST declare `event` as one of `note.created`, `note.updated`, `note.moved`, `note.archived`, or `note.deleted`.
- `CM-250` `trigger.changed` MAY appear only on a `note.updated` event trigger.
- `CM-280` `trigger.changed` MUST map one or more top-level field names to a predicate containing `from`, `to`, or both.
- `CM-251` A `from` or `to` change predicate compares the corresponding parsed value in the event's `changes` entry by exact field-value equality under [Field Definition Reference](field-definition-reference.md).
- `CM-252` `scope` MAY declare `note_types`, `path`, or both.
- `CM-281` A target matches `scope` only when every declared scope constraint matches.
- `CM-253` Each identifier in `scope.note_types` MUST resolve to exactly one concrete note type.
- `CM-254` `scope.path` MUST declare exactly one of `equals`, `under`, or `regex`.
- `CM-282` `scope.path` uses the common [Path Matching](collection-model.md#path-matching) semantics.
- `CM-255` `when`, when present, MUST use the frontmatter predicate shape and semantics defined for `note_type_mappings` in [Collection Model](collection-model.md#note-type-mappings).
- `CM-256` `trigger.scope_transition` MAY be omitted, and when omitted its effective value is `matches_after`.
- `CM-257` `trigger.scope_transition` MUST be `matches_after`, `enters`, or `leaves`.
- `CM-258` `matches_after` evaluates the combined `scope` and `when` target predicate against the event's after snapshot, except that `note.deleted` uses its before snapshot.
- `CM-259` `enters` matches when the before snapshot does not satisfy the combined target predicate and the after snapshot does.
- `CM-260` An `enters` or `leaves` trigger MUST consume an event that carries both before and after snapshots.
- `CM-261` A schedule trigger MUST declare exactly one daily, weekly, or monthly schedule with a wall-clock `at` value in `HH:mm` form.
- `CM-262` A daily schedule is due on every local calendar day at `at` in the collection timezone.
- `CM-263` A weekly schedule MUST declare a weekday.
- `CM-284` A weekly schedule is due on its declared local weekday at `at` in the collection timezone.
- `CM-264` A monthly schedule MUST declare a day from `1` through `31`.
- `CM-285` A monthly schedule is not due in a local calendar month that lacks its declared day.
- `CM-265` If a scheduled local time does not exist because of an offset transition, its occurrence is the first valid instant after the gap.
- `CM-266` If a scheduled local time occurs twice because of an offset transition, its occurrence is the earlier instant.
- `CM-267` A schedule executor MUST emit at most one `schedule.tick` event for each automation and scheduled instant.
- `CM-268` `actions` MUST be a non-empty ordered list.
- `CM-269` Supported action kinds are `set_field`, `add_tag`, `remove_tag`, `move_note`, `archive_note`, `create_note`, `logical_delete_note`, and `hard_delete_note`.
- `CM-270` `set_field` MUST declare a top-level `field` name and a parsed YAML `value`.
- `CM-271` `add_tag` and `remove_tag` MUST declare one tag satisfying the stored tag-entry grammar in [Field Definition Reference](field-definition-reference.md).
- `CM-272` `move_note` MUST declare a collection-relative Markdown `path`.
- `CM-273` `archive_note`, `logical_delete_note`, and `hard_delete_note` MUST NOT declare action operands.
- `CM-274` `create_note` MUST declare a concrete `note_type`.
- `CM-283` `create_note` MAY declare a `values` mapping keyed by top-level field name.
- `CM-275` `failure` MAY be omitted, and when omitted its effective value is `abort`.
- `CM-276` This specification version supports only `failure: abort`.
- `CM-277` Automation rules MUST NOT declare arbitrary scripts, commands, prompts, network calls, or executable expressions as triggers or actions.
- `CM-278` Every field, note type, path, tag, and other governed reference in an automation rule MUST be valid for every target on which its action can execute.
- `CM-279` An automation artifact that violates its shape, resolution, or target-compatibility rules is an `invalid_automation` failure.
- `CM-292` A `trigger.changed` field absent from the event's `changes` mapping does not match.
- `CM-293` An omitted `from` or `to` member places no constraint on that side of the field change.
- `CM-294` `leaves` matches when the before snapshot satisfies the combined target predicate and the after snapshot does not.
- `CM-295` An `enters` or `leaves` trigger MUST declare `scope`, `when`, or both.
- `CM-296` A schedule-triggered automation without `scope` or `when` MUST contain only `create_note` actions.

## Automation Defaults

`automation_defaults` holds collection-wide safety policy for automation execution. Its propagation limit bounds forward progress even when a cascade never repeats a state exactly.

<!-- typedmark-example: fragment: Collection automation defaults. -->
```yaml
automation_defaults:
  max_propagation_waves: 100
```

Rules:

- `CM-286` `automation_defaults` MAY be omitted.
- `CM-287` An omitted `automation_defaults` value is equivalent to an empty mapping.
- `CM-288` `automation_defaults.max_propagation_waves` MAY be omitted.
- `CM-289` The effective `max_propagation_waves` is `100` when it is omitted.
- `CM-290` `max_propagation_waves` MUST be a positive integer.
- `CM-291` `max_propagation_waves` MUST NOT exceed `10000`.

## Collection Conformance

These checks apply when the collection uses this optional contract.

Rules:

- `CR-60` Every automation file under `<metadata_directory>/automations/`, if present, is valid under [Collection Model](collection-model.md).

## Diagnostic Categories

These categories use the collection severity policy.

Rules:

- `CM-543` `invalid_automation` applies when an automation artifact violates [Automation Artifacts](automation-artifacts.md).
