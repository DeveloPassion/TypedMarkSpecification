---
title: Marketplace Catalog
parent: TypedMark
nav_order: 30
audience: advanced
---

# Marketplace Catalog

Audience: marketplace maintainers and system publishers.

Authoritative for:

- the machine-readable marketplace catalog

See also:

- [Systems, Composition, and Evolution](systems-composition-evolution.md): system packaging and publication
- [Collection Model](collection-model.md): collection and system identity

The catalog is a companion distribution contract, not a Core collection
artifact. It remains hosted here until a coordinated repository transfer can
preserve its schema, fixtures, and published references.

## Marketplace Catalog

A marketplace publishes the systems it knows in a machine-readable catalog, so tools and websites can browse systems, download them, and compose them into collections.

Example `marketplace.json`:

<!-- typedmark-example: artifact=marketplace -->
```json
{
  "specification_version": "0.1.0",
  "label": "TypedMark Systems Marketplace",
  "description": "Community catalog of reusable TypedMark systems.",
  "systems": [
    {
      "name": "@acme/para-system",
      "version": "1.2.0",
      "label": "PARA System",
      "description": "PARA-style organization system.",
      "keywords": ["para", "organization"],
      "source": {
        "path": "systems/para-system"
      }
    },
    {
      "name": "dev-team-ai-context",
      "version": "0.3.0",
      "description": "AI context system for development teams.",
      "source": {
        "repository": "https://github.com/example/dev-team-ai-context",
        "ref": "v0.3.0"
      }
    }
  ]
}
```

Rules:

- `SCE-28` A marketplace catalog is a JSON document named `marketplace.json` at the root of the marketplace repository.
- `SCE-29` The catalog is machine-facing distribution metadata, not collection content; it is plain JSON rather than a Markdown artifact with frontmatter.
- `SCE-30` The catalog MUST contain `specification_version` and `systems`, and MAY contain `label` and `description` describing the marketplace itself.
- `SCE-31` `systems` MUST be a list of catalog entries; each entry describes exactly one system release.
- `SCE-32` Each catalog entry MUST declare `name`, `version`, and `source`.
- `SCE-33` An entry's `name` follows the collection identity rules defined in [Collection Model](collection-model.md), and its `version` MUST be a Semantic Versioning 2.0.0 string.
- `SCE-34` The pair of `name` and `version` MUST be unique within one catalog.
- `SCE-35` An entry MAY restate the system's discovery metadata — `label`, `description`, `keywords`, `audiences`, `publisher`, and `license`; when present, these SHOULD equal the values in the system's `typedmark.md`, which remains authoritative.
- `SCE-36` `source` declares where the system lives and MUST take exactly one of two forms:
  - the path form: `path` names the folder containing the system's `typedmark.md`, relative to the catalog's own repository root
  - the repository form: `repository` is an absolute URL of the repository hosting the system, with an optional `path` to the system folder inside that repository, defaulting to the repository root, and an optional `ref` naming a tag, branch, or commit
- `SCE-37` When `ref` is omitted, the hosting repository's default state is used; publishers SHOULD pin a tag or commit so resolution stays reproducible.
- `SCE-38` A `source` MUST lead to a folder containing a `typedmark.md` whose `name` and `version` equal the entry's `name` and `version`.
- `SCE-39` Composition source resolution MAY use one or more marketplace catalogs to resolve `composition.sources` entries; a source that resolves through a catalog to a mismatching system is an `invalid_composition` failure.
- `SCE-40` A marketplace SHOULD validate every listed system as a valid system definition before listing it.
- `SCE-41` The machine-readable JSON Schema for the catalog is published in the specification repository under `schema/json-schema/`.
