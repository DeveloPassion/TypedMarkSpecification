---
title: Authoring
parent: TypedMark
nav_order: 28
audience: advanced
---

# Authoring

Audience: collection authors and tool authors implementing authoring behavior.

Authoritative for:

- immutable field semantics
- the additional `ulid`, `random`, and `sequence` generation strategies

See also:

- [Field Definition Reference](field-definition-reference.md#generated): core generation strategies and generic generation behavior
- [Managed Notes and Properties](managed-notes-and-properties.md): core-defined fields and materialization
- [Expressions](expressions.md#computed): computed field definitions
- [Migration Effects](migration-effects.md): managed-note effects of schema changes

This optional module groups field immutability and additional generation strategies used by authoring tools. Core `now`, `now_on_write`, and `uuid` generation and general field materialization remain with their linked owners.

## `immutable`

Immutability preserves a field's first concrete stored value across later edits. It complements the generation behavior defined in the Field Definition Reference.

Example:

<!-- typedmark-example: fragment: Immutable field within a frontmatter declaration. -->
```yaml
external_reference:
  type: text
  immutable: true
```

Rules:

- `FDR-95` `immutable` MAY be omitted.
- `FDR-96` `immutable` MUST be a boolean.
- `FDR-97` If omitted, `immutable` defaults to `false`.
- `FDR-98` `immutable: true` means that once the field holds a concrete non-null stored value, that value MUST NOT change.
- `FDR-99` Immutability is an obligation on tools and operations that modify managed notes; because conformance evaluation is stateless, a validator MAY verify immutability only when it has access to historical state.
- `FDR-100` A `rename_field` migration moves an immutable value unchanged; a `change_field` migration MAY change a field's `immutable` declaration.
- `FDR-101` `const_value` and `value_from_schema` are stronger guarantees than `immutable`; a field declaring either need not also declare `immutable`.
- `FDR-102` The core-defined `id` field is immutable whether or not its definition declares it.
- `FDR-103` `immutable` MAY be declared on top-level fields and on nested fields inside `object.fields`; it MUST NOT be declared on `items`.

## Additional Generation Strategies

These strategies add sortable identifiers, random strings, and sequence numbers to the generation contract in [Field Definition Reference](field-definition-reference.md#generated).

Example:

<!-- typedmark-example: fragment: Additional generation strategies within a frontmatter declaration. -->
```yaml
reference:
  type: text
  generated: ulid
code:
  type: text
  generated:
    random: 12
ticket_number:
  type: integer
  generated:
    sequence:
      start: 1
      scope: note_type
```

Rules:

- `FDR-71` `ulid` is valid for `text` fields. The tool MUST generate a ULID written in lowercase, so the value satisfies `format: slug`, once; it MUST NOT overwrite an existing concrete non-null value.
- `FDR-72` `{ random: n }` is valid for `text` fields. `random` MUST be a positive integer. The tool MUST generate `n` characters drawn uniformly from the lowercase letters `a` through `z` and the digits `0` through `9`, once; it MUST NOT overwrite an existing concrete non-null value.
- `FDR-73` `{ sequence: { start, scope } }` is valid for `integer` fields. `start` MAY be omitted and defaults to `1`; `scope` MAY be omitted, MUST be `note_type` or `collection` when present, and defaults to `note_type`. The generated value is one greater than the highest stored value of this field across the managed notes in scope, or `start` when no stored value exists; `note_type` scope spans managed notes of the same note type and `collection` scope spans all managed notes. The value is produced once: a tool MUST NOT overwrite an existing concrete non-null value.
