---
specification_version: 0.0.1
name: my-collection
description: Collection that wrongly lists itself as a composition source.
metadata_directory: .typedmark
exclude_paths:
  - .git/**
validation_defaults:
  invalid_composition: error
composition:
  sources:
    - name: my-collection
      version: 1.0.0
---

VALID SHAPE, INVALID SEMANTICS: a composition source name must not equal the composing collection's own name.
This body is non-normative documentation; tools ignore it for structural reasoning.
