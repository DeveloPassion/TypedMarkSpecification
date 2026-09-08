---
specification_version: 0.1.0
name: extension-example
description: A known extension excludes an applicable artifact's core line.
extensions:
  example:review: 1.2.0
---

Assume this known contract supports only Core `0.2`, not the applicable `0.1`
line declared here. The declaration violates EXT-20; string-shape validation
cannot determine the contract's supported core lines.
