---
title: Note Links
parent: TypedMark
nav_order: 8
audience: essentials
---

# Note Links

Authoritative for:

- internal note-link forms and parsing
- the deterministic target-resolution algorithm, including anchors and asset links
- body link extraction and inline body tags

See also:

- [Field Definition Reference](field-definition-reference.md): `format: note_link`, `validate_exists`, and `targets` on link fields
- [Relationships, Headings, and Templates](relationships-headings-and-templates.md): how resolved links become typed relationship instances
- [Foundations](foundations.md): the string comparison rules used by resolution

## Note-Link Syntax and Resolution

Internal note links connect collection notes. This section defines the supported link forms, the parsed link components, and the deterministic target-resolution algorithm. Two conforming tools MUST resolve the same internal note link, in the same collection, to the same result.

### Link Forms

Rules:

- `NL-1` The supported internal note-link forms are wikilinks and standard Markdown links.
- `NL-2` Supported wikilink forms are:
  - `[[Target]]`
  - `[[Target|Display text]]`
  - `[[Target#Heading]]`
  - `[[Target#Heading|Display text]]`
  - `[[Target#^block-id]]`
  - `[[Target#^block-id|Display text]]`
- `NL-3` Supported Markdown link forms are:
  - `[Display text](Target)`
  - `[Display text](Target.md)`
  - `[Display text](Target.md#Heading)`
  - `[Display text](Target.md#^block-id)`
- `NL-4` An embed is any supported form prefixed with `!`, such as `![[Target]]` or `![Alt text](Target.md)`.
- `NL-5` A Markdown link destination that contains an RFC 3986 URI scheme, such as `https:` or `mailto:`, is an external link, not an internal note link.
- `NL-6` Markdown link destinations MUST be URL encoded where RFC 3986 requires it; notes linking to managed notes SHOULD prefer wikilinks.
- `NL-7` Managed note frontmatter fields with `type: link` and `format: note_link` store exactly one non-embed internal note-link string in either supported form.
- `NL-8` Link parsing and target resolution are the same wherever an internal note link appears, in frontmatter or in the note body.

### Link Parsing

Rules:

- `NL-9` An internal note link MUST parse into these components: the raw source string, the form (`wikilink` or `markdown`), the target, an optional anchor, an optional display text, and an embed flag.
- `NL-10` In wikilinks, the segment after `|` is the display text and the segment after the first `#` is the anchor.
- `NL-11` In Markdown links, the bracketed segment is the display text and the destination segment after the first `#` is the anchor; the destination before it is the target, URL decoded before resolution.
- `NL-12` An anchor beginning with `^` is a block identifier; any other anchor is heading text.
- `NL-13` Display text and the embed flag never affect target resolution.

### Target Resolution

A parsed target resolves through the following algorithm. Path-formed targets resolve by path; simple wikilink names resolve by name.

Rules:

1. `NL-14` If the form is `markdown`: a target with a leading `/` resolves from the collection root with the leading `/` removed; any other target resolves relative to the containing note's directory.
2. `NL-15` If the form is `wikilink`: a target starting with `./` or `../` resolves relative to the containing note's directory; a target with a leading `/` resolves from the collection root with the leading `/` removed; any other target containing `/` resolves from the collection root; a target with no `/` is a simple name and resolves by name under rule 5.
3. `NL-16` Path resolution MUST normalize `.` and `..` segments before lookup. If the normalized path escapes the collection root, the link MUST NOT resolve and is an `invalid_note_link` failure.
4. `NL-17` A path-formed target ending in `.md` resolves to the collection note at exactly that collection-relative path, or to zero notes when no such note exists. Any other path-formed target resolves to the asset at exactly that collection-relative path when such an asset exists; otherwise `.md` is appended and the target resolves to the collection note at the resulting path, or to zero notes.
5. `NL-18` Name resolution considers collection notes that are not excluded by `exclude_paths`, in three passes:
   - The id pass matches managed notes whose stored `id` equals the target. Exactly one match resolves the link. More than one match makes the link ambiguous.
   - If the id pass has no match, the name pass matches collection notes whose file name without the `.md` extension equals the target. Exactly one match resolves the link. When several notes match, the candidates in the same directory as the containing note are preferred; among the remaining candidates, those whose path has the fewest segments are preferred. If more than one candidate still remains, the link is ambiguous.
   - If the name pass has no match, the alias pass matches managed notes whose stored `aliases` value contains an entry equal to the target. Exactly one match resolves the link. When several notes match, the name-pass tiebreakers apply; if more than one candidate still remains, the link is ambiguous.
   - If no note pass matches and the target contains a `.`, the asset pass matches assets whose full file name equals the target. Exactly one match resolves the link. When several assets match, the name-pass tiebreakers apply; if more than one candidate still remains, the link is ambiguous.
