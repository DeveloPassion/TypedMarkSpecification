---
title: Canonical Serialization
parent: TypedMark
nav_order: 6
---

# Canonical Serialization

This page is a normative appendix for canonical serialization of all governed artifacts.

Unless a more specific rule says otherwise, the rules in this page apply to:

- `typedmark.yaml`
- `.metadata/system.yaml`
- `.metadata/instance.yaml`
- `.metadata/property-sets/*.yaml`
- `.metadata/schemas/*.yaml`
- managed note frontmatter

Rules:

- All governed artifacts MUST use canonical serialization.
- Canonical serialization is normative and is not an implementation preference.
- An artifact that is semantically valid but not canonically serialized is non-conforming.
- `typedmark.yaml` and YAML files under `.metadata/` MUST contain exactly one YAML document and MUST NOT include YAML document delimiter lines such as `---` or `...`.
- Canonical YAML text MUST be UTF-8 encoded.
- Canonical YAML line endings MUST use LF.
- Canonical YAML indentation MUST use two spaces per level.
- Tab characters MUST NOT be used for indentation.
- Managed note frontmatter MUST be the first content in the file.
- Managed note frontmatter MUST be delimited by an opening `---` line and a closing `---` line.
- If the note body is non-empty, the closing frontmatter delimiter MUST be followed by exactly one blank line before body content begins.
- YAML `null` values MUST be rendered as the bare literal `null`.
- YAML boolean values MUST be rendered as lowercase `true` and `false`.
- Empty arrays MUST be rendered as `[]`.
- Empty mappings MUST be rendered as `{}`.
- Non-empty arrays MUST use block sequence style.
- Non-empty mappings MUST use block mapping style.
- Single-line string values MUST use plain scalar style only when all of the following are true:
  - the value is non-empty
  - the value has no leading or trailing whitespace
  - the value is not exactly `null`, `true`, `false`, or `~`
  - the value matches `^[A-Za-z0-9_][A-Za-z0-9_./@%+-]*(?: [A-Za-z0-9_./@%+-]+)*$`
- Single-line string values that do not satisfy all plain-scalar conditions MUST use double-quoted style.
- Multi-line string values MUST use literal block scalar style with strip chomping: `|-`.
- Double-quoted scalar values MUST escape `\` as `\\`, `"` as `\"`, tab as `\t`, carriage return as `\r`, line feed as `\n`, and any other control character as `\uXXXX`.
- In canonical double-quoted scalars, hexadecimal digits in `\uXXXX` escapes MUST use uppercase `A-F`.
- Printable non-control Unicode characters other than `\` and `"` MUST be emitted literally in UTF-8 and MUST NOT be escaped.
- Single-quoted scalars MUST NOT be used in canonical YAML artifacts.
- Folded block scalars MUST NOT be used in canonical YAML artifacts.
- Frontmatter values with `format: note_link`, and list items with `format: note_link`, MUST use double-quoted scalar style.
- Canonical serialization does not rewrite one valid internal note-link form into another semantically equivalent form.
- For general `list` fields, list order is semantically significant and MUST be preserved exactly as stored unless a future specification version defines field-level unordered-list semantics.
- Unknown but allowed frontmatter fields MUST appear after all declared fields, sorted lexicographically by field name.

## Canonical Top-Level Key Order

- In `typedmark.yaml`: `specification_version`, `collection_model_id`, `exclude_paths`, `validation_defaults`, `global_properties`, then any allowed unknown keys in lexicographic order.
- In `.metadata/system.yaml`: `specification_version`, `system_id`, `version`, `name`, `description`, `audiences`, `publisher`, `license`, `scaffold`, `catalog`, then any allowed unknown keys in lexicographic order.
- In `.metadata/instance.yaml`: `specification_version`, `collection_instance_id`, `collection_model_id`, `system_id`, `system_version`, then any allowed unknown keys in lexicographic order.
- In `.metadata/property-sets/<property_set>.yaml`: `specification_version`, `property_set`, `description`, `frontmatter`, then any allowed unknown keys in lexicographic order.
- In `.metadata/schemas/<note_type>.yaml`: `specification_version`, `note_type`, `label`, `icon`, `kind`, `description`, `inheritance`, `property_sets`, `storage`, `template`, `frontmatter`, `relationships`, `headings`, `guidance`, then any allowed unknown keys in lexicographic order.

## Canonical Nested Key Order

- In `scaffold`: `folders`, `notes`, then any allowed unknown keys in lexicographic order.
- In scaffold note entries: `path`, `note_type`, `from_template`, `values`, then any allowed unknown keys in lexicographic order.
- In `storage`: `path_pattern`, `archive`, then any allowed unknown keys in lexicographic order.
- In `archive`: `policy`, `archived_path_pattern`, then any allowed unknown keys in lexicographic order.
- In `template`: `file`, then any allowed unknown keys in lexicographic order.
- In `frontmatter`: `required_fields`, `optional_fields`, then any allowed unknown keys in lexicographic order.
- In `relationships`: `belongs_to`, `related_to`, then any allowed unknown keys in lexicographic order.
- In each relationship kind mapping: `allowed_note_types`, then any allowed unknown keys in lexicographic order.
- In `headings`: `required_h2`, `optional_h2`, `allow_other_h2`, `require_order`, then any allowed unknown keys in lexicographic order.
- In `guidance`: `when_to_use`, `when_not_to_use`, then any allowed unknown keys in lexicographic order.

## Canonical Frontmatter Key Order

1. `note_type`
2. `id`
3. remaining fields from `frontmatter.required_fields`, in effective schema order, excluding `note_type` and `id`
4. fields from `frontmatter.optional_fields`, in effective schema order
5. any allowed unknown fields, in lexicographic order

## Generic Mapping Order Rules

- Any governed mapping whose key order is not explicitly defined above MUST sort keys lexicographically by Unicode code point order.

## Effective Schema Field Order Rules

- Within a single YAML mapping, field declaration order is significant.
- For inherited global fields, inherited fields keep their original relative order.
- Fields contributed by property sets are appended after inherited global fields in the note type schema's declared `property_sets` order, while preserving each property set's internal field declaration order.
- If a property set overrides an inherited global field, or a local field overrides an inherited or property-set-provided field, it retains the earlier field's position in effective order.
- New local fields that are not inherited and are not provided by property sets are appended after inherited and property-set-provided fields in their local declaration order.

## Tooling Obligations

- Tools that create governed artifacts MUST emit canonical serialization.
- Tools that import or scaffold governed artifacts MUST emit canonical serialization.
- Tools that modify governed artifacts MUST rewrite them into canonical serialization before saving.
- Tools that only modify note body content SHOULD preserve already-canonical frontmatter byte-for-byte when possible.
- Validators SHOULD report non-canonical serialization as a distinct failure from semantic schema violations.
