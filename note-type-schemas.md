---
title: Note Type Schemas
parent: TypedMark
nav_order: 5
audience: essentials
---

# Note Type Schemas

Audience: collection authors.

Authoritative for:

- local note-type schema shape and effective-schema construction
- note-type metadata, counts, storage, and template references

See also:

- [Collection Model](collection-model.md): association, boundaries, and mandatory-tag policy
- [Managed Notes and Properties](managed-notes-and-properties.md): effective values and Core fields
- [Field Definition Reference](field-definition-reference.md): field declarations
- [Schema Reuse](schema-reuse.md) and [Property Sets](property-sets.md): optional reusable layers
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): body and template contracts

## Note Type Registry

Schemas live directly under `<metadata_directory>/schemas/`; their basenames
identify their types. For example, `meeting.md` defines `meeting` without a
separate registry file or a duplicate managed-note `note_type` field definition.

Rules:

- `NTS-1` Every Markdown file directly under `<metadata_directory>/schemas/` defines one note type.
- `NTS-3` A note type MUST NOT be defined in more than one schema file.
- `NTS-4` A schema's effective `note_type` MUST equal its file basename without `.md`.
- `NTS-6` `abstract: true` defines an abstract type under [Schema Reuse](schema-reuse.md).
- `NTS-7` An omitted or false `abstract` defines a concrete type.

## Effective Note-Type Schema

A Core-only schema uses local definitions and deterministic defaults. Reuse
adds explicitly governed layers; it does not make a second effective-schema
file authoritative.

| Evaluation stage | Core | With Reuse |
| --- | --- | --- |
| Association | Select one concrete type | Same |
| Reusable layers | None | Resolve ancestors and property-set composition |
| Local definitions | Apply the local schema | Apply it after reusable contributions |
| Defaults | Fill defined omissions | Same, after composition |
| Validation | Validate the resulting contract | Same |

For example, a local `status` field with `default_value: draft` has that
definition directly in Core. With Reuse, a local definition can override a
contributed field only under the reusable merge contract.

### Normative Evaluation Pipeline

Rules:

- `NTS-10` A validator MUST select exactly one concrete schema using the association rules in [Collection Model](collection-model.md).
- `NTS-174` A Core-only effective schema MUST be constructed from the selected local definitions and their specified defaults.
- `NTS-175` A schema using reusable structure MUST apply [Schema Reuse](schema-reuse.md) and [Property Sets](property-sets.md) before final local definitions.
- `NTS-19` Local concrete definitions MUST be applied after reusable contributions.
- `NTS-20` The resulting structural blocks and effective top-level metadata form the effective note-type schema.
- `NTS-21` Field, relationship, heading, and storage validation MUST use that effective schema.
- `NTS-22` Conformance MUST NOT require a separately serialized effective-schema artifact.

### Schema File Contract

The table defines local declarations. Reuse can supply inherited blocks;
Core does not guess storage.

| Key | Requirement/default | Shape |
| --- | --- | --- |
| `specification_version` | Required | Core version under Foundations |
| `description` | Required | Non-empty text |
| `note_type` | Basename when omitted | Slug |
| `abstract` | `false` | Boolean |
| `label` | Effective `note_type` | Non-empty text |
| `icon` | Omitted | Non-empty opaque text |
| `frontmatter` | Empty local mapping | Field-definition mapping |
| `storage` | Required effectively for concrete types | Storage block below |
| `template` | Optional | Explicit relative `file` reference when supplied |
| `relationships` | Empty relationship constraints | Relationship block |
| `headings` | No heading constraints | Heading block |
| `guidance` | Omitted | Optional non-empty `when_to_use` / `when_not_to_use` text |
| `unknown_field` | Collection default | `error`, `warn`, `info`, or `off` |
| `count` | Minimum zero, no maximum | Optional non-negative integer `min` / `max` |
| `mandatory_tags` | Empty local policy | Non-empty list of unique tags when supplied |

<!-- typedmark-example: artifact=note-type -->
```yaml
specification_version: 0.1.0
note_type: meeting
description: A dated meeting note.
frontmatter:
  meeting_date:
    type: date
  status:
    type: text
    default_value: draft
    allowed_values: [draft, final]
storage:
  folder_pattern: Meetings
  note_name_pattern: "{meeting_date} - {title}"
headings:
  required_h2: [Agenda, Notes]
```

Store the intended Core `title` for composite names; its basename fallback
would otherwise include the date prefix.

Rules:

- `NTS-23` A note-type schema MUST satisfy the Schema File Contract table.
- `NTS-176` A concrete schema without `extends` MUST physically declare `storage`.
- `NTS-55` Omitted relationships are equivalent to empty `belongs_to.allowed_note_types` and `related_to.allowed_note_types`.
- `NTS-58` Omitted headings default to empty required/optional H2 lists, allowed other H2s, no ordering requirement, and no H1/title coupling.
- `NTS-60` Human-facing guidance MUST NOT override structural rules.
- `NTS-66` A note type's effective `unknown_field` overrides the collection default only for its managed-note frontmatter.
- `NTS-67` That override MUST NOT change unknown structural-key severity for governed artifacts.
- `NTS-69` A supplied count range MUST have non-negative integer bounds with `min <= max` when both are present.
- `NTS-71` A note-count violation MUST be reported as `invalid_note_count`.

### Mandatory Tags

A note type can add mandatory tags without declaring a second `tags` field.
Collection-level policy and the effective note-type policy are combined by
Collection Model.

