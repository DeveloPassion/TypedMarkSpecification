---
title: Datasets and Views
parent: TypedMark
nav_order: 21
audience: advanced
---

# Datasets and Views

Audience: collection authors and tool authors sharing query results and presentations.

Authoritative for:

- reusable dataset artifacts, row identity, and the common projected column contract
- saved-view artifacts and portable table, list, cards, board, tree, calendar, and timeline presentations
- Obsidian Bases interoperability

See also:

- [Collection Model](collection-model.md): metadata directory and validation defaults
- [Queries](queries.md): portable query descriptors, evaluation, and mapped-field projections
- [Field Compatibility and Conversion](field-conversions.md): compatibility of heterogeneous source fields
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): dataset- and view-backed content expansion
- [Note Links](note-links.md): link resolution behind tree parents

In path notation on this page, `<metadata_directory>` means the directory name declared by `typedmark.md` `metadata_directory`.

## Datasets

A dataset gives one portable query a governed identity and a stable row key so several saved views and content expansions can reuse exactly the same ordered rows. Its query projections are the common column contract. A `mapped_field` projection makes heterogeneous source paths explicit and converts them to one declared target definition; display labels never imply that fields are compatible.

This dataset combines projects and tasks whose workflow fields have different stored names:

<!-- typedmark-example: artifact=dataset -->
```markdown
---
specification_version: 0.1.0
dataset: actions
label: Actions
description: Projects and tasks exposed through one stable row contract.
row_identity: path
query:
  specification_version: 0.1.0
  note_types: [project, task]
  select:
    - {kind: path, as: path}
    - {kind: note_type, as: type}
    - kind: mapped_field
      as: status
      definition: {type: text, nullable: true}
      sources:
        - {note_types: [project], field: status}
        - {note_types: [task], field: action_status}
    - {kind: field, field: title, as: title}
  order_by:
    - {column: status, direction: asc}
    - {column: title, direction: asc}
---

Shared action rows for tables, cards, boards, and generated indexes.
```

Rules:

