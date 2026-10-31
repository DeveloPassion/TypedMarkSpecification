---
specification_version: 0.1.0
view: goal-breakdown
description: Goals, their projects, and the projects' tasks, each type through its own parent field.
query:
  specification_version: 0.1.0
  note_types: [goal, project, task]
  select:
    - {kind: path, as: path}
    - kind: mapped_field
      as: parent
      definition: {type: link, format: note_link, nullable: true}
      sources:
        - {note_types: [task], field: parent}
        - {note_types: [project], field: goal}
presentation:
  layout: tree
  fields:
    - {column: path}
  tree:
    parent: parent
---
