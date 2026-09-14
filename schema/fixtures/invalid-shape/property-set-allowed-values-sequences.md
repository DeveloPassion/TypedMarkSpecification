---
specification_version: 0.1.0
property_set: allowed-values
description: List constraints still require scalar allowed entries.
frontmatter:
  choices:
    type: list
    items: {type: text}
    allowed_values: [[one], [two]]
---

Invalid under FDR-197: the allowed entries are sequences, not scalars.
