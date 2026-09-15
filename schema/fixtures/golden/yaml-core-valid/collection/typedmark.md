---
%YAML 1.1
--- # YAML document marker, not the frontmatter closer.
specification_version: 0.1.0
name: on
description: yes
x_selection: &selection !!set {yes: null}
x_copy: *selection
---

Core resolution is fixed independently of an authored version directive.
