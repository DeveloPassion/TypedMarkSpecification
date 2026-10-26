---
title: Effective Schema Export
parent: TypedMark
nav_order: 10
audience: tool-authors
---

# Effective Schema Export

Audience: tool authors handing resolved note-type contracts to agents and other tools.

Authoritative for:

- the `typedmark:effective-schema` export document for one concrete note type
- field provenance across Core, local, ancestor, and property-set layers

See also:

- [Note Type Schemas](note-type-schemas.md#effective-note-type-schema): how the effective schema is built
- [Schema Reuse](schema-reuse.md) and [Property Sets](property-sets.md): the layers a field can come from
- [Extensions and Capabilities](extensions.md#standard-contracts): contract identity and versions

This is an optional interchange contract. Agents and editors need "what fields
does a meeting have, and where do they come from?" without reimplementing
inheritance and composition. A tool that supports it exports one read-only
document per concrete type; collections never store or declare these documents,
and validation never reads them.

## Export Document

The document is plain JSON. Every value is the effective one, after Core
defaults, inheritance, property sets, and local definitions, and each field
records the layer that last defined it:

<!-- typedmark-example: artifact=effective-schema -->
```json
{
  "contract": "typedmark:effective-schema",
  "version": "0.1.0",
  "specification_version": "0.1.0",
  "note_type": "meeting",
  "label": "Meeting",
  "description": "A dated meeting note.",
  "ancestors": ["event"],
  "fields": {
    "title": {"definition": {"type": "text", "nullable": true}, "origin": {"kind": "core"}},
    "meeting_date": {"definition": {"type": "date"}, "origin": {"kind": "ancestor", "source": "event"}},
    "attendees": {"definition": {"type": "list", "items": {"type": "text"}}, "origin": {"kind": "property_set", "source": "people"}},
    "status": {"definition": {"type": "text", "allowed_values": ["draft", "final"]}, "origin": {"kind": "local"}}
  },
  "storage": {"folder_pattern": "Meetings", "note_name_pattern": "{meeting_date} - {title}"},
  "headings": {"required_h2": ["Agenda", "Notes"], "optional_h2": [], "allow_other_h2": true, "require_order": false, "require_h1_title": false},
  "relationships": {
    "belongs_to": {"allowed_note_types": {}},
    "related_to": {"allowed_note_types": {}},
    "contains": {"allowed_note_types": {}},
    "depends_on": {"allowed_note_types": {}}
  },
  "mandatory_tags": ["meeting"],
  "unknown_field": "error"
}
```

Rules:

- `ES-1` An effective-schema document MUST describe one concrete note type of one collection snapshot and satisfy `schema/json-schema/effective-schema.schema.json`.
- `ES-2` A document MUST contain `contract` equal to `typedmark:effective-schema`, `version`, `specification_version`, `note_type`, `label`, `description`, `fields`, `storage`, `headings`, `relationships`, `mandatory_tags`, and `unknown_field`.
- `ES-3` Every top-level value MUST be the type's effective value under `NTS-20`, and an optional key with no effective value MUST be absent.
- `ES-4` `ancestors` MUST list the abstract ancestor chain from the nearest parent to the farthest, and MUST be absent for a type without `extends`.
- `ES-5` `fields` MUST contain every effective field and every Core-defined field, each with its effective `definition` and an `origin`.
- `ES-6` `origin.kind` MUST be `core`, `local`, `ancestor`, or `property_set`, naming the last layer that declared the field; `ancestor` and `property_set` origins MUST name that layer's slug in `source`.
- `ES-7` `mandatory_tags` MUST be the effective mandatory tags of `CM-231`, in that order.
- `ES-8` `unknown_field` MUST be the effective severity for the type's managed-note frontmatter.
- `ES-9` Producers MUST NOT store a document under `<metadata_directory>`, and validation MUST NOT read one, as `NTS-22` requires.
- `ES-10` Two producers given the same collection snapshot and type MUST produce documents equal under JSON value equality.
