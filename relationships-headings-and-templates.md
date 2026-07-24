---
title: Relationships, Headings, Templates, and Content Expansion
parent: TypedMark
nav_order: 9
audience: essentials
---

# Relationships, Headings, Templates, and Content Expansion

Audience: collection authors.

Authoritative for:

- relationship kinds, the relationship block shape, and relationship constraints
- heading rules, including the H1 and H2 contracts
- template content obligations
- template-region ownership, drift classification, and reconciliation
- content-expansion markers, sources, rendering, synchronization, and ejection

See also:

- [Note Links](note-links.md): how internal note links are parsed and resolved
- [Note Type Schemas](note-type-schemas.md): the schema file contract and `template.file` path rules
- [Foundations](foundations.md): the shared expression language used to render source values
- [Managed Notes and Properties](managed-notes-and-properties.md): dependency propagation for automatic expansion refresh

## Relationship Model

The schema system defines only two relationship kinds:

- `belongs_to`
- `related_to`

Definitions:

- `belongs_to`: primary type-level ownership, parent, container, or governing context
- `related_to`: secondary type-level semantic or operational association

The relationship model has two layers:

- type-level relationship declarations on note-type schemas
- concrete note-to-note relationship instances realized through internal note links in managed notes

TypedMark does not constrain which collection notes may link to which. Internal note links between collection notes are always permitted, whether or not the linked note types are declared in any relationship block. Relationship declarations document the expected type-level relationship graph and define how typed relationships between note types are expressed; the constraints they carry apply only to the typed relationship instances derived for declared target note types, never to internal note links as such.

Rules:

- `RHT-1` Relationship declarations are part of note-type schemas.
- `RHT-2` Relationship declarations relate one source note type to one or more target note types.
- `RHT-3` An internal note link between collection notes is never, by itself, a relationship violation.
- `RHT-4` Concrete note-to-note relationship instances are part of instantiated collection conformance.
- `RHT-5` Concrete relationship instances are computed from resolved internal note links using the rules in [Note Links](note-links.md).
- `RHT-6` Metadata properties contribute typed relationship instances only when their field definitions declare `relationship_kind`.
- `RHT-7` Body internal note links participate only in the `related_to` relationship model, and contribute typed relationship instances only for target note types declared under `related_to`; every other body link is purely navigational.
- `RHT-8` Body note links are navigational and relational.
- `RHT-9` `belongs_to` relationship instances MUST be represented in relationship-bearing metadata properties and MUST NOT be satisfied only by body links.
- `RHT-10` Inverse views MAY be derived by tooling and MUST NOT require duplicate schema declarations.

## Relationship Constraints

A concrete note type's effective schema can define `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`. Either mapping can be empty. An effective schema without a `relationships` block is equivalent to one declaring both mappings empty, as defined in [Note Type Schemas](note-type-schemas.md): no documented relationships and no relationship constraints.

Rules:

- `RHT-11` `relationships.belongs_to.allowed_note_types` declares the documented `belongs_to` target note types for the source note type.
- `RHT-12` `relationships.related_to.allowed_note_types` declares the documented `related_to` target note types for the source note type.
- `RHT-13` Constraints are declared per target note type.
- `RHT-14` If a schema file physically declares `relationships`, it MUST define both `relationships.belongs_to.allowed_note_types` and `relationships.related_to.allowed_note_types`.
- `RHT-15` Every referenced target note type MUST be a note type defined in the same collection; it MAY be abstract.
- `RHT-16` An abstract declared target means any concrete note type that extends it directly or transitively; a resolved target satisfies an abstract declared target when its concrete note type is such a descendant.
- `RHT-17` A target note type is declared when it appears directly in `allowed_note_types` or is a concrete descendant of a declared abstract target.
- `RHT-18` Cardinality for an abstract declared target counts the union of resolved targets across all of its concrete descendants.
- `RHT-19` When a resolved target's concrete note type matches more than one declared target within the same relationship kind, the instance counts toward the most specific declared target only: the concrete type itself when declared, and otherwise the nearest declared abstract ancestor.
- `RHT-20` Within a single relationship kind, a target note type identifier MUST appear at most once.
- `RHT-21` The target note type sets for `belongs_to` and `related_to` MUST be disjoint for a given source note type, after expanding abstract targets to their concrete descendants.
- `RHT-22` Each target note type MAY declare `min` and `max`.
- `RHT-23` `min` defaults to `0`.
- `RHT-24` If `max` is omitted, the cardinality is unbounded.
- `RHT-25` If present, `min` and `max` MUST be non-negative integers.
- `RHT-26` If both are present, `max` MUST be greater than or equal to `min`.
- `RHT-27` If a target note type is not declared, no typed-relationship constraint applies to links targeting notes of that type; such links remain valid internal note links and do not create typed relationship instances.
- `RHT-28` A relationship-bearing field whose resolved target's note type is not declared under its relationship kind creates no typed relationship instance; the link itself remains valid.
- `RHT-29` Cardinality is defined per source note type and target note type pair.
- `RHT-30` Schema-definition validation MUST validate declaration shape, referenced note types, cardinality values, and disjointness of relationship kinds.
- `RHT-31` Concrete relationship instance validation MUST evaluate the resolved typed relationship instances against the declared targets and cardinality of the source note type's effective schema.
- `RHT-32` For `belongs_to`, concrete relationship instances are the unique resolved targets referenced by frontmatter fields with `relationship_kind: belongs_to`.
- `RHT-33` For `related_to`, concrete relationship instances are the union of:
  - unique resolved targets referenced by frontmatter fields with `relationship_kind: related_to`
  - unique resolved targets referenced by internal note links in the note body
