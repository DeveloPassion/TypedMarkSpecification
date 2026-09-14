---
specification_version: 0.1.0
description: Allowed values cannot contain mappings.
abstract: true
frontmatter:
  choice:
    type: text
    allowed_values: [{valueOf: 1}, {valueOf: 2}]
---

Invalid under FDR-197. Object properties are data, not equality methods to call.
