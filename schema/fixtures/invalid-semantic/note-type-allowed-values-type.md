---
specification_version: 0.1.0
description: Scalar shape does not establish field-type compatibility.
abstract: true
frontmatter:
  count:
    type: integer
    allowed_values: [one]
---

Shape-valid, but invalid under FDR-198 because the scalar string is not an integer.
