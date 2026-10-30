---
title: Task Items
parent: TypedMark
nav_order: 20
audience: tool-authors
---

# Task Items

Audience: tool authors implementing queries over checklist items inside note bodies.

Authoritative for:

- the `typedmark:items` extension and its `rows: items` query mode
- task-item recognition in note bodies and the item properties
- `item` predicates and projections, and the order of item rows

See also:

- [Queries](queries.md): the portable query descriptor, predicates, projection, and ordering
- [Datasets and Views](datasets-and-views.md): reusable results and presentation
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md#heading-rules): heading detection and heading text
- [Extensions](extensions.md#standard-contracts): declaration and dependencies

The unit of typing stays the note. Checklist lines such as `- [ ] Call the
printer` are not typed, identified, or written through this contract. It only
reads them: a query can return one row per checklist item, so a tool can list
the open items of every daily note or every project without a vendor query
language. Items are recognized with the same CommonMark parse that finds
headings and links, and each row carries the note it belongs to, so note
predicates and projections keep working.

## Item Rows

A query chooses its row source with `rows`. The default, `notes`, keeps one row
per managed note. With `items`, every note that passes the note-type filter
contributes one row per task item in its body, and the rest of the evaluation
runs on those rows. This query lists the open items of daily notes with the
heading each item sits under:

<!-- typedmark-example: artifact=query -->
```json
{
  "specification_version": "0.1.0",
  "note_types": ["daily-note"],
  "rows": "items",
  "where": {"kind": "item", "property": "checked", "operator": "equals", "value": false},
  "select": [
    {"kind": "path", "as": "note"},
    {"kind": "item", "property": "heading", "as": "section"},
    {"kind": "item", "property": "text", "as": "item"}
  ]
}
```

Rules:

- `ITM-1` A portable query descriptor MAY contain `rows`, which MUST be `notes` or `items` when present and defaults to `notes`.
- `ITM-2` With `rows: items`, every candidate that passes top-level note-type filtering MUST contribute one item row per task item in its body, in document order, and a candidate without task items contributes no row.
- `ITM-3` Item rows MUST pass through predicate filtering, projection, ordering, limiting, and grouping in the sequence of `CM-315`, each item row being one result row.
- `ITM-4` On an item row, `path`, `note_type`, `field`, and `mapped_field` projections and `path`, `field`, and `relationship` predicates MUST read the item's note.
- `ITM-5` A governed artifact or body surface that embeds a query with `rows: items` MUST declare `typedmark:items`.

## Task Items

A task item is a list item whose first line starts with a bracketed status
character. Any single character is a status, as editors use `[/]` for started
or `[-]` for cancelled. A space means open and anything else means checked.
Items nested in other items or in block quotes count; lines in code blocks do
not. In this note body, the three list lines are task items and the line in
the fenced code block is not:

<!-- typedmark-example: body: Note body with nested and custom-status task items. -->
````markdown
## Today

- [ ] Call the printer
  - [x] Find the invoice number
- [/] Draft the newsletter

```text
- [ ] Inside a fenced code block
```
````

Rules:

- `ITM-6` A task item MUST be a list item under CommonMark 0.31.2 block structure whose first line of content begins with `[`, exactly one character other than `]` or a line ending, and `]`, followed by a space, a tab, or the end of that line.
- `ITM-7` Only the note body MUST be parsed for task items, and list items that the block structure places inside code blocks or HTML blocks MUST NOT be task items.
- `ITM-8` An item's `status` MUST be its bracketed character, and its `checked` MUST be `false` exactly when that character is a space.
- `ITM-9` An item's `text` MUST be the remainder of its first line after the closing bracket and the whitespace that follows it, without trailing whitespace, as unrendered Markdown source.
- `ITM-10` An item's `line` MUST be the 1-based number of its first line in the note file, counting frontmatter lines.
- `ITM-11` An item's `parent_line` MUST be the `line` of the nearest task item that contains it, or null, and its `depth` MUST be the number of task items that contain it.
- `ITM-12` An item's `heading` MUST be the heading text, under `RHT-47` and `RHT-56`, of the nearest heading before the item in document order, or null when there is none.

## Item Predicates and Projections

An `item` predicate or projection names one item property. The properties
behave like fields of a fixed type, so they compare, match, and order under the
rules for those types. Item values are read-only: a view can present them but
cannot write a checklist line back.

<!-- typedmark-example: fragment: Item predicate selecting started or open items in one section. -->
```json
{
  "kind": "all",
  "predicates": [
    {"kind": "item", "property": "status", "operator": "regex", "value": "[ /]"},
    {"kind": "item", "property": "heading", "operator": "equals", "value": "Today"}
  ]
}
```

Rules:

- `ITM-13` An `item` predicate MUST contain `property`, `operator`, and `value`, and an `item` projection MUST contain `property` and `as`; `property` MUST be `text`, `status`, `checked`, `line`, `depth`, `parent_line`, or `heading`.
- `ITM-14` `item` predicates and projections MUST be used only in a query with `rows: items`.
- `ITM-15` `text`, `status`, and `heading` MUST behave as `text` fields, `checked` as a `checkbox` field, and `line`, `depth`, and `parent_line` as `integer` fields, with `parent_line` and `heading` nullable and every other property non-null.
- `ITM-16` An `item` predicate's `operator` MUST be `equals`, `regex`, or an ordering operator, evaluated under `CM-332` through `CM-340` and `CM-401` for its property's type, with `regex` used only on `text`, `status`, and `heading`.
- `ITM-17` Item rows with equal values for every `order_by` entry and the same path MUST be ordered by ascending `line`, and an omitted `order_by` MUST order item rows by path and then by ascending `line`.
- `ITM-18` Item projections MUST be read-only, and a dataset or saved view whose query uses `rows: items` MUST NOT set a presentation's `writable` to `true`.