<!-- typedmark-example: fragment: Note-type mandatory-tag policy. -->
```yaml
mandatory_tags: [type/project, actionable]
```

Rules:

- `NTS-170` A supplied `mandatory_tags` MUST be a non-empty ordered list of unique valid tags.
- `NTS-172` The type-level policy contributes the final stage of [Collection Model](collection-model.md)'s mandatory-tag sequence.

### Abstract Inheritance Example

See [Schema Reuse](schema-reuse.md#abstract-inheritance-example).

## Conditional Field Constraints

Conditional constraints belong to [Schema Reuse](schema-reuse.md#conditional-field-constraints).

## Allowed Schema Kinds

The former `kind` field is not part of the `0.1.0` schema. Counts express
cardinality directly; fixed storage patterns express fixed paths.

<!-- typedmark-example: fragment: One required fixed-path note. -->
```yaml
count: {min: 1, max: 1}
storage:
  folder_pattern: ""
  note_name_pattern: Home
```

## Storage Rules

Storage patterns are a separate, deliberately small grammar, not the optional
`${...}` expression language. They consist of literal text and references to
effective scalar fields. There is no current-clock placeholder and no recursive
evaluation of substituted text.

| Pattern position | Shape |
| --- | --- |
| `folder_pattern` | Relative folder, optionally empty for the root; `/` separators; no backslash, leading/trailing slash, or `.` / `..` segment |
| `note_name_pattern` | Non-empty basename pattern without slash, backslash, or a `.md` extension |
| `note_name_prefix`, `note_name_suffix` | Optional mapping with a non-empty `pattern`; every supplied affix applies |
| `archive` | Optional block with alternate `folder_pattern` and `note_name_pattern`, and optional affixes |

For example, `{meeting_date:YYYY}/{meeting_date:MM}` names a folder from a
declared date. The word `now` has no special status: `{now:YYYY}` works only if
there is an actual effective date/datetime field named `now`.

Rules:

- `NTS-97` A supplied storage block MUST contain `folder_pattern` and `note_name_pattern`.
- `NTS-177` Storage declarations MUST satisfy the Storage Rules shape table.
- `NTS-101` Storage patterns govern both path validation and note creation.
- `NTS-113` A resolved name consists of the resolved prefix, name pattern, and suffix in that order.
- `NTS-117` A placeholder MUST have the form `{field_name}` or `{field_name:format}`.
- `NTS-124` A placeholder MUST reference a top-level effective field or Core field.
- `NTS-125` Storage placeholders MUST NOT traverse nested fields.
- `NTS-127` A formatted placeholder MUST reference a `date` or `datetime` and use `YYYY`, `MM`, `DD`, `YYYY-MM`, `YYYY-MM-DD`, `Q`, `WW`, or `GGGG`.
- `NTS-120` `Q` is the quarter number `1` through `4`, `WW` is the zero-padded ISO 8601 week number `01` through `53`, and `GGGG` is the four-digit ISO 8601 week-numbering year; week-based patterns SHOULD pair `WW` with `GGGG` rather than `YYYY`.
- `NTS-128` Datetime components MUST be taken from the effective instant in the collection timezone; date components use the calendar date as written.
- `NTS-129` Substitution MUST use effective scalar field values.
- `NTS-130` Every referenced value MUST be concrete and non-null when the path is evaluated.
- `NTS-132` List, tags, object, and `any` fields MUST NOT be used in storage placeholders.
- `NTS-133` A substituted value MUST NOT contain slash, backslash, or control characters, or equal `.` or `..`.
- `NTS-134` A resolved note basename MUST be a non-empty string not beginning with `.`.
- `NTS-180` A resolved path MUST be free of control characters and `.` or `..` path segments, regardless of whether they came from literal text or substituted values.
- `NTS-178` Substituted text MUST NOT be reparsed as storage-pattern syntax.
- `NTS-135` An unsafe resolved path MUST be reported as a `path` failure rather than created.
- `NTS-137` The resolved note path is the resolved folder plus basename and `.md`, with no leading separator for an empty folder.
- `NTS-138` Effective `archived` selects the active or archived storage contract.
- `NTS-144` An archived note with an archive block MUST use its alternate patterns.
- `NTS-145` Without an archive block, an archived note MUST continue to satisfy the active storage patterns.
- `NTS-146` A path mismatch MUST be reported under `path`.
- `NTS-148` A writer creating a note MUST derive its initial path from the effective storage patterns and values it will write.
- `NTS-150` A writer MUST obtain every necessary concrete value before creating a note at a conforming path.
- `NTS-152` A writer MUST NOT create or move a note onto an occupied note or artifact path.
- `NTS-154` Tools SHOULD report resolved paths differing only by letter case.
- `NTS-155` Tools SHOULD report names reserved on common filesystems, including Windows device names and path components ending in a dot or space.
- `NTS-156` Archiving MUST preserve the note's type.
- `NTS-157` Archiving MUST preserve its effective non-null identifier.

## Template References

Explicit templates name files; otherwise `<note_type>.md` supplies overrides
when present, or starter state is derived.

<!-- typedmark-example: fragment: Explicit starter-template reference. -->
```yaml
template:
  file: meetings/standard.md
```

Rules:

- `NTS-44` A supplied `template.file` MUST be relative to `<metadata_directory>/templates/`.
- `NTS-45` That path MUST NOT be absolute, contain `..` segments, or restate the metadata/templates prefix.
- `NTS-47` A supplied template file path MUST end in `.md`.
- `NTS-159` When no effective explicit template reference exists, the conventional template filename is `<note_type>.md`.
