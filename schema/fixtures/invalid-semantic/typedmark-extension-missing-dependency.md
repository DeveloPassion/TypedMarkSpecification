---
specification_version: 0.1.0
name: extension-example
description: A declared contract has an omitted dependency.
extensions:
  example:review: 1.2.0
---

Assume the known `example:review` contract at `1.2.0` requires
`example:labels` at `2.0.0`. Both support Core `0.1`. The dependency is
absent from this collection's map, violating EXT-14.
