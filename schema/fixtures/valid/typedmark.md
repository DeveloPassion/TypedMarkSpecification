---
specification_version: 0.0.1
name: "@example/knowledge-system"
label: Example Knowledge System
description: Reusable knowledge note system.
version: 0.2.0
keywords:
  - notes
  - reference

metadata_directory: .typedmark
exclude_paths:
  - .git/**
validation_defaults:
  path: error
  missing_required_field: error
  missing_declared_field: error
  unknown_field: warn
  invalid_field_value: error
  duplicate_unique_value: error
  invalid_property_set: error
  invalid_note_type_mapping: error
  invalid_composition: error
  unsupported_specification_version: error
  invalid_note_link: error
  invalid_relationship_definition: error
  invalid_relationship_instance: error
  invalid_heading: error
  template_drift: warn

note_type_mappings:
  - kind: frontmatter_field
    field: note_type
  - kind: tag
    tag: meeting
    note_type: meeting
  - kind: folder
    folder: "Sources/"
    note_type: source
  - kind: fixed
    note_type: problem
    when:
      path:
        regex: "^Problems/\\d{4}/\\d{2}/.+\\.md$"
      frontmatter:
        tags:
          contains_any: [problem, blocker]
        severity:
          equals: high

composition:
  sources:
    - name: "@acme/para-system"
      version: 1.2.0
    - name: dev-team-ai-context
      version: 0.3.0

default_property_sets:
  - base

audiences:
  - individual
  - team
publisher:
  name: Example Publisher
license: MIT
scaffold:
  folders:
    - Domains
    - Topics
    - Sources
  notes:
    - path: "Home.md"
      note_type: home
      from_template: "home.md"
      values:
        note_type: home
    - path: "Glossary.md"
      note_type: glossary
      from_template: "glossary.md"
      values:
        note_type: glossary
---

Valid typedmark.yaml for a publishable system composed from one source.
This body is non-normative documentation; tools ignore it for structural reasoning.
