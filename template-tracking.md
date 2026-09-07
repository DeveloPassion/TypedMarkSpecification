---
title: Template Tracking
parent: TypedMark
nav_order: 24
audience: tool-authors
---

# Template Tracking

Audience: tool authors implementing template drift tracking.

Authoritative for:

- template-region ownership, drift classification, and reconciliation
- the `template_regions` core-defined managed-note field and receipt state

See also:

- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): core template content obligations
- [Managed Notes and Properties](managed-notes-and-properties.md): the managed-note contract and other core-defined fields
- [Content Expansion](content-expansion.md): derived Markdown regions and their interaction with template regions
- [Foundations](foundations.md): specification versioning and parsing baselines

## Template Drift Tracking

Template drift tracking protects selected static regions without claiming ownership of an entire note. A template author marks only the starter prose that should remain comparable. The rest of the instantiated body belongs to the note author and can evolve freely.

Each tracked note carries a compact receipt in the core-defined `template_regions` frontmatter field. The receipt records the canonical region digest last shared by the note and its template, enabling a three-way comparison among the baseline, the current note, and the current template.

For example, a canonical template marks its owned guidance like this:

<!-- typedmark-example: body: Template-owned region markers and Markdown content. -->
```markdown
<!-- typedmark:template-region {"specification_version":"0.1.0","id":"review-guidance"} -->
Follow the current review checklist.
<!-- /typedmark:template-region -->
```

An instantiated note copies that source and records its digest:

<!-- typedmark-example: body: Managed-note template-region receipt and content. -->
```markdown
---
note_type: review
template_regions:
  review-guidance:
    baseline: sha256:6d0e3caf8191b133d40ed62b20f304b24be2ee9f3e4de0a3d84b62ad976320a0
---

# Quarterly Review

<!-- typedmark:template-region {"specification_version":"0.1.0","id":"review-guidance"} -->
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

### Template Region Frontmatter

`template_regions` is portable note-local tracking state, not a schema field. A baseline records the canonical region version last shared by the note and its template; a detached receipt records a deliberate opt-out for one identifier.

<!-- typedmark-example: fragment: Managed-note template-region receipts within frontmatter. -->
```yaml
template_regions:
  review-guidance:
    baseline: sha256:6d0e3caf8191b133d40ed62b20f304b24be2ee9f3e4de0a3d84b62ad976320a0
  legacy-footer:
    detached: true
```

Rules:

- `MN-284` `template_regions` is an optional core-defined managed-note field name in this specification version.
- `MN-285` `template_regions` MAY appear in stored frontmatter even when it is not declared in the effective schema, because it is core-defined rather than user-defined.
- `MN-286` A property set or a note-type schema MUST NOT declare `template_regions`.
- `MN-287` If stored, `template_regions` MUST be a YAML mapping.
- `MN-288` Every key in `template_regions` MUST be a slug identifying one template region.
- `MN-289` Every `template_regions` value MUST be a mapping containing exactly either `baseline` or `detached`.
- `MN-290` A `baseline` value MUST match `^sha256:[0-9a-f]{64}$`.
- `MN-291` A `detached` value MUST be the YAML boolean `true`.
- `MN-292` `template_regions` receipts MUST satisfy `schema/json-schema/template-tracking.schema.json`.
- `MN-293` Template frontmatter MUST NOT store `template_regions`.
- `MN-294` The `template_regions` mapping records whole-note enrollment and per-identifier receipt state for [Template Drift Tracking](template-tracking.md#template-drift-tracking).

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