- `RHT-34` Only resolved managed-note targets create concrete relationship instances.
- `RHT-35` Unresolved placeholders do not satisfy minimum-cardinality requirements until they resolve to concrete targets.
- `RHT-36` Duplicate concrete links from the same source note to the same target note under the same relationship kind are semantically idempotent and count once.
- `RHT-37` A resolved managed-note target that is logically deleted still creates a concrete relationship instance and still counts toward cardinality in this specification version; tools MAY additionally surface links to logically deleted notes as informational diagnostics.
- `RHT-38` The same source note and target note pair MUST NOT be counted under both `belongs_to` and `related_to`.
- `RHT-39` Link validity failures are reported as `invalid_note_link`; cardinality failures on declared targets are reported as `invalid_relationship_instance`, as defined in [Collection Model](collection-model.md).
- `RHT-40` A Markdown link in body content with a destination that is not a supported internal note-link form does not participate in typed relationship conformance.
- `RHT-41` Temporary draft states during authoring or UI workflows are outside persisted conformance.
- `RHT-42` Applications MAY allow transient draft states during authoring, but a persisted note or instantiated collection claimed as conforming MUST satisfy the cardinality rules derived from its note type.

Using the `topic` schema example in [Note Type Schemas](note-type-schemas.md), the relationship block yields these conformance rules:

- `RHT-43` a `topic` MUST belong to exactly one `domain`
- `RHT-44` a `topic` MUST include at least one concrete `related_to` link to a `source`, whether in relationship-bearing metadata, in the body, or both
- `RHT-45` a `topic` MAY be related to any number of `concept` and `topic` notes
- `RHT-46` links from a `topic` to notes of any other note type, or to untyped notes, are ordinary internal note links and are not relationship violations

## Heading Rules

A concrete note type's effective schema can define a `headings` block, including one with no mandatory H2 headings. An effective schema without a `headings` block is equivalent to one declaring `required_h2: []`, `optional_h2: []`, `allow_other_h2: true`, `require_order: false`, and `require_h1_title: false`, as defined in [Note Type Schemas](note-type-schemas.md): no heading constraints.

Rules:

- `RHT-47` Heading detection follows CommonMark; text inside fenced, indented, or inline code is not a heading.
- `RHT-48` H1 headings are ungoverned by default: a managed note MAY contain zero or more H1 headings, and no relationship between an H1 and the `title` field is assumed.
- `RHT-49` A `headings` block MAY declare `require_h1_title` to couple the body H1 to the note's `title` field.
- `RHT-50` `require_h1_title` MUST be a boolean; if omitted, it defaults to `false`.
- `RHT-51` If `require_h1_title` is `true`, the note body MUST contain exactly one H1 heading, that H1 MUST be the first heading in the body, and its text MUST equal the note's stored `title` value under the string comparison rules defined in [Foundations](foundations.md).
- `RHT-52` `require_h1_title: true` is valid only when the effective frontmatter declares a `title` field; a note whose `title` is `null` cannot satisfy it.
- `RHT-53` A `require_h1_title` violation is an `invalid_heading` failure.
- `RHT-54` H1 text is extracted like H2 text: the raw Markdown source after the `# ` marker, with leading and trailing whitespace trimmed.
- `RHT-55` Other heading validation applies to H2 headings only.
- `RHT-56` An H2 heading's text is its raw Markdown source after the `## ` marker, with leading and trailing whitespace trimmed; inline Markdown syntax within the heading is not interpreted or stripped.
- `RHT-57` A managed-note H2 heading matches a declared heading entry when their texts are equal under the string comparison rules defined in [Foundations](foundations.md).
- `RHT-58` `required_h2` entries MUST appear exactly once unless a future specification version says otherwise.
- `RHT-59` `optional_h2` entries MAY appear zero or one time.
- `RHT-60` If `allow_other_h2` is `false`, undeclared H2 headings MUST NOT appear.
- `RHT-61` If `allow_other_h2` is `true`, undeclared H2 headings MAY appear.
- `RHT-62` If `require_order` is `true`, declared H2 headings MUST appear in declared order.
- `RHT-63` If `require_order` is `false`, declared H2 headings MAY appear in any order.
- `RHT-64` H3 and deeper headings are unconstrained by this version of the specification.

