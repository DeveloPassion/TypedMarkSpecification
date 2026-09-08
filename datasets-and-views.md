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
- saved-view artifacts and portable table, list, cards, and board presentations
- Obsidian Bases interoperability

See also:

- [Collection Model](collection-model.md): metadata directory and validation defaults
- [Queries](queries.md): portable query descriptors, evaluation, and mapped-field projections
- [Field Compatibility and Conversion](field-conversions.md): compatibility of heterogeneous source fields
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): dataset- and view-backed content expansion

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
- `CM-422` `presentation.layout` MUST be exactly `table`, `list`, `cards`, or `board`.
- `CM-423` `presentation.fields` MUST be a non-empty ordered list.
- `CM-424` Every `presentation.fields` entry MUST contain `column`.
- `CM-466` A `presentation.fields` entry's `label`, if present, MUST be non-empty.
- `CM-425` Every presented `column` MUST resolve to exactly one alias in the saved view's embedded query or referenced dataset query.
- `CM-426` Presented `column` values MUST be unique within one saved view.
- `CM-427` A presented field's display name MUST be its `label` when present and its `column` alias otherwise.
- `CM-428` For `list`, `cards`, and `board`, the first presented field MUST be the primary field.
- `CM-467` Later presented fields in `list`, `cards`, and `board` MUST retain declared order as secondary fields.
- `CM-429` A `table` layout MUST present one result row per table row and one presented field per table column in declared order.
- `CM-430` A `list` layout MUST present one result row per list entry.
- `CM-431` A `cards` layout MUST present one result row per card.
- `CM-432` A non-board layout MUST present query groups, when present, as ordered sections without changing group or row order.
- `CM-433` A `board` layout MUST contain `presentation.board`.
- `CM-468` Every non-board layout MUST omit `presentation.board`.
- `CM-434` A board presentation MUST partition the resolved ordered rows by `presentation.board.column` independently of any query `group_by` value.
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
- `CM-444` Rows within a board column MUST preserve their relative portable-query order.
- `CM-445` Presentation MUST NOT add, remove, duplicate, or reorder result rows except for the board partition defined by `CM-439` through `CM-444`.
- `CM-446` Tools MAY choose visual styling, dimensions, controls, and value widgets beyond the layout family, field order, labels, grouping, and board partition defined here.
- `CM-447` Cursor position, selection, collapsed groups, scroll offsets, temporary filters, and other per-session state MUST NOT alter the saved-view artifact's portable result.
- `CM-448` A read-only projected or computed value MUST NOT become writable merely because a saved view presents or groups by it.
- `CM-523` A saved view MUST NOT perform a write through any presented column in this specification version.
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
