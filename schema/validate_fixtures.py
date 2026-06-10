#!/usr/bin/env python3
"""Validate the TypedMark fixture files against the JSON Schemas.

Fixtures are governed artifacts: Markdown files whose YAML frontmatter is the
governed content. The frontmatter is extracted per the Frontmatter Block Grammar
and validated against the matching artifact schema; the body is ignored.

Expectations:
- every fixture under fixtures/valid/ passes its artifact schema
- every fixture under fixtures/invalid-shape/ fails its artifact schema
- every fixture under fixtures/invalid-semantic/ passes its artifact schema
  (they are invalid only under the semantic layer described in docs/schema-boundary.md)

Requires: python3, pyyaml, jsonschema >= 4.18.

Usage: python3 schema/validate_fixtures.py
"""

import json
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).parent
SCHEMA_DIR = ROOT / "json-schema"
FIXTURE_DIR = ROOT / "fixtures"

ARTIFACT_SCHEMAS = {
    "typedmark": "typedmark.schema.json",
    "note-type": "note-type.schema.json",
    "property-set": "property-set.schema.json",
    "history": "history.schema.json",
}


def build_registry():
    registry = Registry()
    for path in SCHEMA_DIR.glob("*.schema.json"):
        schema = json.loads(path.read_text(encoding="utf-8"))
        resource = Resource.from_contents(schema)
        registry = registry.with_resource(schema["$id"], resource)
    return registry


def schema_for(fixture: Path):
    for prefix, schema_name in ARTIFACT_SCHEMAS.items():
        if fixture.name.startswith(prefix):
            return json.loads((SCHEMA_DIR / schema_name).read_text(encoding="utf-8"))
    raise SystemExit(f"cannot map fixture {fixture} to an artifact schema")


def extract_frontmatter(text: str):
    lines = text.splitlines()
    if not lines or lines[0].lstrip("﻿") != "---":
        raise SystemExit("fixture has no frontmatter block")
    for index, line in enumerate(lines[1:], start=1):
        if line in ("---", "..."):
            return yaml.safe_load("\n".join(lines[1:index]))
    raise SystemExit("fixture frontmatter block is not closed")


def main() -> int:
    registry = build_registry()
    failures = []
    checked = 0

    for bucket, must_pass in (("valid", True), ("invalid-shape", False), ("invalid-semantic", True)):
        for fixture in sorted((FIXTURE_DIR / bucket).glob("*.md")):
            if fixture.name == "README.md":
                continue
            checked += 1
            document = extract_frontmatter(fixture.read_text(encoding="utf-8"))
            validator = Draft202012Validator(schema_for(fixture), registry=registry)
            errors = sorted(validator.iter_errors(document), key=lambda e: e.json_path)
            passed = not errors
            if passed != must_pass:
                expectation = "pass" if must_pass else "fail"
                failures.append(f"{bucket}/{fixture.name}: expected to {expectation} shape validation")
                for error in errors[:3]:
                    failures.append(f"  {error.json_path}: {error.message}")
            else:
                print(f"ok {bucket}/{fixture.name}")

    if failures:
        print()
        print("\n".join(failures))
        print(f"\nexpectations violated across {checked} fixtures")
        return 1
    print(f"\nall {checked} fixtures behaved as expected")
    return 0


if __name__ == "__main__":
    sys.exit(main())