## Templates

Each concrete note type's effective schema has a template reference.

A template is pre-instantiation starter state, not a persisted managed note. Its frontmatter has the complete field shape of the effective schema, but it can hold the explicit placeholder values defined below until a tool supplies generated, computed, scaffolded, defaulted, or user-provided values. The instantiated note must satisfy the full managed-note contract before a tool claims that it conforms.

Folder-scoped property sets and folder-scoped mandatory tags are resolved only after an instantiated note has a target collection-relative path. The canonical template therefore represents the path-independent note-type shape and mandatory-tag policy; an instantiating tool adds path-selected fields and tags before it writes the managed note.

Shape at a glance:

| Surface | Physical requirement | Effective default | Purpose |
| --- | --- | --- | --- |
| `template.file` in a schema | Optional | `<note_type>.md` | Names the canonical template under `<metadata_directory>/templates/` |
| template frontmatter | Required in the template file | none | Starter managed-note metadata |
| template body | Optional | empty body | Starter Markdown content |

Rules:

- `RHT-65` The effective `template.file` of a concrete note type MUST point to the canonical template for that note type.
- `RHT-66` The `template.file` path rules — resolution against `<metadata_directory>/templates/`, the `.md` extension, and naming freedom — are defined in [Note Type Schemas](note-type-schemas.md).
- `RHT-67` Templates MUST include YAML starter frontmatter.
- `RHT-68` A template's starter frontmatter MUST satisfy the template-frontmatter rules on this page for the effective schema of the note type that references it.
- `RHT-69` Every field declared in the effective `frontmatter` MUST be physically present in template frontmatter.
- `RHT-70` Template-frontmatter validity is part of system-definition and instantiated-collection validity; an invalid template makes its referencing note type non-conforming.
- `RHT-71` Templates MUST NOT introduce managed-note frontmatter fields solely to mirror schema-level `relationships` declarations.
- `RHT-72` Templates SHOULD include the canonical required H2 headings.
- `RHT-73` System-definition conformance requires every referenced template to exist and be valid; see [Conformance and Roadmap](conformance-and-roadmap.md).
- `RHT-74` A validator MUST NOT infer template drift from unmarked template or note content.
- `RHT-75` When a concrete note type uses the defaulted `template.file`, the corresponding template path is resolved exactly like an explicit `template.file`.
- `RHT-76` A template MUST NOT declare an unknown frontmatter field, except for a core-defined field permitted by [Managed Notes and Properties](managed-notes-and-properties.md).
- `RHT-77` A template MAY store `null` as an unresolved placeholder for any declared field, regardless of that field's effective `nullable` value.
- `RHT-78` A template MAY store `""` as an unresolved placeholder for a declared `text` or `link` field.
- `RHT-79` Template-frontmatter validation MUST skip field type and value-constraint checks for values recognized as unresolved placeholders by `RHT-77` or `RHT-78`.
- `RHT-80` Every non-placeholder template value MUST satisfy its field's effective type and value constraints.
- `RHT-81` A tool that instantiates a template MUST apply scaffold values, defaults, schema-derived values, generation strategies, computed expressions, and user-provided values as applicable before writing the managed note.
- `RHT-82` A tool MUST NOT claim that an instantiated note conforms while any unresolved template placeholder violates the note's effective schema.
- `RHT-83` Template validity does not evaluate storage-path conformance, relationship cardinality, or managed-note heading conformance; those rules apply to the instantiated note.
- `RHT-84` Template-frontmatter validation MUST compute the note type's effective frontmatter without applying `folder_scopes` because a canonical template has no managed-note path.
- `RHT-85` A template MUST NOT include a frontmatter field solely because a `folder_scopes` property set declares it.
- `RHT-86` Before writing an instantiated managed note, a tool MUST resolve its target path and apply every matching folder scope.
- `RHT-87` A tool MUST materialize the resulting effective frontmatter fields before writing the instantiated managed note.
- `RHT-88` A template's path-independent mandatory tags are the collection-level mandatory tags followed by the effective note-type-level mandatory tags, with duplicates removed under the rules in [Collection Model](collection-model.md).
- `RHT-89` When the path-independent mandatory-tag sequence is non-empty, template frontmatter MUST store every entry in its `tags` value.
- `RHT-90` A `null` template placeholder MUST NOT stand in for a non-empty path-independent mandatory-tag sequence.
- `RHT-91` Before writing an instantiated managed note, a tool MUST add the mandatory tags contributed by every folder scope matching the resolved target path.
- `RHT-92` The instantiated note's final `tags` value MUST satisfy the mandatory-tag materialization rules in [Managed Notes and Properties](managed-notes-and-properties.md).

