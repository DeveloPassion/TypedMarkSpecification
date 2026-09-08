---
specification_version: 0.1.0
name: extension-example
description: Known contracts require incompatible exact dependency versions.
extensions:
  example:review: 1.2.0
  example:tasks: 1.0.0
  example:labels: 2.0.0
---

Assume `example:review` at `1.2.0` requires `example:labels` at `2.0.0`,
while `example:tasks` at `1.0.0` requires `example:labels` at `3.0.0`.
The conflicting versions violate EXT-15. No version satisfies both requirements.
