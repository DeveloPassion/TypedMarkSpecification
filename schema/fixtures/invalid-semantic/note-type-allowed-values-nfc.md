---
specification_version: 0.1.0
description: String normalization remains semantic.
abstract: true
frontmatter:
  choice:
    type: text
    allowed_values: ["é", "e\u0301"]
---

Shape-valid, but invalid under FDR-197 and FDR-240: the values are equal after NFC.