## Template Drift Tracking

Template drift tracking protects selected static regions without claiming ownership of an entire note. A template author marks only the starter prose that should remain comparable. The rest of the instantiated body belongs to the note author and can evolve freely.

Each tracked note carries a compact receipt in the core-defined `template_regions` frontmatter field. The receipt records the canonical region digest last shared by the note and its template, enabling a three-way comparison among the baseline, the current note, and the current template.

For example, a canonical template marks its owned guidance like this:

```markdown
<!-- typedmark:template-region {"specification_version":"0.0.1","id":"review-guidance"} -->
Follow the current review checklist.
<!-- /typedmark:template-region -->
```

An instantiated note copies that source and records its digest:

```markdown
---
note_type: review
template_regions:
  review-guidance:
    baseline: sha256:6d0e3caf8191b133d40ed62b20f304b24be2ee9f3e4de0a3d84b62ad976320a0
---

# Quarterly Review

<!-- typedmark:template-region {"specification_version":"0.0.1","id":"review-guidance"} -->
Follow the current review checklist.
<!-- /typedmark:template-region -->

This paragraph is note-owned and is never compared to the template.
```

### Ownership and Marker Grammar

The marker pair makes ownership visible in the Markdown source while remaining invisible in rendered Markdown. A template-region descriptor identifies the region; it does not contain synchronization policy or executable behavior.

Rules:

- `RHT-178` Template drift tracking MUST be opt-in through template-region markers in the canonical template.
- `RHT-243` A template-region marker MUST appear only in a governed template or an enrolled managed note.
- `RHT-179` Unmarked template body content MUST become note-owned content after instantiation.
- `RHT-238` Template frontmatter MUST NOT participate in template-drift classification.
- `RHT-180` A template region MUST consist of one start marker, one static Markdown region, and one closing marker in that order.
- `RHT-181` A template-region start-marker line MUST contain zero to three leading ASCII spaces, `<!-- typedmark:template-region `, one JSON object on that same line, ` -->`, and no other content.
- `RHT-182` A template-region closing-marker line MUST contain zero to three leading ASCII spaces, `<!-- /typedmark:template-region -->`, and no other content.
- `RHT-183` Marker-shaped text inside CommonMark fenced or indented code MUST NOT be parsed as a template-region marker.
- `RHT-184` The JSON object in a template-region start marker MUST satisfy `schema/json-schema/template-region.schema.json`.
- `RHT-185` The serialized JSON object in a template-region start marker MUST NOT contain the two-character sequence `--`.
- `RHT-186` A template-region descriptor's `specification_version` MUST follow the specification-version rules in [Foundations](foundations.md).
- `RHT-187` Every parsed template-region start marker MUST pair with exactly one subsequent unmatched template-region closing marker.
- `RHT-188` Every parsed template-region closing marker MUST pair with exactly one preceding unmatched template-region start marker.
- `RHT-189` Template-region descriptor `id` values MUST be unique within their Markdown file.
- `RHT-190` Template regions MUST NOT be nested.
- `RHT-191` A content expansion MUST NOT appear inside a template region.
- `RHT-192` A template region MUST NOT appear inside a content expansion.
- `RHT-193` A template region's content MUST be extracted under the materialized-region source-text rule in `RHT-104`.
- `RHT-194` Template-region content MUST participate in heading detection, note-link extraction, relationship derivation, and every other ordinary body-content rule.
- `RHT-195` Template-region marker lines MUST NOT participate in heading detection, note-link extraction, or relationship derivation.
- `RHT-196` The content of a marked region in the canonical template MUST be the authoritative current source for that template-region identifier.
- `RHT-197` A system publisher SHOULD preserve a template-region identifier while the region retains the same semantic role.
- `RHT-198` A system publisher MUST NOT reuse a removed template-region identifier for a different semantic role.
- `RHT-199` A marker-grammar, pairing, nesting, identifier, descriptor-shape, or static-content violation MUST be reported as `invalid_template_region`.

### Receipts and Region Digests

A baseline is a receipt, not a lock. It records the common ancestor needed to distinguish a template update from a local edit. Line-ending normalization makes receipts portable across platforms while every other source character remains significant.

Rules:

