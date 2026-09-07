---
title: Expressions
parent: TypedMark
nav_order: 27
audience: advanced
---

# Expressions

Audience: collection authors and tool authors using computed fields.

Authoritative for:

- the shared expression language
- computed field definitions, sibling-field scope, and stored-value evaluation

See also:

- [Foundations](expressions.md#shared-expression-language): the shared expression language
- [Field Definition Reference](field-definition-reference.md): field types, constraints, and generation
- [Managed Notes and Properties](managed-notes-and-properties.md): stored frontmatter and materialization
- [Authoring](authoring.md): immutable fields and additional generation strategies

This optional module defines computed fields as a consumer of the shared expression language. Its scope is sibling-field derivation; field types and general materialization remain with their linked owners.

## `computed`

`computed` defines a stored text field whose value is derived from sibling frontmatter fields instead of being authored directly. Unlike `generated`, it is not about value origination from time, randomness, identity, or tool-specific automation; it is the single schema-defined mechanism for sibling-field derivation in this specification version. It uses the [shared text-template expression context](#shared-expression-language).

Example:

<!-- typedmark-example: fragment: Field definitions within a frontmatter declaration. -->
```yaml
first_name:
  type: text
  nullable: false
last_name:
  type: text
  nullable: false
full_name:
  type: text
  computed: '${capitalize(first_name)} ${capitalize(last_name)}'
  nullable: false
```

Rules:

- `FDR-218` `computed` MAY be omitted.
- `FDR-219` If present, `computed` MUST be a non-empty string in the [shared text-template expression context](#shared-expression-language).
- `FDR-220` `computed` MAY be declared only on top-level frontmatter fields.
- `FDR-221` `computed` is the single schema-defined mechanism for deriving a field value from sibling fields of the same managed note.
- `FDR-222` `generated` and `computed` are distinct: `generated` covers value origination without sibling-field inputs; `computed` covers sibling-field derivation.
- `FDR-223` A field declaring `computed` MUST declare `type: text`.
- `FDR-224` A field declaring `computed` MUST NOT declare `generated`, `default_value`, `const_value`, or `value_from_schema`; the computed expression is the field's materialization behavior.
- `FDR-225` A field declaring `computed` MUST NOT declare `immutable: true`, because its stored value is recomputed from its dependencies.
- `FDR-226` `computed` does not make a field virtual. Computed fields still follow the same type validation, optionality, stored-frontmatter, and canonical materialization rules as other declared fields.
- `FDR-227` For `computed`, the shared expression-language scope is the managed note's sibling top-level fields in the effective `frontmatter`.
- `FDR-228` Every reference name used by a `computed` expression MUST resolve to a sibling top-level field declared in the same effective `frontmatter`, and MUST NOT resolve to the declaring field itself or to a field that itself declares `computed`.
- `FDR-229` Every field referenced by a `computed` expression MUST declare `type: text`.
- `FDR-230` `computed` uses the [shared expression-language syntax and transform semantics](#shared-expression-language); it defines no local syntax extensions.
- `FDR-231` A `computed` expression is evaluated against the managed note's materialized sibling-field values after non-computed defaults, schema-derived values, and generation strategies have been applied.
- `FDR-232` Every referenced field MUST hold a concrete non-null string when the `computed` expression is evaluated; otherwise the computed field has no conforming value and MUST be reported as `invalid_field_value`.
- `FDR-233` Tools that create, scaffold, import, normalize, or otherwise write managed-note frontmatter MUST evaluate every `computed` expression and store the resulting value before writing the note.
- `FDR-234` A stored computed value MUST equal the result of its `computed` expression; a mismatch is an `invalid_field_value` failure.
- `FDR-235` The computed result MUST satisfy the field's declared constraints; a schema MUST NOT combine `computed` with constraints its expression cannot satisfy.
- `FDR-236` `computed` MUST NOT depend on the note body, resolved note links, query results, collection-global state, or any data outside the sibling-field scope defined above.
- `FDR-237` A `computed` field whose stored value disagrees with its evaluated expression is a note-level `invalid_field_value` failure, not a schema-shape failure.
- `FDR-238` A syntactically invalid shared expression, an unresolved sibling-field reference, a type-incompatible reference, or an unknown transform name makes the declaring artifact invalid.

## Shared Expression Language

Several governed surfaces need to derive values from structured data. Rather than defining separate mini-languages for each feature, TypedMark defines one shared expression language and lets each consumer define its own input scope, required result type, and evaluation timing.

Example:

<!-- typedmark-example: fragment: Computed expression within a field definition. -->
```yaml
computed: '${capitalize(note_type)}: ${title}'
```

Rules:

- `FND-58` TypedMark defines one shared expression language. A governed surface uses it only when another rule explicitly says so.
- `FND-59` This specification version defines exactly one shared expression context: the text-template context.
- `FND-60` A text-template expression is a string composed of literal text plus zero or more placeholders.
- `FND-61` A placeholder has the form `${name}` or `${transform(name)}`.
- `FND-62` `name` and `transform` in the shared expression language MUST each match the field-name grammar `^[a-z][a-z0-9_]*$`.
- `FND-63` The shared expression parser operates on the decoded string value after parsing its containing YAML or JSON syntax. Within that string, `\\` represents a literal backslash and `\${` represents a literal `${`; any other backslash escape is invalid.
- `FND-64` Shared-expression evaluation MUST be deterministic and side-effect free.
- `FND-65` Shared expressions MUST NOT read the current time, random sources, the filesystem, the network, or any state outside the consumer-defined input scope.
- `FND-66` The shared transform library in this specification version contains exactly `uppercase`, `lowercase`, and `capitalize`.
- `FND-67` `uppercase(name)` and `lowercase(name)` each take exactly one reference-name argument and return the referenced string converted to uppercase or lowercase respectively, using locale-independent Unicode case mapping.
- `FND-68` `capitalize(name)` takes exactly one reference-name argument and returns the referenced string with its first Unicode code point converted to uppercase and its remaining code points converted to lowercase; the empty string remains empty.
- `FND-69` This specification version defines no other placeholder forms, no nested transform calls, and no transform arguments other than one reference name.
- `FND-70` This specification version defines no dot access, bracket access, arithmetic, comparisons, boolean operators, conditionals, list indexing, link traversal, regex operators, or date arithmetic in the shared expression language.
- `FND-71` Every consumer of the shared expression language MUST define the expression's available reference names, required result type, evaluation timing, and how absent or null input values are handled.
- `FND-72` A consumer MAY narrow the shared language's available reference names or result types, but it MUST NOT redefine the shared syntax or transform semantics.
- `FND-73` A syntactically invalid shared expression or an unknown transform name makes the declaring artifact invalid.
