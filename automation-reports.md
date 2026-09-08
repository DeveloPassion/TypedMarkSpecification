---
title: Automation Interchange Reports
parent: TypedMark
nav_order: 29
audience: tool-authors
---

# Automation Interchange Reports

Audience: tool authors exchanging automation events and execution reports.

Authoritative for:

- portable automation event and run-report interchange

See also:

- [Automation Runtime](automation-runtime.md): event production and execution
- [Automation Artifacts](automation-artifacts.md): rule declarations
- [Conformance and Roadmap](conformance-and-roadmap.md): read-only validation reports

Automation execution reports describe writes and recovery. They are separate
from read-only validation reports and are not part of the minimal validation
implementation.

## Automation Run Reports

Automation executors serialize one-hop and propagation outcomes as portable JSON. The report records the root events, deterministic execution waves, actual semantic changes, and machine-stable diagnostics without making the report part of the collection's authoritative state.

<!-- typedmark-example: artifact=automation-run-report -->
```json
{
  "specification_version": "0.1.0",
  "run_id": "run-01k0projectdone",
  "mode": "one_hop",
  "status": "committed",
  "root_event_ids": [
    "evt-01k0projectdone"
  ],
  "waves": [
    {
      "index": 0,
      "event_ids": [
        "evt-01k0projectdone"
      ],
      "automations": [
        "project-completed"
      ],
      "changes": [
        {
          "kind": "field",
          "path": "Projects/TypedMark.md",
          "field": "review_needed",
          "before": true,
          "after": false
        },
        {
          "kind": "tag",
          "path": "Projects/TypedMark.md",
          "tag": "state/completed",
          "operation": "add"
        },
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

Rules:

- `CR-41` Automation events and run reports are portable runtime interchange documents and are not governed collection artifacts.
- `CR-42` A serialized automation event MUST satisfy `automation-event.schema.json`.
- `CR-43` A serialized automation run report MUST satisfy `automation-run-report.schema.json`.
- `CR-44` A run report MUST physically contain `specification_version`, `run_id`, `mode`, `status`, `root_event_ids`, `waves`, and `diagnostics`.
- `CR-45` `mode` MUST be `one_hop` or `propagation`.
- `CR-46` `status` MUST be `committed`, `no_change`, `aborted`, or `incomplete`.
- `CR-47` `committed` means every change recorded by the run was committed successfully.
- `CR-48` `no_change` means the run completed successfully without producing a semantic collection change.
- `CR-49` `aborted` means the executor committed none of the run's staged changes.
- `CR-50` `incomplete` means a commit began but recovery could not establish either the complete pre-run or complete post-run state.
- `CR-51` `root_event_ids` MUST identify every external or caller-supplied event that initiated the run.
- `CR-52` `waves` MUST appear in ascending contiguous `index` order starting at `0`.
- `CR-53` A `one_hop` report MUST contain at most one wave.
- `CR-54` Each wave MUST identify its consumed events, matched automations, and semantic changes.
- `CR-55` Diagnostic `code` values are machine-stable.
- `CR-56` Run diagnostics MUST use only `unsupported_capability`, `trigger_error`, `action_failed`, `conflicting_write`, `validation_failed`, `cycle_detected`, `wave_limit_exceeded`, `approval_required`, `concurrent_change`, or `incomplete_commit`.
- `CR-57` A run report's change list MUST record only semantic changes.
- `CR-58` Run reports MAY be stored outside the collection or under ignored tool state.
- `CR-61` An `aborted` report MUST include at least one diagnostic.
- `CR-62` An `incomplete` report MUST include an `incomplete_commit` diagnostic.
- `CR-63` Consumers MUST NOT parse diagnostic `message` as an identifier.
- `CR-64` A run report's change list MUST NOT record coalesced no-ops.
- `CR-65` Run reports MUST NOT become authoritative collection input.
- `CR-66` A wave's `event_ids` MUST use the canonical event order defined in [Managed Notes and Properties](automation-runtime.md#dependency-propagation-and-consistency).
- `CR-67` A wave's `automations` MUST use the execution order defined in [Collection Model](automation-artifacts.md#automation-rules).
- `CR-68` A wave's `changes` MUST preserve semantic production order after no-op coalescing.
- `CR-69` A `field` change records one top-level field's parsed before and after values.
- `CR-70` A `tag` change records one exact tag addition or removal.
- `CR-71` A `path` change records one managed note's normalized before and after paths.
- `CR-72` A `note` change records one note creation, archive, logical deletion, or hard deletion.
- `CR-73` A `link` change records one internal-link retargeting in note body content or a top-level frontmatter field.
- `CR-83` An `expansion` change records one identified content expansion's materialized region before and after refresh.
- `CR-74` A `committed` report MUST record at least one semantic change.
- `CR-75` A `no_change` report MUST record no semantic changes.
- `CR-76` An `aborted` report MUST record no semantic changes.
- `CR-77` A change object's `path` is its post-change normalized path when the note remains, or its pre-change normalized path for hard deletion.
- `CR-78` `root_event_ids` MUST use the canonical root-event order defined in [Managed Notes and Properties](automation-runtime.md#propagation-inputs-and-dependency-graph).
- `CR-79` Run diagnostics MUST be ordered by wave, path, automation, field, code, and message, with absent values before present values and exact Unicode code-point comparison within each component.
- `CR-80` `run_id` MUST be unique within the execution history available to the executor.
- `CR-81` A `committed` report MUST record every semantic collection change produced by the run.
- `CR-82` A `committed` or `no_change` report MUST contain no failure diagnostic.
