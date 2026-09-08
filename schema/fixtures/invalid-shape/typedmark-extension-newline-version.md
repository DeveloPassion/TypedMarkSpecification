---
specification_version: 0.1.0
name: extension-example
description: An extension version has a trailing newline.
extensions:
  example:review: "1.2.0\n"
---

Violates EXT-6: the value is a SemVer string followed by a line terminator,
rather than a complete SemVer string.
