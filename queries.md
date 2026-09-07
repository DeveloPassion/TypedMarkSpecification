---
title: Queries
parent: TypedMark
nav_order: 20
audience: tool-authors
---

# Queries

Audience: tool authors implementing portable selection and projection of managed notes.

Authoritative for:

- the portable query descriptor and evaluation surface
- boolean, path, field, and relationship predicates
- projection, heterogeneous field mapping, ordering, grouping, and limiting

See also:

- [Collection Model](collection-model.md): note-type association and shared [Path Matching](collection-model.md#path-matching)
- [Note Type Schemas](note-type-schemas.md): effective schemas
- [Field Definition Reference](field-definition-reference.md): field types and value equality
- [Field Compatibility and Conversion](field-conversions.md): mapped-field conversions
- [Datasets and Views](datasets-and-views.md): reusable query results and presentation
- [Relationships, Headings, Templates, and Content Expansion](relationships-headings-and-templates.md): resolved relationships and query-backed content expansion

## Portable Queries

A portable query is a plain JSON descriptor for selecting and projecting managed notes without embedding a host application's query language. It describes observable behavior rather than an execution plan: tools can evaluate it by scanning files, consulting an index, or using a database as long as they produce the same result from the same collection snapshot. Saved-view persistence, presentation layout, aggregation, pagination, query strings, executable expressions, and index formats are separate concerns.

### Descriptor and Evaluation Surface

Evaluation begins from managed notes after note-type association and effective-schema construction. It uses current parsed field values and concrete resolved relationships, so abstract schemas and property sets influence a query only through the effective model they produce.

This query selects active projects in one area and names each projected column explicitly:

<!-- typedmark-example: artifact=query -->
```json
{
  "specification_version": "0.1.0",
  "note_types": ["project"],
  "where": {
    "kind": "relationship",
    "relationship": "belongs_to",
    "note_types": ["area"],
    "where": {
      "kind": "field",
      "field": "status",
      "operator": "equals",
      "value": "active"
    }
  },
  "select": [
    {"kind": "path", "as": "path"},
    {"kind": "field", "field": "title", "as": "title"}
  ]
}
```

Rules:

- `CM-300` A portable query descriptor MUST be a JSON object containing `specification_version` and `select`.
- `CM-385` A portable query descriptor MAY additionally contain `note_types`, `where`, `order_by`, `group_by`, and `limit`.
- `CM-301` A query descriptor MUST satisfy `schema/json-schema/query.schema.json` before semantic evaluation.
- `CM-302` `specification_version` MUST identify the TypedMark specification version whose query semantics the descriptor uses.
- `CM-405` Query evaluators MUST apply the version-recognition and forward-compatibility behavior of `FND-8` through `FND-14` to query descriptors.
- `CM-303` `select` MUST be a non-empty ordered list of projection entries.
- `CM-304` A standalone portable query descriptor is runtime interchange data and MUST NOT become authoritative collection input merely by being stored or transmitted.
- `CM-473` A portable query embedded in a core-governed dataset, saved view, or content expansion MUST be evaluated as part of that governed surface.
- `CM-305` Query evaluation MUST observe one immutable collection snapshot.
- `CM-306` The initial candidate set MUST contain every managed note in that snapshot.
- `CM-386` The initial candidate set MUST exclude governed artifacts, excluded paths, assets, and untyped notes.
- `CM-307` Before evaluating a candidate, a query evaluator MUST resolve its concrete note type, effective schema, current canonical field values, and concrete relationships.
- `CM-308` Query evaluation MUST fail when a note admitted by the top-level `note_types` filter cannot provide the effective model required by `CM-307`.
- `CM-309` An omitted top-level `note_types` MUST admit every candidate note type.
- `CM-310` A present top-level `note_types` MUST be a non-empty list of unique concrete or abstract note-type identifiers.
- `CM-311` Every note-type identifier in a query MUST resolve to exactly one concrete or abstract note type.
- `CM-312` A concrete note-type identifier MUST match only that concrete type.
- `CM-387` An abstract note-type identifier MUST match every concrete descendant under the target semantics of `RHT-16` and `RHT-17`.
- `CM-313` A present top-level `note_types` MUST filter candidates before `where` evaluation.
- `CM-314` An omitted `where` MUST match every remaining candidate.
- `CM-315` A query evaluator MUST apply note-type filtering, predicate filtering, projection, ordering, limiting, and presentation grouping in that sequence.
- `CM-316` Query evaluation MUST NOT modify a collection file or governed artifact.
- `CM-317` Execution strategy, indexing, and caching MUST NOT change the result defined by this section.

### Boolean, Path, and Field Predicates

Predicates are recursive JSON objects rather than strings. Boolean nodes compose path and typed-field tests without introducing a second expression language; field comparisons reuse the declared field type and the common equality rules in the Field Definition Reference.

For example, this predicate selects notes under `Projects/` that carry either of two tags and do not have a review timestamp:

<!-- typedmark-example: artifact=query -->
```json
{
  "specification_version": "0.1.0",
  "where": {
    "kind": "all",
    "predicates": [
      {"kind": "path", "operator": "under", "value": "Projects/"},
      {"kind": "field", "field": "tags", "operator": "contains_any", "value": ["priority/high", "review"]},
      {"kind": "field", "field": "reviewed_at", "operator": "exists", "value": false}
    ]
  },
  "select": [
    {"kind": "path", "as": "path"}
  ]
}
```

Rules:

- `CM-318` Predicate `kind` values in this specification version are exactly `all`, `any`, `not`, `path`, `field`, and `relationship`.
- `CM-319` An `all` or `any` predicate MUST contain a non-empty `predicates` list.
- `CM-320` An `all` predicate matches exactly when every child predicate matches.
- `CM-321` An `any` predicate matches exactly when at least one child predicate matches.
- `CM-322` A `not` predicate MUST contain exactly one child `predicate` and matches exactly when that child does not match.
- `CM-323` A path predicate's `operator` MUST be `equals`, `under`, or `regex`.
- `CM-324` Path predicates MUST evaluate the candidate's normalized collection-relative path, including its `.md` extension.
- `CM-325` Path `equals`, `under`, and `regex` MUST use the matching semantics defined by `CM-406`, `CM-404`, `CM-101`, and `CM-102`.
- `CM-403` A path `equals` value MUST be a normalized collection-relative note path including its `.md` extension.
- `CM-326` A field predicate's `field` MUST be a dot-separated field path beginning with one effective top-level field or core-defined managed-note field.
- `CM-327` Each field-path segment after the first MUST name a declared field in the preceding `object.fields` mapping.
- `CM-328` Field paths MUST NOT traverse a list or use an index.
- `CM-329` The field operators in this specification version are exactly `exists`, `equals`, `regex`, `contains_any`, `contains_all`, `less_than`, `less_than_or_equal`, `greater_than`, and `greater_than_or_equal`.
- `CM-330` An `exists` predicate's `value` MUST be a boolean.
- `CM-388` An `exists` predicate's `value` MUST equal whether the complete field path is physically present in the candidate's current parsed frontmatter value.
- `CM-331` A field predicate other than `exists` MUST evaluate to false when its field path is undeclared or absent on the candidate.
- `CM-332` An `equals` predicate on a present field MUST compare its `value` under the field definition and equality rules `FDR-239` through `FDR-244`.
- `CM-333` An `equals` predicate with `value: null` MUST match only a physically present null field value whose field definition permits null.
- `CM-334` The four ordering operators MUST be used only with `text`, `link`, `integer`, `number`, `checkbox`, `date`, `time`, or `datetime` fields.
- `CM-401` An ordering predicate's comparison value MUST be non-null and valid for the field definition.
- `CM-335` Ordered `text` and `link` comparisons MUST compare NFC-normalized Unicode code points with case preserved.
- `CM-336` Ordered `integer` and `number` comparisons MUST use numeric value.
- `CM-389` Ordered `checkbox` comparisons MUST place `false` before `true`.
- `CM-337` Ordered `date` and `time` comparisons MUST use calendar-date or wall-clock-time order.
- `CM-390` Ordered `datetime` comparisons MUST use instant order.
- `CM-338` An ordering predicate MUST evaluate to false for a null field value.
- `CM-339` A field `regex` predicate MUST contain a non-empty ECMA-262 regular expression.
- `CM-391` A field `regex` predicate MUST be used only with a `text` or `link` field.
- `CM-340` A field `regex` predicate MUST match against the entire NFC-normalized stored string.
- `CM-341` A `contains_any` or `contains_all` predicate MUST contain a non-empty `value` list.
- `CM-392` A `contains_any` or `contains_all` predicate MUST be used only with a `list` or `tags` field.
- `CM-342` Every operand of a containment predicate MUST satisfy the applicable list-item or tag definition.
- `CM-343` `contains_any` MUST match when at least one operand equals at least one stored entry under the applicable field-value equality rules.
- `CM-344` `contains_all` MUST match when every operand equals at least one stored entry under the applicable field-value equality rules.
- `CM-345` Query evaluation MUST fail when a field is declared on an evaluated candidate but the selected operator or operand is incompatible with that field definition.
- `CM-346` Query evaluators MUST validate every child of an evaluated boolean predicate.
- `CM-393` Query evaluators MUST NOT use short-circuiting to conceal an invalid child.

### Relationship Predicates

A relationship predicate counts unique resolved notes, optionally narrowing them by target type and another recursive predicate. This supports direct questions such as “projects belonging to at least one active area” while retaining the relationship model's direction and abstract-target behavior.

<!-- typedmark-example: artifact=query -->
```json
{
  "specification_version": "0.1.0",
  "where": {
    "kind": "relationship",
    "relationship": "related_to",
    "direction": "inbound",
    "note_types": ["source"],
    "count": {"min": 2, "max": 10}
  },
  "select": [
    {"kind": "note_type", "as": "type"},
    {"kind": "path", "as": "path"}
  ]
}
```

Rules:

- `CM-347` A relationship predicate MUST declare `relationship` as `belongs_to` or `related_to`.
- `CM-348` An omitted relationship-predicate `direction` MUST have the effective value `outbound`.
- `CM-349` An outbound relationship predicate MUST begin with the candidate's unique concrete targets for the named relationship kind.
- `CM-350` An inbound relationship predicate MUST begin with the unique managed notes having the named concrete relationship kind to the candidate.
- `CM-351` A present relationship-predicate `note_types` MUST filter related notes under `CM-310` through `CM-312` and `CM-387`.
- `CM-352` A present relationship-predicate `where` MUST retain only related notes for which that recursive predicate matches.
- `CM-353` An omitted relationship-predicate `count` MUST have the effective value `{min: 1}`.
- `CM-354` A present `count` MUST contain `min`, `max`, or both as non-negative integers.
- `CM-355` An omitted `count.min` MUST have the effective value `0`.
- `CM-394` An omitted `count.max` MUST impose no upper bound.
- `CM-356` A present `count.min` MUST NOT exceed a present `count.max`.
- `CM-357` A relationship predicate MUST match exactly when the number of retained unique related notes is within its inclusive effective count range.
- `CM-358` A nested relationship predicate MUST evaluate against the related note as its candidate.
- `CM-395` A nested relationship predicate MAY contain further finite predicate nesting.

### Projection, Ordering, Grouping, and Limiting

Projection produces one conceptual row per matching note. Every column has an explicit stable alias, allowing saved views and content expansions to refer to a column without depending on display labels. Grouping is presentational: it partitions the ordered rows but does not aggregate or collapse them.

This descriptor orders rows by status and due date, keeps null due dates last, limits the ordered result, and then presents the retained rows in status groups:

<!-- typedmark-example: artifact=query -->
```json
{
  "specification_version": "0.1.0",
  "note_types": ["project"],
  "select": [
    {"kind": "field", "field": "status", "as": "status"},
    {"kind": "field", "field": "due", "as": "due"},
    {"kind": "field", "field": "title", "as": "title"}
  ],
  "order_by": [
    {"column": "status", "direction": "asc"},
    {"column": "due", "direction": "asc", "nulls": "last"},
    {"column": "title", "direction": "asc"}
  ],
  "group_by": ["status"],
  "limit": 50
}
```

Rules:

- `CM-359` Projection entry `kind` values in this specification version are exactly `path`, `note_type`, `field`, and `mapped_field`.
- `CM-360` Every projection entry MUST contain an `as` value satisfying the field-name grammar.
- `CM-361` Projection aliases MUST be unique within one query.
- `CM-362` A `path` projection MUST produce the matching note's normalized collection-relative path including `.md`.
- `CM-363` A `note_type` projection MUST produce the matching note's concrete note-type identifier.
- `CM-364` A `field` projection MUST contain a `field` path governed by `CM-326` through `CM-328`.
- `CM-365` A `field` projection MUST produce the current parsed field value when the complete path is present and null when it is undeclared or absent.
- `CM-477` A `mapped_field` projection MUST contain `definition` as its common target field definition and `sources` as a non-empty ordered list of source mappings.
- `CM-478` A mapped-field source MUST contain a non-empty `note_types` list and one `field` path governed by `CM-326` through `CM-328`.
- `CM-479` Every mapped-field source note-type identifier MUST resolve under the concrete-and-abstract semantics of `CM-310` through `CM-312` and `CM-387`.
- `CM-480` For every concrete note type admitted by the query, at most one source mapping in one mapped-field projection MUST match that concrete type.
- `CM-481` A matching mapped-field source MUST read its declared field from the candidate's effective schema and current parsed value.
- `CM-482` A mapped-field source without `conversion` MUST have an exact source-to-target conversion under [Field Compatibility and Conversion](field-conversions.md#field-compatibility-and-conversion).
- `CM-483` A mapped-field source with `conversion` MUST declare the conversion's actual `lossless` or `conditional` class under `FDR-254` and `FDR-255`.
- `CM-484` A non-exact mapped-field conversion MUST declare `conversion` explicitly.
- `CM-485` A mapped source value MUST be converted to `definition` under `FDR-257` through `FDR-264`.
- `CM-486` A mapped field with no source matching the candidate's concrete note type MUST produce null only when `definition` permits null.
- `CM-487` An absent matching source field MUST produce null only when `definition` permits null.
- `CM-488` A missing, null, or non-null source value that is incompatible with `definition` MUST make query evaluation fail rather than being coerced, dropped, or replaced.
- `CM-489` A mapped-field `definition` MUST NOT declare `validate_exists`, `generated`, `computed`, `unique`, `deprecated`, `immutable`, `optional`, `default_value`, `const_value`, `value_from_schema`, or `relationship_kind` because it describes a result value rather than stored field materialization.
- `CM-490` A projection result is source-backed for one row only when it comes from exactly one physical field and any conversion has a defined reverse conversion that round-trips the presented value under `FDR-270` through `FDR-276`.
- `CM-491` `path`, `note_type`, absent-source, and non-round-trippable projection results are read-only.
- `CM-533` An aggregate, derived, or ambiguously sourced value produced outside the portable projected column contract MUST be read-only.
- `CM-492` A source-backed classification records provenance and write-back eligibility only; this specification version MUST NOT interpret it as authorization to edit through a query, dataset, view, or expansion.
- `CM-493` A projected result produced from a `generated`, `computed`, or `immutable` source field MUST be read-only.
- `CM-366` Each result row MUST contain exactly one key for every projection alias in declared `select` order.
- `CM-367` Result-row order MUST be independent of whether `path` is projected.
- `CM-368` A present `order_by` MUST be a non-empty ordered list whose entries refer to distinct projection aliases.
- `CM-369` Every `order_by.column` MUST resolve to exactly one projected column.
- `CM-370` An omitted `order_by.direction` MUST have the effective value `asc`.
- `CM-371` An omitted `order_by.nulls` MUST have the effective value `last`.
- `CM-372` `nulls` placement MUST be applied independently of sort direction.
- `CM-373` Every non-null value observed in one ordered column MUST belong to one compatible scalar comparison domain defined by `CM-335` through `CM-337`, `CM-389`, and `CM-390`.
- `CM-374` Ordering by a list, mapping, or incompatible mixture of scalar domains MUST make query evaluation fail.
- `CM-375` A present `order_by` MUST compare entries in declared order.
- `CM-396` A present `order_by` MUST use normalized collection-relative path in ascending Unicode code-point order as the final tie-breaker.
- `CM-376` An omitted `order_by` MUST order rows by normalized collection-relative path in ascending Unicode code-point order.
- `CM-377` A present `limit` MUST be a non-negative integer.
- `CM-397` A present `limit` MUST produce exactly the first `min(limit, row count)` rows after ordering.
- `CM-378` `limit: 0` MUST produce no rows.
- `CM-379` A present `group_by` MUST be a non-empty ordered list of distinct projection aliases.
- `CM-380` Every `group_by` alias MUST resolve to exactly one projected column.
- `CM-402` Every grouped column value MUST be scalar or null in every retained row.
- `CM-381` Group keys MUST be tuples of the named column values in declared `group_by` order.
- `CM-398` Path and note-type group-key values MUST use exact string equality under `FND-38`.
- `CM-399` Field group-key values MUST use the applicable equality rules of `FDR-239` through `FDR-244`.
- `CM-400` A null group-key value MUST equal only null.
- `CM-382` Groups MUST appear in the order in which their first member appears in the ordered, limited row sequence.
- `CM-383` Rows within each group MUST preserve their relative order from the ordered, limited row sequence.
- `CM-384` Grouping MUST NOT aggregate, remove, or duplicate a result row.
