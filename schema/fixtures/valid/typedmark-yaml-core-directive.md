---
%YAML 1.1
--- # This YAML document marker is not the exact frontmatter closing delimiter.
specification_version: 0.1.0
name: on
description: yes
x_values: [off, 012, 0o12, 0b10, 1:20, 2026-09-15]
x_selection: &selection !!set {one: null}
x_copy: *selection
---

FND-25 fixes Core resolution even when a version directive is retained in the
authored source. Identity words remain strings and explicit tags remain supported.
