---
%YAML 1.1
--- # YAML content starts here; the exact delimiter below ends frontmatter.
specification_version: 0.1.0
description: Core numeric default conformance.
abstract: true
frontmatter:
  amount:
    type: integer
    default_value: 012
    allowed_values: [10]
---

Shape-valid, but invalid under FDR-4: FND-25 resolves 012 as decimal twelve,
which is not in the declared allowed-value set. It is not legacy octal ten.
