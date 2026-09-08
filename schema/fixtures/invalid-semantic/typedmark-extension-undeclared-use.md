---
specification_version: 0.1.0
name: extension-example
description: Extension-owned collection content is used without a declaration.
---

External test setup: assume this collection also contains a review-queue
artifact at `.typedmark/reviews/queue.md`, a position owned by the known
illustrative `example:review` contract at `1.2.0`. That artifact is outside
the Core artifact schemas and is not included in this standalone fixture.
Its use requires the extension declaration under EXT-16, which is absent here.
This context does not assign executable or structural meaning to any `x_*` value.
