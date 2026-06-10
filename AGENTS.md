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

- `*.md` at the root — the specification pages (Jekyll site)
- `schema/json-schema/` — machine-readable JSON Schemas for the governed artifacts
- `schema/fixtures/` — valid / invalid-shape / invalid-semantic fixtures
- `schema/docs/schema-boundary.md` — what the schemas enforce vs. the semantic layer

## Hard rule: schemas stay aligned with the specification

The prose specification is the single source of truth. The JSON Schemas under
`schema/json-schema/` mirror it and MUST never drift:

- **Any change to a governed artifact's shape in the prose (new key, removed key,
  changed enum, changed constraint) MUST update the JSON Schemas and the fixtures
  in the same commit.**
- After any schema or fixture change, run `python3 schema/validate_fixtures.py`
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