- `RHT-200` Template instantiation MUST copy every canonical template region, including its marker pair and content, into the new managed note.
- `RHT-201` Template instantiation MUST add one `template_regions` baseline receipt for every copied template region.
- `RHT-202` A baseline receipt MUST be the digest of the canonical region content copied during instantiation.
- `RHT-203` Region digest calculation MUST normalize every carriage-return-line-feed pair and every remaining carriage return in the extracted region text to one line feed.
- `RHT-204` Region digest calculation MUST encode the normalized region text as UTF-8 without a byte-order mark.
- `RHT-205` A region digest MUST be the lowercase hexadecimal SHA-256 digest of those bytes prefixed by `sha256:`.
- `RHT-206` Region digest calculation MUST NOT perform Unicode normalization, whitespace trimming, Markdown rendering, or any other source transformation.
- `RHT-207` A managed note without a `template_regions` field is unenrolled from template drift tracking.
- `RHT-208` A validator MUST NOT report template drift for an unenrolled managed note.
- `RHT-209` An operation that enrolls an existing note MUST establish each selected region from the current canonical template content.
- `RHT-210` An operation that enrolls an existing note MUST store the resulting current canonical region digest as its baseline receipt.
- `RHT-211` A template-region marker in a managed note MUST have a same-identifier `baseline` receipt.
- `RHT-212` A managed note with `detached: true` for a template-region identifier MUST NOT contain a template-region marker with that identifier.
- `RHT-213` An invalid `template_regions` receipt or marker-to-receipt correspondence MUST be reported as `invalid_template_region`.

### Drift Classification

For one baseline receipt, `B` is its stored digest, `N` is the current note-region digest when that region exists, and `T` is the current canonical template-region digest when that region exists. Structural failures are resolved before drift is classified.

| State | Condition after structural validation | Meaning |
| --- | --- | --- |
| `current` | `N = T` | Note and template agree; `B` can already agree or be stale |
| `template_added` | the note is enrolled; `T` exists; neither a receipt nor `N` exists | Template introduced a region after enrollment |
| `template_changed` | `N = B` and `T != B` | Only the template changed |
| `note_changed` | `T = B` and `N != B` | Only the note changed |
| `both_changed` | `N`, `T`, and `B` are pairwise unequal | Note and template changed differently |
| `region_missing` | `B` and `T` exist; `N` does not exist | Tracked note region was removed |
| `template_removed` | `B` and `N` exist; `T` does not exist; `N = B` | Template removed an otherwise unchanged region |
| `template_removed_note_changed` | `B` and `N` exist; `T` does not exist; `N != B` | Template removed a locally changed region |
| `retired` | `B` exists; neither `N` nor `T` exists | Region is already absent on both sides |
| `detached` | the receipt stores `detached: true` and `N` does not exist | Note explicitly opted out for this identifier |

For a concrete walkthrough, leave the note at the shared baseline and edit only the canonical template; the result is `template_changed`. Edit only the note instead and the result is `note_changed`. Edit both sides to different content and the baseline distinguishes that conflict as `both_changed`.

Rules:

- `RHT-214` Digest equality for template drift MUST compare the complete `sha256:` digest strings exactly.
- `RHT-244` For an enrolled note, a validator MUST evaluate the union of canonical template-region identifiers, note template-region identifiers, and `template_regions` receipt keys.
- `RHT-215` A validator MUST classify each structurally valid tracked identifier according to the table above.
- `RHT-245` Changing a canonical template-region identifier MUST classify as removal of the old identifier and addition of the new identifier.
- `RHT-216` The portable `drift_kind` values MUST be exactly `template_added`, `template_changed`, `note_changed`, `both_changed`, `region_missing`, `template_removed`, and `template_removed_note_changed`.
- `RHT-217` A validator MUST report each classification named by `RHT-216` as one `template_drift` result.
- `RHT-218` A `template_drift` result MUST identify the region with `template_region` and the classification with `drift_kind`.
- `RHT-219` A validator MUST NOT report `current`, `retired`, or `detached` as template drift.
- `RHT-220` A validator MUST report a structural `invalid_template_region` failure instead of a drift classification for the same invalid region state.
- `RHT-221` When `N` equals `T` but `B` differs, a tool MAY update only the baseline receipt to `T`.
- `RHT-222` When a tracked identifier is `retired`, a tool MAY remove its baseline receipt.
- `RHT-223` When a detached identifier no longer exists in the canonical template, a tool MAY remove its detached receipt.
- `RHT-239` Receipt cleanup MUST preserve an enrolled note's `template_regions` field as an empty mapping when its final receipt is removed.

### Reconciliation and Detachment

Reconciliation turns a reported state into an explicit content decision. The safe automatic case is a template-only change: the note still equals its baseline, so replacing that region cannot discard a local edit. Every ambiguous or destructive case remains under author control.

