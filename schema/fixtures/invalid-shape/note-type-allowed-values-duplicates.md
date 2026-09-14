---
specification_version: 0.1.0
description: Prototype-like strings remain ordinary scalar values.
abstract: true
frontmatter:
  choice:
    type: text
    allowed_values: ["__proto_", "__proto_"]
---

Invalid under FDR-197 because the two scalar values are identical.
