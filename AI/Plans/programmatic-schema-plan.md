# Plan: Programmatic Schema for the TypedMark Specification

## Goal

Create a machine-readable schema layer for TypedMark that tools can use to validate the structure of governed artifacts, while keeping the prose specification as the source of truth for semantics that cannot be expressed cleanly in a schema language alone.

## Why This Exists

TypedMark already defines strong structural rules for:

- `.metadata/system.yaml`
- `typedmark.yaml`
- `.metadata/instance.yaml`
- `.metadata/schemas/<note_type>.yaml`

Those rules are currently described only in prose. A programmatic schema would make it easier to:

- validate authoring errors early
- generate editor tooling and completion
- implement importers and validators more consistently
- build conformance fixtures against a stable machine-readable contract

The schema layer should complement the specification, not replace it.

## Recommended Approach

Use a layered model:

1. Define machine-readable schemas for the governed artifact shapes.
2. Define a separate semantic validation layer for cross-file, filesystem, inheritance, link-resolution, and conformance behaviors.
3. Add a fixture-based conformance suite so the prose spec, schemas, and validator stay aligned.

## Recommendation on Format

Recommended baseline: JSON Schema

Reasons:

- broad ecosystem support
- good tooling for JSON- and YAML-backed validation
- easy integration with editors, CI, and validators
- understandable to contributors who are not already using a niche schema system

Optional future enhancement: author the schema source in CUE and generate JSON Schema from it if the project later wants stronger composition and reuse.

For the first pass, JSON Schema is the pragmatic choice.

## Scope Boundary

### In Scope for Machine-Readable Schemas

- required top-level keys
- allowed keys and block shapes
- scalar types
- enums such as `kind`, `relationship_kind`, validation severities, and archive policies
- reusable field-definition structures
- reusable relationship-definition structures
- constraints that are local to a single governed artifact

### Out of Scope for Machine-Readable Schemas

These should stay in the semantic validator layer:

- filesystem presence and path existence
- equality across files, such as matching `collection_model_id`
- schema file basename matching `note_type`
- merge and override behavior for inherited global properties
- note-link resolution against real notes
- allowed unresolved placeholder links
- relationship cardinality against resolved targets
- canonical serialization formatting and key ordering
- template drift checks
- simultaneous system-definition and instantiated-collection conformance

## Deliverables

1. A schema directory for governed TypedMark artifacts.
2. One JSON Schema file for each governed top-level artifact kind.
3. Shared definitions for reusable blocks.
4. A semantic-rules document that explicitly lists what the schemas do not enforce.
5. Fixture examples:
   - valid artifacts
   - invalid shape examples
   - semantic-only failure examples
6. A validator execution plan showing when to apply JSON Schema validation versus semantic validation.

## Proposed Repository Layout

```text
AI/
  Plans/
    programmatic-schema-plan.md
Schema/
  json-schema/
    typedmark-system.schema.json
    typedmark-root.schema.json
    typedmark-instance.schema.json
    typedmark-note-type.schema.json
    defs.schema.json
  fixtures/
    valid/
    invalid-shape/
    invalid-semantic/
  docs/
    schema-boundary.md
```

The exact folder names can change, but the separation should remain:

- schema artifacts
- fixtures
- boundary/documentation

## Work Plan

### Phase 1: Freeze the Boundary

Write a short design note that maps each major prose rule into one of two buckets:

- schema-enforced
- semantic-validator-enforced

This phase should explicitly capture the current link rule:

- an internal note link may resolve to one existing managed note
- an internal note link may also resolve to zero managed notes when the target note does not exist yet
- zero-resolution links are allowed placeholders, but they do not create concrete relationship instances

Output:

- `Schema/docs/schema-boundary.md`

## Phase 2: Normalize the Artifact Models

Extract the governed artifact contracts from the spec into a structured inventory:

- required keys
- optional keys
- allowed enum values
- reusable substructures
- local constraints that can be expressed in JSON Schema

This should cover:

- system manifest
- root collection descriptor
- instance manifest
- note type schema
- shared blocks such as `frontmatter`, `relationships`, `headings`, `template`, and `storage`