| Drift kind | Safe default | Explicit alternatives |
| --- | --- | --- |
| `template_added` | leave the note unchanged | insert the current region, or decline it as detached |
| `template_changed` | refresh from the template | detach, or defer |
| `note_changed` | preserve the note | detach, or reset from the template |
| `both_changed` | preserve both inputs for resolution | detach, reset, or write a manual resolution |
| `region_missing` | preserve the absence | restore from the template, or detach |
| `template_removed` | preserve the note until confirmed | accept removal, or detach |
| `template_removed_note_changed` | preserve the local content | detach, or explicitly accept removal |

Rules:

- `RHT-224` Drift evaluation MUST NOT modify a note, its receipts, or its canonical template.
- `RHT-225` A tool MAY refresh `template_changed` automatically by replacing the note region with the current canonical region and updating its baseline to `T`.
- `RHT-226` A template-region body edit and its corresponding receipt edit MUST commit atomically.
- `RHT-227` A tool MUST NOT automatically edit note body content for `template_added`, `note_changed`, `both_changed`, `region_missing`, `template_removed`, or `template_removed_note_changed`.
- `RHT-228` Inserting a `template_added` region MUST require an explicit reconciliation request.
- `RHT-242` Inserting a `template_added` region MUST copy the current canonical marker pair and content and add a baseline equal to `T`.
- `RHT-229` Resetting an existing region MUST replace its content with the current canonical region and set its baseline to `T`.
- `RHT-230` Detaching an existing region MUST remove both marker lines, preserve the region content in place, and replace its baseline receipt with `detached: true`.
- `RHT-231` Declining a `template_added` region MUST record `detached: true` without adding a marker or region content.
- `RHT-232` Restoring a `region_missing` region MUST require an explicit reconciliation request.
- `RHT-241` Restoring a `region_missing` region MUST insert the current canonical marker pair and content and set its baseline to `T`.
- `RHT-240` Detaching a `region_missing` region MUST replace its baseline receipt with `detached: true`.
- `RHT-233` Accepting template removal MUST remove the note marker pair, its region content, and its receipt.
- `RHT-234` An operation that removes or overwrites locally changed region content MUST require explicit confirmation after presenting the affected content.
- `RHT-235` A manual resolution of `both_changed` MUST set its baseline to `T`; its resulting state is `current` when `N` equals `T` and `note_changed` when `N` differs from `T`.
- `RHT-236` An explicit whole-note unenrollment MUST remove every template-region marker while preserving each region's content and then remove `template_regions`.
- `RHT-237` A reconciliation write MUST leave the managed note conforming under every applicable frontmatter, heading, relationship, storage, and content-expansion rule.

## Content Expansion

A content expansion keeps a marker-delimited region of ordinary Markdown derived from one declared source. The source remains authoritative while the rendered region stays readable in every Markdown editor; an author can eject the markers at any time and keep the rendered Markdown as ordinary prose.

For example, this expansion mirrors the note's `summary` field:

```markdown
<!-- typedmark:expansion {"specification_version":"0.0.1","id":"project-summary","mode":"auto","state":"materialized","source":{"kind":"self_field","field":"summary"},"render":{"item":"${value}"}} -->
The current project summary.
<!-- /typedmark:expansion -->
```

### Marker Grammar

The start marker carries one compact JSON descriptor. The lines between it and the closing marker are the materialized region; the comment lines themselves remain invisible in rendered Markdown.

Rules:

- `RHT-93` A content expansion MAY appear in the body of any collection note or governed template.
- `RHT-94` A content expansion MUST consist of one start marker, one materialized region, and one closing marker in that order.
- `RHT-95` A start-marker line MUST contain zero to three leading ASCII spaces, `<!-- typedmark:expansion `, one JSON object on that same line, ` -->`, and no other content.
- `RHT-96` A closing-marker line MUST contain zero to three leading ASCII spaces, `<!-- /typedmark:expansion -->`, and no other content.
- `RHT-97` Marker-shaped text inside CommonMark fenced or indented code MUST NOT be parsed as a content-expansion marker.
- `RHT-98` The JSON object in a start marker MUST satisfy `schema/json-schema/expansion.schema.json`.
- `RHT-175` The serialized JSON object in a start marker MUST NOT contain the two-character sequence `--`.
- `RHT-99` A descriptor's `specification_version` MUST follow the specification-version rules in [Foundations](foundations.md).
- `RHT-100` Content expansions MUST NOT be nested.
- `RHT-101` Every parsed start marker MUST have exactly one closing marker.
- `RHT-102` Every parsed closing marker MUST have exactly one preceding unmatched start marker.
- `RHT-103` Descriptor `id` values MUST be unique within their Markdown file.
- `RHT-104` The materialized region is the sequence of zero or more complete source lines strictly between the marker lines, joined by their intervening line endings with the marker-line terminators excluded.
- `RHT-105` Materialized-region Markdown MUST participate in heading detection, note-link extraction, relationship derivation, and every other ordinary body-content rule.
- `RHT-106` The two marker-comment lines MUST NOT themselves participate in heading detection, note-link extraction, or relationship derivation.
- `RHT-107` A tool that refreshes an expansion MUST limit its body edit to that expansion's materialized region and descriptor state.
- `RHT-108` Ejecting an expansion MUST remove both marker lines while preserving the materialized region in place.
- `RHT-109` A marker-grammar, pairing, nesting, identifier, or descriptor-shape violation is an `invalid_expansion` failure.