6. `NL-19` An ambiguous link MUST NOT resolve and is an `invalid_note_link` failure.
7. `NL-20` Aliases participate in resolution only through the alias pass, using the stored `aliases` values defined in [Managed Notes and Properties](managed-notes-and-properties.md); a note's file name always takes precedence over another note's alias.
8. `NL-21` Target, `id`, file-name, and alias comparisons in this algorithm are case-sensitive exact string comparisons.
9. `NL-22` Resolution to zero notes MAY occur and represents a link to a note that does not exist yet; it is not by itself a failure, unless the declaring field requires existence through `validate_exists`, defined in [Field Definition Reference](field-definition-reference.md).
10. `NL-23` A note MAY link to itself; a self-link resolves to the containing note.

### Anchors

Rules:

- `NL-24` A heading anchor refers to heading text within the resolved note; a block anchor refers to a block identifier within the resolved note.
- `NL-25` Anchors do not affect note-target resolution.
- `NL-26` An anchor that does not match anything in the resolved note is not a conformance failure in this specification version; tools MAY report it.

### Asset Links

Rules:

- `NL-27` An asset is a non-Markdown collection file, as defined in [Foundations](foundations.md); assets excluded by `exclude_paths` are not collection content.
- `NL-28` An internal link or embed whose target resolves to an asset is an asset link.
- `NL-29` Asset links resolve by exact path, or by full file name through the asset pass; assets have no frontmatter, so the id and alias passes never match them.
- `NL-30` Asset links and embeds never create typed relationship instances and never satisfy relationship cardinality.
- `NL-31` An asset link whose target does not resolve points to an asset that does not exist yet; it is not by itself a failure, and tools MAY report it.
- `NL-32` Anchors on asset links have no defined meaning in this specification version.
- `NL-33` Managed note frontmatter fields with `format: note_link` target notes; this specification version defines no field-level asset references.

Relationship conformance uses the resolved managed-note targets produced by these rules; counting and cardinality rules are defined in [Relationships, Headings, and Templates](relationships-headings-and-templates.md).

### Body Link Extraction

The note body is the content after the frontmatter block. Body internal note links participate in structural reasoning, so what counts as a body link must be deterministic.

Rules:

- `NL-34` Internal note links are extracted from the note body wherever they appear, except in the excluded regions below.
- `NL-35` Links are NOT extracted from fenced code blocks delimited by ``` or `~~~`, from indented code blocks as defined by CommonMark, or from inline code spans delimited by backticks.
- `NL-36` A backslash immediately before `[[` escapes the wikilink: the backslash is consumed and the brackets are literal text. Markdown links follow standard CommonMark escaping.
- `NL-37` Text inside an excluded region or escaped link is not an internal note link: it creates no relationship instance and is not evaluated by link validation.
- `NL-38` Embeds are extracted as internal note links with the embed flag set; tools MUST be able to distinguish embeds from non-embed links.
- `NL-39` Embeds participate in body-link relationship counting like non-embed body links.

### Inline Body Tags

Rules:

- `NL-40` This specification version assigns no structural meaning to inline `#tag` tokens in note bodies.
- `NL-41` Managed tag metadata lives in frontmatter fields with `type: tags`.
- `NL-42` Tools MAY index inline body tags for search or navigation, but MUST NOT use them for note-type mapping, field conformance, or relationship conformance.

