# Shape-valid extension examples

The `example:*` contracts below are illustrative test assumptions, not registered
TypedMark extensions. The fixture command checks artifact and report shapes; it
does not load contracts or execute a semantic validator.

## Illustrative capability matrix

Assume the tool interprets Core `0.1.0` and exactly `example:review` at `1.2.0`.
Except for the dependency-error row, assume that contract has no dependencies
and all other collection content conforms.

| Collection configuration | Evaluation scenario | Report fixture |
| --- | --- | --- |
| `typedmark-extensions.md` | Required exact version supported and evaluated | `validation-report-supported-extension.json` |
| `typedmark-extension-unknown-version.md` | Required `9.0.0` unsupported; diagnostic downgraded to warning | `validation-report-unsupported-extension.json` |
| `typedmark-extension-unknown-version.md` | Same unsupported requirement, with severity explicitly configured to `off` | `validation-report-unsupported-extension-suppressed.json` |
| `typedmark-extensions.md` | Deliberately limited Core-only evaluation | `validation-report-extension-core-only.json` |
| `typedmark-extensions.md` | Alternate known contract requires an omitted dependency; interpretation finds the declaration invalid | `validation-report-invalid-extension-declaration.json` |

For the unknown-version warning row, assume `unsupported_extension: warn`; for
the suppressed row, assume `off`. Severity does not establish capability.
Complete evaluation includes interpreted contracts that produce errors.
Incomplete evaluation never establishes full conformance, even with no results.

`typedmark-extension-prerelease.md` demonstrates full SemVer strings including
prerelease/build suffixes; `typedmark-extensions-empty.md` demonstrates `{}`.
The seven `*-vendor-metadata.md` artifacts demonstrate the permitted carrier
positions. These files are standalone shape examples, not complete collections.
