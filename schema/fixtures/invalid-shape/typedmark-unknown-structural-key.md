---
specification_version: 0.1.0
name: extension-example
description: Unknown structure is not inert metadata.
validation_defaults:
  unknown_field: off
review_preferences: {}
---

Under the implemented Core contract, CM-534 does not let a configured severity
suppress the undeclared structural key. The schema rejects its shape regardless
of configuration; assigning a diagnostic severity is a semantic concern.
