---
specification_version: 0.0.1
note_type: meeting
label: Meeting
icon: calendar
kind: dated_record
description: Notes for one meeting.
storage:
  folder_pattern: Meetings
  note_name_pattern: "{meeting_date} - {title}"
frontmatter:
  note_type:
    type: text
    const_value: meeting
  title:
    type: text
    not_blank: true
    nullable: false
  meeting_date:
    type: date
    nullable: false
---

A meeting note records one meeting.