### Sources and Rendering

Every source evaluates to an ordered sequence of text values. A single-value source therefore uses the same rendering path as a relationship traversal, while the deliberately small shared expression language controls presentation. Computed fields need no separate source kind because their materialized values are read through the field sources after recomputation. Query-backed selection is reserved for the portable query contract; this version does not invent an expansion-only query language. Filesystem creation and modification timestamps are likewise excluded because they are not stable collection data—authors can store portable timestamps in typed fields instead.

This descriptor renders outbound `related_to` targets as a Markdown list:

```json
{
  "specification_version": "0.0.1",
  "id": "related-sources",
  "mode": "manual",
  "state": "materialized",
  "source": {
    "kind": "relationship",
    "relationship": "related_to",
    "direction": "outbound",
    "target_note_types": [
      "source"
    ]
  },
  "render": {
    "item": "- ${value}",
    "empty": "_No sources._"
  }
}
```

Rules:

- `RHT-110` The content-expansion modes in this specification version are exactly `auto`, `manual`, `once`, and `once_and_eject`.
- `RHT-111` The content-expansion states in this specification version are exactly `pending` and `materialized`.
- `RHT-112` The content-expansion source kinds in this specification version are exactly `self_field`, `note_field`, `relationship`, `file`, and `now`.
- `RHT-113` Every source evaluation MUST produce an ordered sequence containing zero or more strings.
- `RHT-114` A stored string source value MUST contribute that string unchanged.
- `RHT-115` A stored boolean source value MUST contribute `true` or `false` in lowercase.
- `RHT-116` A stored integer source value MUST use the integer representation defined by `SCE-85` in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `RHT-117` A stored number source value MUST use the number representation defined by `SCE-86` in [Systems, Composition, and Evolution](systems-composition-evolution.md).
- `RHT-118` An absent or null stored source value MUST produce an empty sequence.
- `RHT-119` A stored sequence source value MUST contribute its scalar entries in stored order using `RHT-114` through `RHT-117`.
- `RHT-120` A stored mapping, nested sequence, or null sequence entry MUST make source evaluation fail.
- `RHT-121` A `self_field` source MUST read the named top-level field from the containing note's parsed frontmatter.
- `RHT-169` A `self_field` source on a note without valid YAML frontmatter MUST make source evaluation fail.
- `RHT-171` A `self_field` source in a managed note MUST name an effective-schema field or a core-defined managed-note field.
- `RHT-122` A `note_field.note` value MUST be a supported internal note link under [Note Links](note-links.md).
- `RHT-123` A `note_field.note` value MUST resolve to exactly one managed note.
- `RHT-124` A `note_field` source MUST read its named top-level field from the resolved note's parsed frontmatter.
- `RHT-172` A `note_field` source MUST name an effective-schema field or a core-defined managed-note field of its resolved note.
- `RHT-125` A `relationship` source MUST be evaluated only for a managed containing note.
- `RHT-126` An outbound `relationship` source MUST select the containing note's unique concrete relationship targets for the named relationship kind.
- `RHT-127` An inbound `relationship` source MUST select the unique managed notes that have the named concrete relationship kind to the containing note.
- `RHT-128` An omitted `relationship.direction` MUST have the effective value `outbound`.
- `RHT-170` Every identifier in `target_note_types` MUST resolve to exactly one concrete or abstract note type.
- `RHT-129` A present `target_note_types` list MUST filter relationship targets using the concrete-and-abstract target semantics of `RHT-16` and `RHT-17`.
- `RHT-130` Relationship targets MUST be ordered by normalized collection-relative path in ascending Unicode code-point order.
- `RHT-131` A relationship source without `field` MUST contribute each selected target as the root-relative standard Markdown link defined by `RHT-166` and `RHT-167`.
- `RHT-166` The generated relationship-link label MUST be the target's final path segment without `.md`, with `\`, `[`, and `]` escaped by a preceding backslash.
- `RHT-167` The generated relationship-link destination MUST be `/` followed by the normalized collection-relative path, with every UTF-8 byte other than an ASCII letter, digit, `-`, `.`, `_`, `~`, or `/` percent-encoded using uppercase hexadecimal digits.
- `RHT-132` A relationship source with `field` MUST contribute the named top-level field from each selected target in target order.
- `RHT-173` A relationship source with `field` MUST name an effective-schema field or a core-defined managed-note field of every selected target.
- `RHT-133` Values from one relationship target's sequence field MUST precede values from every later target.
- `RHT-134` A `file` source with `value: path` MUST contribute the containing note's normalized collection-relative path.
- `RHT-135` A `file` source with `value: filename` MUST contribute the final path segment including `.md`.
- `RHT-136` A `file` source with `value: stem` MUST contribute the final path segment without `.md`.
- `RHT-137` A `now` source MUST use the collection timezone defined in [Collection Model](collection-model.md).
- `RHT-174` A `now` source MUST use the current instant at the start of its materialization request.
- `RHT-138` A `now.format` value MUST use the format semantics defined for `{now:format}` by `NTS-119` and `NTS-120` in [Note Type Schemas](note-type-schemas.md).
- `RHT-139` A `now` source MUST use `once` or `once_and_eject` mode.
- `RHT-140` `render.item` MUST be evaluated as a shared text-template expression once for each source value.
- `RHT-141` The only reference name available to `render.item` MUST be `value`.
- `RHT-142` Rendered items MUST be joined in source order using the literal `render.separator` value.
- `RHT-143` An omitted `render.separator` MUST have the effective value of one line-feed character.
- `RHT-144` A zero-value source MUST render the literal `render.empty` value.
- `RHT-145` An omitted `render.empty` MUST have the effective value of the empty string.