- `CM-494` `<metadata_directory>/datasets/` MAY be omitted when the collection defines no datasets.
- `CM-495` Every Markdown file directly under `<metadata_directory>/datasets/` MUST define exactly one dataset.
- `CM-496` A dataset file's basename without `.md` MUST equal its top-level `dataset` value.
- `CM-497` A separate registry file MUST NOT be maintained for datasets.
- `CM-498` A dataset artifact MUST physically contain `specification_version`, `dataset`, `description`, `row_identity`, and `query`.
- `CM-499` A dataset artifact MUST satisfy `schema/json-schema/dataset.schema.json` before semantic evaluation.
- `CM-500` `dataset` MUST be a slug unique among the collection's datasets.
- `CM-501` `description` MUST be a non-empty human-facing string.
- `CM-502` `label` MAY be omitted.
- `CM-530` A present `label` MUST be a non-empty string.
- `CM-503` A tool displaying a dataset name SHOULD use `label` when present and `dataset` otherwise.
- `CM-504` The dataset body MAY contain human guidance.
- `CM-531` The dataset body MUST NOT alter dataset semantics.
- `CM-505` `query` MUST be a portable query descriptor governed by [Portable Queries](queries.md#portable-queries).
- `CM-532` A dataset query MUST physically contain `note_types` so the artifact declares the concrete or abstract note-type domain it can return.
- `CM-506` `query.specification_version` MUST equal the dataset's top-level `specification_version`.
- `CM-507` The dataset's ordered `query.select` aliases and their applicable built-in, effective-field, or mapped target definitions MUST constitute its common projected column contract.
- `CM-528` A dataset's direct `field` projection MUST resolve to identical effective field definitions across every admitted concrete note type on which that path is declared; heterogeneous definitions or source paths require `mapped_field`.
- `CM-529` When a direct projected field can be undeclared or absent on an admitted row, its common effective definition MUST permit null.
- `CM-508` `row_identity` MUST resolve to exactly one alias in `query.select`.
- `CM-509` Every evaluated row's `row_identity` value MUST be a non-null scalar.
- `CM-510` Evaluated `row_identity` values MUST be unique under the projected column's applicable equality rules.
- `CM-511` A duplicate, null, sequence, or mapping row identity MUST make dataset evaluation fail.
- `CM-512` A tool evaluating a dataset MUST evaluate its query once against one immutable collection snapshot under `CM-300` through `CM-406` and `CM-477` through `CM-493`.
- `CM-513` Dataset consumers MUST preserve query membership, projected values, row order, limit boundary, and row identity.
- `CM-514` Dataset grouping is presentational metadata over the preserved ordered rows and MUST NOT change row semantics.
- `CM-515` Every note type and field path referenced by a dataset MUST remain valid against the effective collection model.
- `CM-516` A dataset shape, reference-resolution, query-evaluation, mapped-column, or row-identity failure MUST be an `invalid_dataset` failure.
- `CM-517` A system release that renames or removes a dataset column MUST update or retire every affected view and content expansion in the same release.
- `CM-518` A system release that renames or removes a dataset MUST update or retire every reference to it in the same release.
- `CM-519` Transient UI state and per-embed filters, sorts, grouping, limits, and field overrides MUST NOT alter the governed dataset artifact or a consumer's portable result.

## Saved Views

A saved view gives an embedded portable query or a reusable dataset a stable presentation contract. The resolved query remains responsible for selection, filtering, projection, ordering, grouping, and limiting. The presentation chooses visible projected columns and one layout family; it does not introduce another query language or an editing API.

[Kanban Action Planner](https://github.com/dsebastien/obsidian-kanban-action-planner) demonstrates three useful boundaries reflected here: board columns come from an explicit definition rather than observed typos, computed values remain read-only presentation inputs, and embedded or per-session UI state does not rewrite the shared portable view.

This board keeps workflow columns explicit, including empty columns, while preserving unexpected status values in a final fallback column:

<!-- typedmark-example: artifact=view -->
```markdown
---
specification_version: 0.1.0
view: project-board
label: Project Board
description: Active projects arranged by workflow state.
query:
  specification_version: 0.1.0
  note_types: [project]
  where:
    kind: field
    field: archived
    operator: equals
    value: false
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: status, as: status}
    - {kind: field, field: due, as: due}
  order_by:
    - {column: due, direction: asc, nulls: last}
    - {column: title, direction: asc}
  group_by: [status]
presentation:
  layout: board
  fields:
    - {column: title, label: Project}
    - {column: due, label: Due}
  board:
    column: status
    columns:
      - {value: backlog, label: Backlog}
      - {value: active, label: Active}
      - {value: done, label: Done}
    unmapped_label: Other
---

Shows the shared project board used by planning dashboards.
```

Swimlanes split the same columns horizontally. This task board gives each
project its own lane, with tasks that belong to no project in a final lane:

<!-- typedmark-example: artifact=view -->
```markdown
---
specification_version: 0.1.0
view: task-board-by-project
description: Open tasks by workflow state, one lane per project.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: status, as: status}
    - {kind: field, field: project, as: project}
  order_by:
    - {column: title, direction: asc}
presentation:
  layout: board
  fields:
    - {column: title, label: Task}
  board:
    column: status
    columns:
      - {value: todo, label: To do}
      - {value: doing, label: Doing}
      - {value: done, label: Done}
    lanes:
      column: project
      empty_label: No project
---

Lanes follow project order; tasks without a project come last.
```

A board can also be where work is edited. A writable board turns a move between
columns into an ordinary field write, and a rank field keeps the order people
give cards inside a column:

<!-- typedmark-example: fragment: A writable board ordered by a rank field. -->
```yaml
board:
  column: status
  columns:
    - {value: todo}
    - {value: done}
  writable: true
  rank: manual_order
```

A tree arranges rows under their parents, as a work breakdown does. The parent
is a projected link field, so the same relationship that files a task under its
project builds the hierarchy. A note with two parents appears under both, a
cycle is cut where it re-enters, and an optional context shows the ancestors
the query filtered out, such as a finished project above an open task. A
writable tree turns a move under another row into an ordinary write of the
parent link:

<!-- typedmark-example: artifact=view -->
```markdown
---
specification_version: 0.1.0
view: work-breakdown
label: Work Breakdown
description: Open tasks under their parent tasks and projects.
query:
  specification_version: 0.1.0
  note_types: [task]
  where:
    kind: field
    field: archived
    operator: equals
    value: false
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: status, as: status}
    - {kind: field, field: parent, as: parent}
  order_by:
    - {column: title, direction: asc}
presentation:
  layout: tree
  fields:
    - {column: title, label: Task}
    - {column: status, label: Status}
  tree:
    parent: parent
    context: ancestors
    writable: true
---

Projects above the listed tasks appear as read-only context rows.
```

A tree can also roll values up from children, as a work breakdown sums
estimates and averages progress. A row's own value wins; a row without one
shows the value derived from its children, counting a task listed under two
of its subtasks once. Progress can be weighted by the
estimates, and done rows can count as finished whatever they store. Rolled-up
values are presentation only: nothing is written back:

<!-- typedmark-example: fragment: Tree rollups of estimates and weighted progress. -->
```yaml
tree:
  parent: parent
  rollups:
    - {column: estimate, aggregate: sum}
    - {column: progress, aggregate: weighted_mean, weight: estimate, state: status, done_value: 100}
```

A calendar places rows on the days of their dates. Several date fields can be
plotted together, so a task shows on the day it is scheduled and on the day it
is due, each entry labelled with its dimension. A backlog lists the rows a
dimension has no date for, and a writable calendar turns a drop on another day,
or on the backlog, into a write of that one date:

<!-- typedmark-example: artifact=view -->
```markdown
---
specification_version: 0.1.0
view: task-calendar
description: Open tasks on their scheduled and due days.
query:
  specification_version: 0.1.0
  note_types: [task]
  select:
    - {kind: field, field: title, as: title}
    - {kind: field, field: scheduled, as: scheduled}
    - {kind: field, field: due, as: due}
presentation:
  layout: calendar
  fields:
    - {column: title, label: Task}
  calendar:
    dates:
      - {column: scheduled, label: Scheduled}
      - {column: due, label: Due}
    backlog: true
    writable: true
---

Undated tasks wait in the backlog of each dimension.
```

A timeline draws each row as a span from a start to an optional end, one row
per line, the way a project plan does. Moving a span shifts both dates by the
same number of days; resizing writes only the end that moved:

<!-- typedmark-example: fragment: A writable timeline over start and end dates. -->
```yaml
layout: timeline
fields:
  - {column: title}
timeline:
  start: start
  end: end
  backlog: true
  writable: true
```

Rules:

- `CM-408` `<metadata_directory>/views/` MAY be omitted when the collection defines no saved views.
- `CM-409` Every Markdown file directly under `<metadata_directory>/views/` MUST define exactly one saved view.
- `CM-410` A saved-view file's basename without `.md` MUST equal its top-level `view` value.
- `CM-411` A separate registry file MUST NOT be maintained for saved views.
- `CM-412` A saved-view artifact MUST physically contain `specification_version`, `view`, `description`, `presentation`, and exactly one of `query` or `dataset`.
- `CM-413` A saved-view artifact MUST satisfy `schema/json-schema/view.schema.json` before semantic evaluation.
- `CM-414` `view` MUST be a slug unique among the collection's saved views.
- `CM-415` `description` MUST be a non-empty human-facing string.
- `CM-416` `label` MAY be omitted.
- `CM-464` `label`, if present, MUST be a non-empty string.
- `CM-417` A tool displaying a saved-view name SHOULD use `label` when present and `view` otherwise.
- `CM-418` The saved-view body MAY contain human guidance.
- `CM-465` The saved-view body MUST NOT alter the view's query or presentation semantics.
- `CM-419` A present `query` MUST be a portable query descriptor governed by [Portable Queries](queries.md#portable-queries).
- `CM-420` A present `query.specification_version` MUST equal the saved view's top-level `specification_version`.
- `CM-421` A tool evaluating a saved view MUST first evaluate its embedded query or resolved dataset against one immutable collection snapshot under the applicable portable-query and dataset rules.
- `CM-520` A present `dataset` MUST resolve to exactly one artifact under `<metadata_directory>/datasets/`.
- `CM-521` A referenced dataset's `specification_version` MUST equal the saved view's top-level `specification_version`.
- `CM-522` A dataset-backed saved view MUST use the referenced dataset's projected column contract without changing its query, membership, values, ordering, grouping, limit, or row identity.
- `CM-422` `presentation.layout` MUST be exactly `table`, `list`, `cards`, `board`, `tree`, `calendar`, or `timeline`.
- `CM-423` `presentation.fields` MUST be a non-empty ordered list.
- `CM-424` Every `presentation.fields` entry MUST contain `column`.
- `CM-466` A `presentation.fields` entry's `label`, if present, MUST be non-empty.
- `CM-425` Every presented `column` MUST resolve to exactly one alias in the saved view's embedded query or referenced dataset query.
- `CM-426` Presented `column` values MUST be unique within one saved view.
- `CM-427` A presented field's display name MUST be its `label` when present and its `column` alias otherwise.
- `CM-428` For every layout other than `table`, the first presented field MUST be the primary field.
- `CM-467` Later presented fields in every layout other than `table` MUST retain declared order as secondary fields.
- `CM-429` A `table` layout MUST present one result row per table row and one presented field per table column in declared order.
- `CM-430` A `list` layout MUST present one result row per list entry.
- `CM-431` A `cards` layout MUST present one result row per card.
- `CM-432` A `table`, `list`, or `cards` layout MUST present query groups, when present, as ordered sections without changing group or row order.
- `CM-433` A `board` layout MUST contain `presentation.board`.
- `CM-468` Every non-board layout MUST omit `presentation.board`.
- `CM-434` A board presentation MUST partition the resolved ordered rows by `presentation.board.column` independently of any query `group_by` value.
- `CM-568` `presentation.board.lanes` MAY be omitted, and a board without it has exactly one lane holding every row.
- `CM-569` A present `lanes.column` MUST resolve to exactly one projected column, other than `presentation.board.column`, whose value is scalar or null in every retained row and whose field types `CM-334` admits for ordering.
- `CM-570` A board with lanes MUST present one lane per distinct non-null lane value, in ascending order under the portable query ordering rules, followed by one final lane for null values when at least one such row exists.
- `CM-571` An omitted `lanes.empty_label` MUST have the effective value `None`, and the null lane MUST use the effective `empty_label`.
- `CM-572` Every lane MUST present the declared board columns and apply `CM-439` through `CM-444` and `CM-470` to its own rows.
- `CM-435` `presentation.board.column` MUST resolve to exactly one projected column whose value is scalar or null in every retained row.
- `CM-436` `presentation.board.columns` MUST be a non-empty ordered list whose entries contain scalar or null `value`.
- `CM-469` A board-column `label`, if present, MUST be non-empty.
- `CM-437` Every declared board-column value MUST be valid for and comparable under the projected column's applicable equality domain.
- `CM-438` Declared board-column values MUST be unique under the projected column's applicable equality rules.
- `CM-439` Declared board columns MUST appear in declared order even when they contain no rows.
- `CM-440` A board row whose group value equals one declared board-column value MUST appear in that column.
- `CM-441` Rows whose group value equals no declared board-column value MUST appear in one final unmapped column when at least one such row exists.
- `CM-442` An omitted `presentation.board.unmapped_label` MUST have the effective value `Other`.
- `CM-443` The unmapped column MUST use the effective `unmapped_label`.
- `CM-470` The unmapped column MUST NOT appear when it has no rows.
- `CM-444` Rows within a board column MUST preserve their relative portable-query order, except as a board `rank` orders them.
- `CM-582` A `tree` layout MUST contain `presentation.tree`, and every other layout MUST omit it.
- `CM-583` `presentation.tree.parent` MUST resolve to exactly one projected column that is a `field` projection of a `link` field, or of a `list` field whose `items` are `link`, on every admitted note type.
- `CM-584` A row's parents are the other result rows whose notes are resolved targets of its parent value under [Note Links](note-links.md); unresolved links, links to its own note, and links to notes outside the result add no parent.
- `CM-585` A tree presentation MUST arrange the resolved ordered rows by their parents independently of any query `group_by` value.
- `CM-586` Rows without a parent MUST be roots, each row's children MUST appear below it, and roots and the children of each row MUST keep portable-query order.
- `CM-587` A row with several parents MUST appear under each of them, every occurrence presenting the same row.
- `CM-588` An occurrence that would repeat a row already on its path from the root MUST be omitted together with its subtree.
- `CM-589` While some result row appears nowhere, the first such row in portable-query order MUST become an additional root after the existing roots.
- `CM-590` `presentation.tree.context` MAY be omitted, MUST be `none` or `ancestors` when present, and defaults to `none`.
- `CM-591` With `context: ancestors`, every non-deleted managed note outside the result that is a resolved target of the parent field of a row or of another context row MUST appear once as a context row; a context row's own parent value is read through the parent column's field path when its note type declares that field.
- `CM-592` A context row MUST present the view's projections evaluated on its note and MUST be distinguishable from result rows; among its siblings it takes the portable-query position of its earliest result-row descendant, before a result row at the same position, with ties between context rows broken by path in code-point order.
- `CM-596` A `calendar` layout MUST contain `presentation.calendar`, a `timeline` layout MUST contain `presentation.timeline`, and every other layout MUST omit each of them.
- `CM-597` Every `presentation.calendar.dates` entry MUST resolve to exactly one projected column whose field definitions are `date` or `datetime` on every admitted note type, and the entries' columns MUST be unique.
- `CM-598` A calendar MUST present one entry per row and non-null date dimension, on the day of that value; a `datetime` falls on its day in the collection timezone.
- `CM-599` Entries on one day MUST keep portable-query order, one row's entries on that day MUST follow declared dimension order, and every entry MUST show its dimension's `label`, or its `column` when `label` is omitted.
- `CM-600` `presentation.calendar.backlog` MAY be omitted and defaults to `false`; when `true`, every row whose value for a dimension is null MUST be listed in that dimension's backlog in portable-query order.
- `CM-601` `presentation.timeline.start` MUST resolve to exactly one projected column whose field definitions are `date` or `datetime` on every admitted note type, and a present `presentation.timeline.end` MUST resolve to another such column.
- `CM-602` A timeline MUST present one span per row with a non-null start, in portable-query order, from its start to its end; a `date` start begins its day and a `date` end ends its day in the collection timezone.
- `CM-603` A row without an `end` column, with a null end, or with a reversed end MUST be presented as a span covering only its start, a whole day for a `date`; a `date` end is reversed when its day precedes the day its start begins on, and a `datetime` end when its instant precedes the start.
- `CM-604` `presentation.timeline.backlog` MAY be omitted and defaults to `false`; when `true`, every row whose start is null MUST be listed in the timeline backlog in portable-query order.
- `CM-445` Presentation MUST NOT add, remove, duplicate, or reorder result rows except for the board partition defined by `CM-439` through `CM-444` the lanes defined by `CM-568` through `CM-572`, the rank order defined by `CM-578`, the tree arrangement defined by `CM-584` through `CM-592`, and the calendar and timeline placement defined by `CM-598` through `CM-604`.
- `CM-446` Tools MAY choose visual styling, dimensions, controls, and value widgets beyond the layout family, field order, labels, grouping, board partition, tree arrangement, and calendar and timeline placement defined here.
- `CM-447` Cursor position, selection, collapsed groups or tree rows, visible date ranges and zoom, scroll offsets, temporary filters, and other per-session state MUST NOT alter the saved-view artifact's portable result.
- `CM-448` A read-only projected or computed value MUST NOT become writable merely because a saved view presents or groups by it.
- `CM-523` A saved view MUST NOT perform a write through any presented column, except the board moves defined by `CM-576` through `CM-581`, the tree moves defined by `CM-593` through `CM-595`, and the calendar and timeline moves defined by `CM-605` through `CM-608`.
- `CM-576` `presentation.board.writable` MAY be `true` only when `presentation.board.column` is a `field` projection of a top-level field that `set_field` could target on every admitted note type under `MN-163` and `MN-164`.
- `CM-577` On a writable board, moving a row into another declared column MUST write that column's value to the row's note as an ordinary `set_field` write, subject to automation and validation like any other edit.
- `CM-578` `presentation.board.rank` MAY name a `field` projection of a top-level `number` field; rows within each column are then ordered by ascending rank, rows without a rank after ranked rows, and ties in portable-query order.
- `CM-579` On a writable board with a rank, the rank field MUST be assignable as `CM-576` requires, and a move MUST give the moved row a rank strictly between its new neighbours' ranks, below the first, or above the last.
- `CM-580` When no such rank is representable, a writer MAY first renumber that column's ranks in their current order.
- `CM-581` A board move MUST NOT target the unmapped column or change a row's lane.
- `CM-593` `presentation.tree.writable` MAY be `true` only when `presentation.tree.parent` is a `field` projection of a top-level `link` field that `set_field` and `unset_field` could target on every admitted note type under `MN-163` and `MN-164`.
- `CM-594` On a writable tree, moving a row under another row MUST write a link resolving to that row's note as an ordinary `set_field` write, and moving it to the root level MUST remove the field with `unset_field`, each subject to automation and validation like any other edit.
- `CM-595` A tree move MUST NOT place a row under itself or one of its descendants, and MUST NOT move a context row.
- `CM-609` `presentation.tree.rollups` MAY be omitted; a present list MUST be non-empty, and each entry's `column` MUST be a unique presented column.
- `CM-610` A rollup's `aggregate` MUST be `sum`, `min`, `max`, `count`, or `weighted_mean`, and except for `count` its column MUST project `integer` or `number` fields on every admitted note type.
- `CM-611` A `weighted_mean` MUST name a `weight` resolving to another projected `integer` or `number` column whose own rollup, if any, is not a `weighted_mean`, and every other aggregate MUST omit `weight`.
- `CM-612` For `sum`, `min`, `max`, and `weighted_mean`, an occurrence's contributors are itself when it has a non-null own value and otherwise the rows contributing to its child occurrences, each row counted once from its first occurrence in tree order; its rolled-up value aggregates its contributors' own values, or is null when it has none.
- `CM-613` A `weighted_mean` weights each contributor by the weight column's rolled-up value at that contributor's occurrence when the tree rolls that column up and by its own value otherwise, counts a null weight as zero, and takes the unweighted mean when the weights total zero.
- `CM-614` A `count` is the number of distinct result rows with a non-null value in the occurrence's subtree, the occurrence included.
- `CM-615` A rollup other than `count` MAY supply a number `done_value` together with `state`, a projected column whose field declares `states` on every admitted note type; a row whose `state` value is annotated `done: true` then has `done_value` as its own value for that rollup.
- `CM-616` A rolled-up value MUST replace the occurrence's presented value for its column, MUST NOT be written to any note, and SHOULD be marked when it comes from children rather than the row's own value.
- `CM-605` `presentation.calendar.writable` or `presentation.timeline.writable` MAY be `true` only when every date dimension, or the timeline's `start` and any `end`, is a `field` projection of a top-level `date` or `datetime` field that `set_field` and `unset_field` could target on every admitted note type under `MN-163` and `MN-164`.
- `CM-606` On a writable calendar, moving an entry to another day MUST write that day to the entry's dimension field, and moving it to the backlog MUST remove that field with `unset_field`, each as an ordinary edit subject to automation and validation.
- `CM-607` On a writable timeline, moving a span MUST shift its start and any non-null end by the same number of days, resizing MUST write only the moved endpoint and MUST NOT reverse the end under `CM-603`, and moving a row to the backlog MUST remove its start with `unset_field`, each as an ordinary edit subject to automation and validation.
- `CM-608` A moved `datetime` MUST keep its wall-clock time in the collection timezone and its stored form, floating or with an explicit offset recomputed for the new instant, and a move whose new wall-clock time is skipped or repeated in the collection timezone MUST be refused.
- `CM-449` Every note type, field path, projection alias, and board value referenced by a saved view MUST remain valid against the effective collection model.
- `CM-450` A system release that renames or removes a saved-view reference MUST update or retire the affected saved view in the same release.
- `CM-451` A saved-view shape, reference-resolution, query-evaluation, or presentation-semantics failure MUST be an `invalid_view` failure.

An ordinary collection note can act as a dashboard by combining links, application embeds, and dataset- or view-backed content expansions. TypedMark does not add a second dashboard artifact: datasets and saved views remain reusable definitions, while the note remains readable Markdown.

### Obsidian Bases Interoperability

Obsidian [Bases syntax](https://help.obsidian.md/bases/syntax) stores shared filters and formulas plus one or more named views in a `.base` YAML file. The models overlap but are not identical, so interoperability is defined as an explicit mapping with diagnostics rather than byte-for-byte identity.

For example, an importer can map a `.base` file's shared filter, formulas, and property selections to one dataset, then map each compatible named view to a dataset-backed saved-view artifact. A view-local filter or sort that changes portable row semantics requires an embedded query or a distinct dataset rather than an opaque override.

Rules:

- `CM-452` A tool claiming Obsidian Bases import MUST map each imported named `.base` view to one saved-view artifact.
- `CM-524` A Bases importer SHOULD map file-level filters, portable formulas, and shared property definitions used by several named views to one reusable dataset when they have equivalent TypedMark semantics.
- `CM-471` Every `view` identifier produced by one Bases import MUST be unique in the collection.
- `CM-453` A Bases import MUST combine applicable file-level and view-level filters with logical conjunction before translating them to `query.where`.
- `CM-454` A Bases import MUST map portable note-property references to TypedMark field paths and `file.path` to a `path` projection when those references have equivalent TypedMark semantics.
- `CM-455` A Bases import MUST map visible property order to `presentation.fields`.
- `CM-472` A Bases import MUST map equivalent filtering, sorting, grouping, and limiting behavior to the saved view's portable query.
- `CM-456` Built-in Bases table, list, and cards layouts MUST map to the corresponding TypedMark layouts when their selected properties and options are representable.
- `CM-457` A Bases plugin view, including a Kanban view, MAY map to `layout: board` when its grouping property, explicit column values, visible fields, query behavior, and labels are representable under this section.
- `CM-458` A Bases formula MAY map only when an equivalent TypedMark computed field or projected value exists.
- `CM-525` Bases properties with different source paths across note types MAY map to one `mapped_field` projection only when their source note types, target definition, and any non-exact conversions are explicit.
- `CM-526` A Bases view-local filter, sort, grouping, or limit that changes dataset row semantics MUST map to a separate dataset or embedded saved-view query.
- `CM-527` A Bases importer MUST NOT persist transient state or plugin-specific per-view overrides in a shared dataset.
- `CM-459` A Bases file property, formula, function, layout option, plugin configuration, or per-view state without equivalent TypedMark semantics MUST NOT silently change the imported saved view's portable meaning.
- `CM-460` A tool encountering unsupported or lossy Bases input MUST emit a diagnostic identifying each omitted or approximated construct.
- `CM-474` A lossy Bases import MUST NOT be described as lossless.
- `CM-461` A tool claiming Obsidian Bases export MUST translate every representable query and presentation construct to equivalent `.base` syntax.
- `CM-462` A Bases exporter MUST emit diagnostics for every TypedMark construct it cannot represent.
- `CM-475` A lossy Bases export MUST NOT be described as lossless.
- `CM-463` Tool-specific Bases keys or saved-view state MUST NOT affect TypedMark conformance unless a future core rule or a recognized extension explicitly assigns them semantics.

## Collection Conformance

These checks apply when the collection uses this optional contract.

Rules:

- `CR-95` Every dataset file under `<metadata_directory>/datasets/`, if present, is valid under [Collection Model](collection-model.md).
- `CR-90` Every saved-view file under `<metadata_directory>/views/`, if present, is valid under [Collection Model](collection-model.md), and every dataset reference from a saved view resolves.
- `CR-92` Every saved-view reference from a collection note resolves.
- `CR-96` Every dataset reference from a collection note resolves.

## Diagnostic Categories

These categories use the collection severity policy.

Rules:

- `CM-476` `invalid_dataset` applies when a dataset artifact violates the shape, reference-resolution, query, row-identity, mapped-column, or evaluation rules in [Datasets and Views](datasets-and-views.md).
- `CM-407` `invalid_view` applies when a saved-view artifact violates the shape, reference-resolution, query, presentation, or layout rules in [Datasets and Views](datasets-and-views.md).
