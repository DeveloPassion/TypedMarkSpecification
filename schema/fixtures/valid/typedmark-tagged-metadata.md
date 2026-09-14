---
specification_version: 0.1.0
name: tagged-metadata
description: Native tagged values remain opaque vendor metadata.
x_editor:
  set: &selection !!set {one: null, two: null}
  alias: *selection
  ordered: !!omap [{one: 1}, {two: 2}]
  timestamp: !!timestamp 2026-09-15T12:34:56Z
  bytes: !!binary SGVsbG8=
---

Valid vendor metadata under EXT-24. Checking the artifact shape does not rewrite
these values or interpret them as structural declarations.
