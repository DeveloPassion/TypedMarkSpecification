---
title: Content Expansion
parent: TypedMark
nav_order: 25
audience: tool-authors
---

# Content Expansion

Audience: tool authors implementing derived Markdown regions.

Authoritative for:

- content-expansion markers and descriptor grammar
- expansion sources, rendering, materialization, synchronization, drift, and ejection

See also:

- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): core relationship, heading, and template contracts
- [Template Tracking](template-tracking.md): template-region ownership and drift tracking
- [Collection Model](collection-model.md): portable queries, datasets, and saved views
- [Foundations](foundations.md): the shared expression language used to render source values
- [Automation Runtime](automation-runtime.md): dependency propagation for automatic expansion refresh

## Content Expansion

A content expansion keeps a marker-delimited region of ordinary Markdown derived from one declared source. The source remains authoritative while the rendered region stays readable in every Markdown editor; an author can eject the markers at any time and keep the rendered Markdown as ordinary prose.

For example, this expansion mirrors the note's `summary` field:

<!-- typedmark-example: body: Materialized content-expansion markers and Markdown content. -->
```markdown
<!-- typedmark:expansion {"id":"project-summary","mode":"auto","state":"materialized","source":{"kind":"self_field","field":"summary"},"render":{"item":"${value}"}} -->
The current project summary.
<!-- /typedmark:expansion -->
```

### Marker Grammar

The start marker carries one compact JSON descriptor. The lines between it and the closing marker are the materialized region; the comment lines themselves remain invisible in rendered Markdown.

Rules:

- `RHT-93` A content expansion MAY appear in the body of any collection note or governed template.
- `RHT-94` A content expansion MUST consist of one start marker, one materialized region, and one closing marker in that order.
- `RHT-95` A start-marker line MUST contain zero to three leading ASCII spaces, `<!-- typedmark:expansion `, one JSON object on that same line, ` -->`, and no other content.
- `RHT-96` A closing-marker line MUST contain zero to three leading ASCII spaces, `<!-- /typedmark:expansion -->`, and no other content.
- `RHT-97` Marker-shaped text inside CommonMark fenced or indented code MUST NOT be parsed as a content-expansion marker.
- `RHT-98` An expansion descriptor MUST contain exactly `id`, `mode`, `state`, `source`, and `render` with the shapes defined on this page.
- `RHT-175` The serialized JSON object in a start marker MUST NOT contain the two-character sequence `--`.
- `RHT-99` An expansion descriptor MUST inherit the concrete schema's core version for a managed note or referenced template, or the collection root's version for an untyped note.
- `RHT-100` Content expansions MUST NOT be nested.
- `RHT-101` Every parsed start marker MUST have exactly one closing marker.
- `RHT-102` Every parsed closing marker MUST have exactly one preceding unmatched start marker.
- `RHT-103` Descriptor `id` values MUST be unique within their Markdown file.
- `RHT-104` The materialized region is the sequence of zero or more complete source lines strictly between the marker lines, joined by their intervening line endings with the marker-line terminators excluded.
- `RHT-105` Materialized-region Markdown MUST participate in heading detection, note-link extraction, relationship derivation, and every other ordinary body-content rule.
- `RHT-106` The two marker-comment lines MUST NOT themselves participate in heading detection, note-link extraction, or relationship derivation.
- `RHT-107` A tool that refreshes an expansion MUST limit its body edit to that expansion's materialized region and descriptor state.
- `RHT-108` Ejecting an expansion MUST remove both marker lines while preserving the materialized region in place.
- `RHT-109` A marker-grammar, pairing, nesting, identifier, or descriptor-shape violation is an `invalid_expansion` failure.

### Sources and Rendering

The descriptor has a slug `id`, a mode from `auto`, `manual`, `once`, or
`once_and_eject`, and state `pending` or `materialized`. `render` contains a
required string `item` and optional string `separator` (default newline) and
`empty` (default empty string), with no other keys.

