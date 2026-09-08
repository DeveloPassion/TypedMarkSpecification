---
specification_version: 0.1.0
note_type: meeting
label: Meeting
icon: calendar
description: Notes for one meeting.
storage:
  folder_pattern: Meetings
  note_name_pattern: "{meeting_date} - {title}"
frontmatter:
  title:
    type: text
    not_blank: true
    nullable: false
  meeting_date:
    type: date
    nullable: false
---

A meeting note records one meeting.