Output:

- implementation notes or a tracking table in `schema-boundary.md`

## Phase 3: Design Reusable Definitions

Create shared schema definitions for:

- validation severity
- field definition
- list item field definition
- scalar formats declared by TypedMark
- relationship target constraint
- headings block
- scaffold note entry

Important design choice:

- represent TypedMark-specific formats like `note_link` as schema-level enums or annotations, not as full semantic validators inside JSON Schema

Output:

- `Schema/json-schema/defs.schema.json`

## Phase 4: Create Artifact Schemas

Create the first four top-level schemas:

1. `typedmark-system.schema.json`
2. `typedmark-root.schema.json`
3. `typedmark-instance.schema.json`
4. `typedmark-note-type.schema.json`

Each schema should:

- reference shared definitions
- reject unknown structure where the spec is closed
- document non-enforced semantic rules in `$comment` entries where useful

Output:

- the four top-level JSON Schema files

## Phase 5: Document the Semantic Validator Layer

Write a companion note describing the rules that remain outside JSON Schema.

This note should cover at least:

- path and filesystem checks
- inheritance merge behavior
- note-link resolution behavior
- placeholder-link handling
- relationship counting rules
- cardinality enforcement
- canonical materialization
- canonical serialization
- template drift
- conformance-mode evaluation

Output:

- `Schema/docs/schema-boundary.md` updated with a semantic validation section

## Phase 6: Build Fixtures

Create fixture files for:

- valid system manifests
- valid root collection descriptors
- valid instance manifests
- valid note-type schemas
- invalid shape cases caught by JSON Schema
- invalid semantic cases not catchable by JSON Schema

Make sure fixtures include:

- allowed unresolved placeholder links
- ambiguous links as failures
- relationship minimums not satisfied because only unresolved placeholders are present
- inheritance cases that require semantic merging

Output:

- `Schema/fixtures/valid/...`
- `Schema/fixtures/invalid-shape/...`
- `Schema/fixtures/invalid-semantic/...`

## Phase 7: Create a Validation Workflow

Define the intended execution order:

1. parse the governed artifact as YAML
2. validate document shape with JSON Schema
3. build effective models where inheritance applies
4. run semantic validation
5. report shape failures separately from semantic failures

The workflow should preserve the spec distinction between:

- invalid document shape
- valid shape but invalid semantic state
- semantically valid but non-canonical serialization

Output:

- validator workflow note in `Schema/docs/schema-boundary.md` or a dedicated validator design note

## Phase 8: Add Maintenance Rules

Add project rules so the schema layer stays aligned with the prose spec:

- every new governed artifact key must be reflected in the schemas
- every schema change must include or update fixtures
- semantic-only rules must be documented explicitly
- schema files must not silently redefine normative prose behavior

Output:

- contribution guidance note, or a short section in `Schema/docs/schema-boundary.md`

## Acceptance Criteria

The first version is successful when:

- all four governed artifact types have JSON Schemas
- shared reusable definitions are factored out
- the machine-readable schemas validate local document shape correctly
- semantic-only rules are explicitly documented
- fixtures show the difference between shape failures and semantic failures
- unresolved placeholder links are handled consistently with the current spec
- contributors can tell which rules belong in JSON Schema and which belong in the validator

## Risks and Watchouts

- Trying to force all TypedMark semantics into JSON Schema will create a brittle and confusing design.
- If the schema layer stops matching the fixed `typedmark.yaml` root contract and the YAML artifact contracts, implementations will diverge quickly.
- If the schema layer and prose spec evolve independently, tooling will become misleading.
- Canonical serialization must remain a validator concern, not be implied by JSON Schema success.

## Suggested First Milestone

Deliver the smallest useful slice first:

1. boundary note
2. shared definitions
3. schema for `typedmark.yaml`
4. schema for `.metadata/schemas/<note_type>.yaml`
5. a few fixtures that prove the placeholder-link boundary

That milestone would exercise the most important parts of the model without waiting for the full validator to exist.
