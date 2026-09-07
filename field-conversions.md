---
title: Field Compatibility and Conversion
parent: TypedMark
nav_order: 8
audience: advanced
---

# Field Compatibility and Conversion

Audience: tool authors combining or migrating differently governed field values.

Authoritative for:

- directional compatibility and conversion between field definitions

See also:

- [Field Definition Reference](field-definition-reference.md): types, constraints, and equality
- [Collection Model](collection-model.md): query and dataset consumers
- [Migration Effects](migration-effects.md): retyping stored fields

This is a shared optional contract, not a dependency on a query engine or a
migration runtime. A consuming contract calls these rules when it needs a
conversion; Core field validation does not perform implicit conversions.

## Field Compatibility and Conversion

Field compatibility matters when a consumer treats values governed by different field definitions as one logical value. Examples include a multi-type dataset, a relationship rollup, an import mapping, or a field retype migration. Compatibility is directional: converting a source field to a target field does not imply that an edited target value can be converted back.

The conversion class describes the source and target property types. Actual compatibility additionally depends on nullability and the target definition's constraints. An identity conversion from one `text` field to another is therefore exact at the type level, but a source value can still be incompatible with a narrower target `regex` or `allowed_values` constraint.

Supported conversions:

| Source | Target | Class | Non-null condition and result |
| --- | --- | --- | --- |
| any field type | the same field type | exact | preserve the parsed value unchanged |
| `integer` | `number` | lossless | preserve the numeric value |
| `date`, `time`, `datetime`, or `link` | `text` | lossless | preserve the parsed string unchanged |
| `tags` | `list` whose `items.type` is `text` | lossless | preserve the sequence and every string unchanged |
| any property type other than `any` | `any` | lossless | preserve the parsed value unchanged |
| `number` | `integer` | conditional | the numeric value has no fractional component; preserve its numeric value |
| `text` | `link`, `date`, `time`, or `datetime` | conditional | the string satisfies the complete target definition; preserve the string unchanged |
| `list` whose `items.type` is `text` | `tags` | conditional | the complete sequence satisfies the target `tags` definition; preserve it unchanged |
| `any` | any property type other than `any` | conditional | the parsed value satisfies the complete target definition; preserve it unchanged |

For example, an `integer` estimate can feed a `number` column losslessly. The number `3` can convert back to an integer, while `3.5` cannot. A `date` cannot become a `datetime` under this contract because choosing a time and offset would invent information.

A multi-type action view illustrates why the distinctions matter. Goals, plans, projects, and tasks may all expose `urgency`, while formula results such as `priority_score` contribute read-only numeric columns used for sorting and averages. Resolving every source property and formula result to a field definition makes those combinations testable. A matching property name does not prove compatible constraints or meaning, and estimates expressed in minutes and days do not become interchangeable without a separate unit conversion contract.

Rules:

- `FDR-249` Every field conversion MUST identify one complete field definition as its source and one complete field definition as its target.
- `FDR-250` Field conversion MUST be evaluated in the source-to-target direction.
- `FDR-251` A source-target property-type pair MUST be classified as exact, lossless, conditional, or incompatible.
- `FDR-252` Two field definitions with the same declared `type` MUST use the exact conversion in the Supported conversions table.
- `FDR-253` Non-exact source-target conversions MUST be limited to the pairs in the Supported conversions table.
- `FDR-254` A supported conversion MUST produce the result stated in the Supported conversions table.
- `FDR-255` A conditional conversion MUST be applicable only when its stated condition holds.
- `FDR-256` Every source-target property-type pair not covered by the Supported conversions table MUST be incompatible.
- `FDR-257` A non-null source value is compatible with a target definition only when its conversion is supported, its conditional requirement when present holds, and its output satisfies the target type and all applicable target value constraints.
- `FDR-258` A null source value is compatible with a target definition only when the target permits null.
- `FDR-259` A compatible null source value MUST convert to null.
- `FDR-260` An absent or undeclared source field is not a field value and MUST NOT be converted by these rules.
- `FDR-261` The consumer of field conversion MUST define how an absent or undeclared source field affects that consumer's result.
- `FDR-262` A conversion MUST NOT modify the stored source value.
- `FDR-263` A conversion MUST NOT substitute a default value for an incompatible source value.
- `FDR-264` A conversion MUST NOT substitute null for an incompatible source value.
- `FDR-265` A conversion MUST NOT round or truncate a numeric source value.
- `FDR-266` A conversion MUST NOT infer a time, timezone, offset, link format, list-item conversion, object-field conversion, unit conversion, or semantic value mapping that the Supported conversions table does not define.
- `FDR-267` An incompatible type pair or incompatible source value MUST be reported to the invoking consumer instead of being coerced.
- `FDR-268` Equality, ordering, grouping, and constraint evaluation after conversion MUST use the target field definition.
- `FDR-269` A source field definition is unconditionally compatible with a target definition only when every value permitted by the complete source definition, including null when permitted, is compatible with the target definition.
- `FDR-270` A source field definition is conditionally compatible with a target definition when their type pair is supported but at least one value permitted by the source definition can be incompatible with the target definition.
- `FDR-271` A source field definition is incompatible with a target definition when their source-target property-type pair is incompatible.
- `FDR-272` A finite set of current source values is compatible with a target definition only when every present value in the set is compatible with the target definition.
- `FDR-273` A tool claiming compatibility for a finite set of current values MUST evaluate every present value in that set.
- `FDR-274` Matching field names, labels, descriptions, icons, or stored YAML shapes MUST NOT establish field compatibility by themselves.
- `FDR-275` Conversion compatibility does not assert that two fields have the same domain meaning.
- `FDR-276` A consumer combining differently governed fields MUST declare which source field maps to which target field or result column.
- `FDR-277` A successful source-to-target conversion MUST NOT imply that target-to-source conversion is supported.
- `FDR-278` A consumer MAY write an edited target value back to a source field only when that edited value is compatible in the target-to-source direction and the consumer defines an unambiguous write operation.
- `FDR-279` A converted result MUST remain read-only when the write-back requirement in `FDR-278` is not satisfied.
- `FDR-280` Conversion MUST NOT override `computed`, `generated`, `immutable`, uniqueness, relationship, or other write and collection-context semantics of either field definition.
