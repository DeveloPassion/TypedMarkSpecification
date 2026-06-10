# Agent Guidance

## What this repository is

This repository contains the **TypedMark specification** — an open specification for
typed Markdown note systems. It is a normative document set, not an application:
the Markdown pages at the root are the specification itself, published as a website
via Jekyll (`_config.yml`).

Before doing any work here, you MUST read:

1. [README.md](README.md) — entry point
2. [manifesto.md](manifesto.md) — why TypedMark exists; the intent every change must serve
3. [index.md](index.md) — the reading path through the specification pages

When working on a specific area, read the authoritative page for that concern (the
artifact map in [foundations.md](foundations.md) says which page owns what). Each
governed concern is authoritative in exactly one place — never restate a rule on a
second page; link to the authoritative page instead.

## Layout

- `*.md` at the root — the specification pages (the single source of truth)
- `schema/json-schema/` — machine-readable JSON Schemas for the governed artifacts
- `schema/fixtures/` — valid / invalid-shape / invalid-semantic fixtures
- `schema/docs/schema-boundary.md` — what the schemas enforce vs. the semantic layer
- `docs/` — the website builder (`bun run build-site`). It renders the actual
  root spec files into `dist/` and is deployed by `.github/workflows/pages.yml`.
  NEVER copy spec content into `docs/`; the website must always render the
  sources.

Repository scripts are TypeScript run with Bun (`bun install` once, then
`bun run <script>`); do not add Python or shell scripts.

## Related repositories

- [TypedMark](https://github.com/DeveloPassion/TypedMark) — the tooling,
  website, and documentation around the specification
- [TypedMarkExample](https://github.com/DeveloPassion/TypedMarkExample) — a
  concrete system example built on this specification
- [TypedMarkSystemsMarketplace](https://github.com/DeveloPassion/TypedMarkSystemsMarketplace) —
  the systems marketplace: it hosts systems, a website under `docs/` to browse,
  download, and compose them, and the `marketplace.json` catalog listing all
  known systems (in that repository or in others). The catalog's contract lives
  in this specification (Systems, Composition, and Evolution → Marketplace
  Catalog) and its JSON Schema in `schema/json-schema/marketplace.schema.json`.

This repository holds only the specification and its schema layer; tooling,
example-system, and marketplace work belongs in those repositories.

## Hard rule: schemas stay aligned with the specification

The prose specification is the single source of truth. The JSON Schemas under
`schema/json-schema/` mirror it and MUST never drift:

- **Any change to a governed artifact's shape in the prose (new key, removed key,
  changed enum, changed constraint) MUST update the JSON Schemas and the fixtures
  in the same commit.**
- After any schema or fixture change, run `bun run validate-fixtures`
  and make sure it passes before committing.
- Schemas MUST NOT introduce or relax rules on their own; if a rule cannot be
  expressed in JSON Schema, list it in `schema/docs/schema-boundary.md` instead.

## Conventions

- Normative language uses RFC 2119/8174 keywords (`MUST`, `SHOULD`, `MAY`);
  see [foundations.md](foundations.md). Examples are illustrative unless stated
  otherwise.
- Commits follow Conventional Commits with the `(all)` scope, lowercase summaries,
  e.g. `feat(all): added support for logical deletion`. Reference GitHub issues
  with `Closes #NN` in the body when a commit resolves one.
- Spec work is tracked in GitHub issues; check existing issues before filing new
  ones, and cross-reference related issues.
