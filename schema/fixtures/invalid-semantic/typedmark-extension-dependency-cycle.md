---
specification_version: 0.1.0
name: extension-example
description: Known extension contracts form a dependency cycle.
extensions:
  example:review: 1.2.0
  example:labels: 2.0.0
---

Assume `example:review` at `1.2.0` requires `example:labels` at `2.0.0`,
and `example:labels` at `2.0.0` requires `example:review` at `1.2.0`.
The cycle violates EXT-15 even though every exact version appears in the map.
