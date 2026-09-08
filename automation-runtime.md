---
title: Automation Runtime
parent: TypedMark
nav_order: 26
audience: tool-authors
---

# Automation Runtime

Audience: tool authors implementing automation execution.

Authoritative for:

- automation events, execution capabilities, targets, and one-hop action effects
- dependency propagation, fixed points, and cycle detection
- atomic commit, recovery, and destructive previews and approval

See also:

- [Automation Artifacts](automation-artifacts.md): automation definitions, triggers, actions, and defaults
- [Managed Notes and Properties](managed-notes-and-properties.md): managed-note fields, materialization, and deletion semantics
- [Content Expansion](content-expansion.md): synchronized derived Markdown regions
- [Conformance and Roadmap](automation-reports.md#automation-run-reports): portable automation run reports

## Automation Events and One-Hop Execution

Automation execution consumes an immutable event envelope and produces a staged collection patch. Event triggers describe note lifecycle changes; schedule triggers are represented at runtime by targeted `schedule.tick` events. A body-only update uses `body_changed: true` instead of inventing a frontmatter field change. This contract standardizes the observable inputs and effects, while [Collection Model](automation-artifacts.md#automation-rules) owns the automation artifact itself.

<!-- typedmark-example: artifact=automation-event -->
```json
{
  "specification_version": "0.1.0",
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
- `MN-150` `automation.one_hop` covers event matching and every non-destructive action defined in [Collection Model](automation-artifacts.md#automation-rules).
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
- `MN-164` `set_field` MUST NOT target a field declaring `computed`, `immutable: true`, or `const_value`.
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
- `MN-174` `logical_delete_note` MUST apply the logical deletion semantics defined for the core `deleted` field in [Managed Notes and Properties](managed-notes-and-properties.md#core-defined-frontmatter-field-names).
- `MN-175` `hard_delete_note` MUST apply the hard deletion semantics defined in [Managed Notes and Properties](managed-notes-and-properties.md#core-defined-frontmatter-field-names).
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
- `MN-184` Every one-hop execution attempt MUST produce the portable automation run report defined in [Conformance and Roadmap](automation-reports.md#automation-run-reports).
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

<!-- typedmark-example: artifact=automation-run-report -->
```json
{
  "specification_version": "0.1.0",
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
