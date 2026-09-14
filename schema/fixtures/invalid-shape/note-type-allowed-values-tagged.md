---
specification_version: 0.1.0
description: Metadata aliases do not excuse invalid allowed entries.
abstract: true
x_vendor: &payload !!set {one: null}
frontmatter:
  choice:
    type: text
    allowed_values: [*payload]
  payload:
    type: any
    default_value: *payload
---

Invalid under FDR-197 only at allowed_values. The aliased vendor metadata and
unconstrained default retain their ordinary shape treatment.
