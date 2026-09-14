---
specification_version: 0.1.0
name: tagged-defaults
description: A YAML set is not a validation-default mapping.
validation_defaults: !!set {}
---

Invalid under CM-551: validation defaults require the collection's mapping shape.
