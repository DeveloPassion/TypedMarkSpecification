---
specification_version: 0.1.0
name: extension-example
description: Extension identifiers match as complete strings.
extensions:
  "example:review\n": 1.2.0
---

Violates EXT-4: the quoted key contains a trailing newline, not just the
identifier `example:review`.
