---
specification_version: 0.1.0
automation: stamp-completion
description: Record the date a project first becomes done.
trigger:
  kind: event
  event: note.updated
  changed:
    status:
      to_state: {done: true}
scope:
  note_types:
    - project
actions:
  - kind: set_field
    field: completed_on
    value_from: trigger_date
    only_if_empty: true
  - kind: add_tag
    tag: state/done
---

Stamps the trigger's date once, for any done status value.