### Materialization, Synchronization, and Drift

Pending descriptors are template-time declarations. Materialization evaluates the source, renders the result, and writes plain Markdown; thereafter the mode decides whether the source remains authoritative. Automatic and manual expansions share the same conformance requirement, but only automatic mode participates in propagation without an explicit refresh request.

For example, a template can seed an expansion without pretending that placeholder frontmatter has already produced current content:

```markdown
<!-- typedmark:expansion {"specification_version":"0.0.1","id":"owner","mode":"auto","state":"pending","source":{"kind":"self_field","field":"owner"},"render":{"item":"Owner: ${value}"}} -->
<!-- /typedmark:expansion -->
```

Rules:

- `RHT-146` A pending expansion's materialized region MUST be empty.
- `RHT-147` Materializing an expansion MUST replace its region with the current rendered source result.
- `RHT-148` Materializing an expansion other than `once_and_eject` MUST set its descriptor state to `materialized`.
- `RHT-149` Materializing a `once_and_eject` expansion MUST eject its markers in the same write.
- `RHT-150` Every content expansion in a governed template MUST have `state: pending`.
- `RHT-168` A pending template expansion's source MUST NOT be evaluated before template instantiation.
- `RHT-151` Template instantiation MUST materialize expansions after resolving the target path, final frontmatter values, and non-expansion starter body and before writing the note.
- `RHT-152` Adding an ad hoc expansion to a collection note MUST write a materialized expansion atomically.
- `RHT-153` A materialized `auto` expansion's region MUST equal its current rendered source result.
- `RHT-154` A propagation-capable tool MUST refresh an affected `auto` expansion before committing the propagation closure.
- `RHT-155` A materialized `manual` expansion's region MUST equal its current rendered source result.
- `RHT-156` A tool MUST refresh a `manual` expansion only in response to an explicit refresh or materialization request.
- `RHT-157` A pending `once` expansion MUST be materialized by note creation or an explicit materialization request.
- `RHT-158` A materialized `once` expansion MUST NOT re-evaluate its source for conformance or propagation.
- `RHT-159` The materialized region of a `once` expansion MAY be edited as ordinary Markdown.
- `RHT-160` The materialized regions of `auto` and `manual` expansions MUST be treated as read-only derived content until ejected.
- `RHT-161` A tool MAY explicitly eject an expansion in any mode.
- `RHT-162` A persisted collection note MUST NOT contain a pending expansion.
- `RHT-163` An applicable source-resolution, source-conversion, or render-expression failure is an `invalid_expansion` failure.
- `RHT-164` Unequal current and stored output for a materialized `auto` or `manual` expansion is an `expansion_drift` failure.
- `RHT-165` Expansion-output equality MUST compare the rendered result and materialized-region source text exactly after normalizing line endings in both to line feed.
- `RHT-176` Content-expansion descriptor and region changes outside template regions MUST NOT affect template-drift state.
- `RHT-177` Ejection of a `once_and_eject` expansion outside template regions MUST NOT affect template-drift state.