| Source kind | Required keys besides `kind` | Optional keys |
| --- | --- | --- |
| `self_field` | `field`: field name | none |
| `note_field` | `note`: non-empty link text; `field`: field name | none |
| `relationship` | `relationship`: `belongs_to` or `related_to` | `direction`: inbound/outbound, default outbound; `field`: field name; `target_note_types`: slug list |
| `query` | `query`: portable descriptor; `column`: field-name-shaped alias | none |
| `view` | `view`: slug; `column`: field-name-shaped alias | none |
| `dataset` | `dataset`: slug; `column`: field-name-shaped alias | none |
| `file` | `value`: path/filename/stem | none |
| `now` | `format`: YYYY/MM/DD/YYYY-MM/YYYY-MM-DD/Q/WW/GGGG | none |

Rules:

- `RHT-287` Descriptor scalars and `render` MUST conform to the shape described above.
- `RHT-288` A source MUST contain only the required and optional keys listed for its kind in the source table.
- `RHT-289` A retained `once_and_eject` descriptor MUST be `pending`.
- `RHT-290` A supplied `target_note_types` MUST be a non-empty list of unique slugs.
- `RHT-291` A `now` source MUST explicitly supply its `format`.

Every source evaluates to an ordered sequence of text values. A single-value source therefore uses the same rendering path as a relationship traversal, while the deliberately small shared expression language controls presentation. Computed fields need no separate source kind because their materialized values are read through the field sources after recomputation. Query-backed selection embeds the portable descriptor defined in [Collection Model](queries.md#portable-queries), rather than inventing an expansion-only query language. Dataset and view sources reuse governed [datasets](datasets-and-views.md#datasets) and [saved views](datasets-and-views.md#saved-views), allowing several dashboard expansions and presentations to share one selection definition. Filesystem creation and modification timestamps are excluded because they are not stable collection data—authors can store portable timestamps in typed fields instead.

This descriptor renders outbound `related_to` targets as a Markdown list:

<!-- typedmark-example: artifact=expansion -->
```json
{
  "id": "related-sources",
  "mode": "manual",
  "state": "materialized",
  "source": {
    "kind": "relationship",
    "relationship": "related_to",
    "direction": "outbound",
    "target_note_types": [
      "source"
    ]
  },
  "render": {
    "item": "- ${value}",
    "empty": "_No sources._"
  }
}
```

This query source renders the projected title column from every active project in portable query order:

<!-- typedmark-example: artifact=expansion -->
```json
{
  "id": "active-projects",
  "mode": "auto",
  "state": "materialized",
  "source": {
    "kind": "query",
    "query": {
      "specification_version": "0.1.0",
      "note_types": [
        "project"
      ],
      "where": {
        "kind": "field",
        "field": "status",
        "operator": "equals",
        "value": "active"
      },
      "select": [
        {
          "kind": "field",
          "field": "title",
          "as": "title"
        }
      ],
      "order_by": [
        {
          "column": "title",
          "direction": "asc"
        }
      ]
    },
    "column": "title"
  },
  "render": {
    "item": "- ${value}",
    "empty": "_No active projects._"
  }
}
```

The equivalent view source reuses a visible column from the saved `project-board` view:

<!-- typedmark-example: artifact=expansion -->
```json
{
  "id": "active-projects",
  "mode": "auto",
  "state": "materialized",
  "source": {
    "kind": "view",
    "view": "project-board",
    "column": "title"
  },
  "render": {
    "item": "- ${value}",
    "empty": "_No active projects._"
  }
}
```

Rules:

- `RHT-110` The content-expansion modes in this specification version are exactly `auto`, `manual`, `once`, and `once_and_eject`.
- `RHT-111` The content-expansion states in this specification version are exactly `pending` and `materialized`.
- `RHT-112` The content-expansion source kinds in this specification version are exactly `self_field`, `note_field`, `relationship`, `query`, `dataset`, `view`, `file`, and `now`.
- `RHT-113` Every source evaluation MUST produce an ordered sequence containing zero or more strings.
- `RHT-114` A string source value MUST contribute that string unchanged.
- `RHT-115` A boolean source value MUST contribute `true` or `false` in lowercase.
- `RHT-116` An integer source value MUST use the integer representation defined by `SCE-85` in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `RHT-117` A number source value MUST use the number representation defined by `SCE-86` in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `RHT-118` An absent or null source value MUST produce an empty sequence.
- `RHT-119` A sequence source value MUST contribute its scalar entries in sequence order using `RHT-114` through `RHT-117`.
- `RHT-120` A mapping, nested sequence, or null sequence entry MUST make source evaluation fail.
- `RHT-121` A `self_field` source MUST read the named top-level field from the containing note's parsed frontmatter.
- `RHT-169` A `self_field` source on a note without valid YAML frontmatter MUST make source evaluation fail.
- `RHT-171` A `self_field` source in a managed note MUST name an effective-schema field or a core-defined managed-note field.
- `RHT-122` A `note_field.note` value MUST be a supported internal note link under [Note Links](note-links.md).
- `RHT-123` A `note_field.note` value MUST resolve to exactly one managed note.
- `RHT-124` A `note_field` source MUST read its named top-level field from the resolved note's parsed frontmatter.
- `RHT-172` A `note_field` source MUST name an effective-schema field or a core-defined managed-note field of its resolved note.
- `RHT-125` A `relationship` source MUST be evaluated only for a managed containing note.
- `RHT-126` An outbound `relationship` source MUST select the containing note's unique concrete relationship targets for the named relationship kind.
- `RHT-127` An inbound `relationship` source MUST select the unique managed notes that have the named concrete relationship kind to the containing note.
- `RHT-128` An omitted `relationship.direction` MUST have the effective value `outbound`.
- `RHT-170` Every identifier in `target_note_types` MUST resolve to exactly one concrete or abstract note type.
- `RHT-129` A present `target_note_types` list MUST filter relationship targets using the concrete-and-abstract target semantics of `RHT-16` and `RHT-17`.
- `RHT-130` Relationship targets MUST be ordered by normalized collection-relative path in ascending Unicode code-point order.
- `RHT-131` A relationship source without `field` MUST contribute each selected target as the root-relative standard Markdown link defined by `RHT-166` and `RHT-167`.
- `RHT-166` The generated relationship-link label MUST be the target's final path segment without `.md`, with `\`, `[`, and `]` escaped by a preceding backslash.
- `RHT-167` The generated relationship-link destination MUST be `/` followed by the normalized collection-relative path, with every UTF-8 byte other than an ASCII letter, digit, `-`, `.`, `_`, `~`, or `/` percent-encoded using uppercase hexadecimal digits.
- `RHT-132` A relationship source with `field` MUST contribute the named top-level field from each selected target in target order.
- `RHT-173` A relationship source with `field` MUST name an effective-schema field or a core-defined managed-note field of every selected target.
- `RHT-133` Values from one relationship target's sequence field MUST precede values from every later target.
- `RHT-246` A `query` source MUST contain `query` as a portable query descriptor and `column` as a projected-column alias.
- `RHT-247` An embedded query's `specification_version` MUST equal the expansion's inherited core version.
- `RHT-248` A `query` source MUST evaluate its embedded query against the current collection snapshot under the portable query rules in [Collection Model](queries.md#portable-queries).
- `RHT-249` A `query` source's `column` MUST resolve to exactly one alias in its embedded query's `select` list.
- `RHT-250` A `query` source MUST read its named column from each ordered, limited result row before presentation grouping.
- `RHT-256` Each query-row value MUST be converted under `RHT-114` through `RHT-120`.
- `RHT-251` Values contributed by one query row's sequence value MUST precede values contributed by every later row.
- `RHT-252` An absent or null projected value in one query row MUST contribute an empty sequence for that row.
- `RHT-253` A `query` source MUST NOT implicitly exclude the note containing the expansion.
- `RHT-254` A query-source resolution, evaluation, column-resolution, or value-conversion failure MUST be an `invalid_expansion` failure.
- `RHT-255` An `auto` query expansion is affected when a staged change can alter its query's candidate membership, predicate outcome, projected values, row order, limit boundary, or selected-column values.
- `RHT-257` During template instantiation, a query source MUST evaluate against the staged post-creation snapshot containing the new note at its final path with its final frontmatter and non-expansion body.
- `RHT-258` A `view` source MUST contain `view` as a saved-view identifier and `column` as a projected-column alias.
- `RHT-259` A `view` source's `view` identifier MUST resolve to exactly one artifact under `<metadata_directory>/views/`.
- `RHT-260` A resolved saved view's `specification_version` MUST equal the expansion's inherited core version.
- `RHT-261` A `view` source MUST evaluate the resolved saved view's embedded query or referenced dataset against the current collection snapshot under the applicable rules in [Collection Model](collection-model.md).
- `RHT-262` A `view` source's `column` MUST resolve to exactly one alias in the saved view's resolved projected column contract.
- `RHT-263` A `view` source's `column` MUST also appear exactly once in the saved view's `presentation.fields` list.
- `RHT-264` A `view` source MUST read its named column from each ordered, limited result row before presentation grouping.
- `RHT-265` Each view-row value MUST be converted under `RHT-114` through `RHT-120`.
- `RHT-266` Values contributed by one view row's sequence value MUST precede values contributed by every later row.
- `RHT-267` An absent or null projected value in one view row MUST contribute an empty sequence for that row.
- `RHT-268` A `view` source MUST materialize only its selected column through `render`.
- `RHT-269` A `view` source MUST NOT reproduce the saved view's visual layout.
- `RHT-270` A view-source resolution, evaluation, column-resolution, or value-conversion failure MUST be an `invalid_expansion` failure.
- `RHT-271` An `auto` view expansion is affected when a staged change can alter the resolved row result or when the referenced saved-view or transitive dataset artifact changes.
- `RHT-272` During template instantiation, a view source MUST evaluate against the staged post-creation snapshot containing the new note at its final path with its final frontmatter and non-expansion body.
- `RHT-273` A `dataset` source MUST contain `dataset` as a dataset identifier and `column` as a projected-column alias.
- `RHT-274` A `dataset` source's `dataset` identifier MUST resolve to exactly one artifact under `<metadata_directory>/datasets/`.
- `RHT-275` A resolved dataset's `specification_version` MUST equal the expansion's inherited core version.
- `RHT-276` A `dataset` source MUST evaluate the resolved dataset against the current collection snapshot under [Datasets](datasets-and-views.md#datasets).
- `RHT-277` A `dataset` source's `column` MUST resolve to exactly one alias in the dataset's projected column contract.
- `RHT-278` A `dataset` source MUST read its named column from each ordered, limited result row before presentation grouping.
- `RHT-279` Each dataset-row value MUST be converted under `RHT-114` through `RHT-120`.
- `RHT-280` Values contributed by one dataset row's sequence value MUST precede values contributed by every later row.
- `RHT-281` An absent or null projected value in one dataset row MUST contribute an empty sequence for that row.
- `RHT-282` A dataset-source resolution, evaluation, column-resolution, or value-conversion failure MUST be an `invalid_expansion` failure.
- `RHT-283` An `auto` dataset expansion is affected when a staged change can alter the dataset query's candidate membership, predicate outcome, projected values, row identity, row order, limit boundary, or selected-column values, or when the dataset artifact changes.
- `RHT-284` During template instantiation, a dataset source MUST evaluate against the staged post-creation snapshot containing the new note at its final path with its final frontmatter and non-expansion body.
- `RHT-134` A `file` source with `value: path` MUST contribute the containing note's normalized collection-relative path.
- `RHT-135` A `file` source with `value: filename` MUST contribute the final path segment including `.md`.
- `RHT-136` A `file` source with `value: stem` MUST contribute the final path segment without `.md`.
- `RHT-137` A `now` source MUST use the collection timezone defined in [Collection Model](collection-model.md).
- `RHT-174` A `now` source MUST use the current instant at the start of its materialization request.
- `RHT-138` A `now.format` MUST use the date-component formats and week/quarter semantics in [Note Type Schemas](note-type-schemas.md#storage-rules).
- `RHT-139` A `now` source MUST use `once` or `once_and_eject` mode.
- `RHT-140` `render.item` MUST be evaluated as a shared text-template expression once for each source value.
- `RHT-141` The only reference name available to `render.item` MUST be `value`.
- `RHT-142` Rendered items MUST be joined in source order using the literal `render.separator` value.
- `RHT-143` An omitted `render.separator` MUST have the effective value of one line-feed character.
- `RHT-144` A zero-value source MUST render the literal `render.empty` value.
- `RHT-145` An omitted `render.empty` MUST have the effective value of the empty string.

### Materialization, Synchronization, and Drift

Pending descriptors are template-time declarations. Materialization evaluates the source, renders the result, and writes plain Markdown; thereafter the mode decides whether the source remains authoritative. Automatic and manual expansions share the same conformance requirement, but only automatic mode participates in propagation without an explicit refresh request.

For example, a template can seed an expansion without pretending that placeholder frontmatter has already produced current content:

<!-- typedmark-example: body: Pending content-expansion markers within a template body. -->
```markdown
<!-- typedmark:expansion {"id":"owner","mode":"auto","state":"pending","source":{"kind":"self_field","field":"owner"},"render":{"item":"Owner: ${value}"}} -->
<!-- /typedmark:expansion -->
```

Rules:

- `RHT-146` A pending expansion's materialized region MUST be empty.
- `RHT-147` Materializing an expansion MUST replace its region with the current rendered source result.
- `RHT-148` Materializing an expansion other than `once_and_eject` MUST set its descriptor state to `materialized`.
- `RHT-149` Materializing a `once_and_eject` expansion MUST eject its markers in the same write.
- `RHT-150` Every content expansion in a governed template MUST have `state: pending`.
- `RHT-168` A pending template expansion's source MUST NOT be evaluated before template instantiation.
- `RHT-151` Template instantiation MUST materialize expansions after resolving the target path, final frontmatter values, and non-expansion starter body and before writing the note.
- `RHT-152` Adding an ad hoc expansion to a collection note MUST write a materialized expansion atomically.
- `RHT-153` A materialized `auto` expansion's region MUST equal its current rendered source result.
- `RHT-154` A propagation-capable tool MUST refresh an affected `auto` expansion before committing the propagation closure.
- `RHT-155` A materialized `manual` expansion's region MUST equal its current rendered source result.
- `RHT-156` A tool MUST refresh a `manual` expansion only in response to an explicit refresh or materialization request.
- `RHT-157` A pending `once` expansion MUST be materialized by note creation or an explicit materialization request.
- `RHT-158` A materialized `once` expansion MUST NOT re-evaluate its source for conformance or propagation.
- `RHT-159` The materialized region of a `once` expansion MAY be edited as ordinary Markdown.
- `RHT-160` The materialized regions of `auto` and `manual` expansions MUST be treated as read-only derived content until ejected.
- `RHT-161` A tool MAY explicitly eject an expansion in any mode.
- `RHT-162` A persisted collection note MUST NOT contain a pending expansion.
- `RHT-163` An applicable source-resolution, source-conversion, or render-expression failure is an `invalid_expansion` failure.
- `RHT-164` Unequal current and stored output for a materialized `auto` or `manual` expansion is an `expansion_drift` failure.
- `RHT-165` Expansion-output equality MUST compare the rendered result and materialized-region source text exactly after normalizing line endings in both to line feed.
- `RHT-176` Content-expansion descriptor and region changes outside template regions MUST NOT affect template-drift state.
- `RHT-177` Ejection of a `once_and_eject` expansion outside template regions MUST NOT affect template-drift state.

## Collection Conformance

These checks apply when the collection uses this optional contract.

Rules:

- `CR-85` Every content expansion in a collection note satisfies the applicable marker, descriptor, source, rendering, synchronization, and persisted-state rules in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion).

## Diagnostic Categories

These categories use the collection severity policy.

Rules:

- `CM-297` `invalid_expansion` applies when a content expansion violates the marker, descriptor, source, rendering, or materialization rules defined in [Relationships, Headings, Templates, and Content Expansion](content-expansion.md#content-expansion).
- `CM-298` `expansion_drift` applies when a materialized `auto` or `manual` content expansion does not equal its current rendered source result.
