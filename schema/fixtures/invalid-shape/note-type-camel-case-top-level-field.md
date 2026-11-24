---
specification_version: 0.1.0
note_type: invalid-top-level-name
label: Invalid Top-Level Name
icon: check
description: A top-level field in lower camel case.
frontmatter:
  startTime:
    type: datetime
---

Invalid because a top-level field name must match `^[a-z][a-z0-9_]*$`
(`MN-25`); lower camel case is allowed only for children of an object.
