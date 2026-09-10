---
specification_version: "0.1.0"
view: "embedded"
description: "A saved view."
presentation: {"layout":"list","fields":[{"column":"path"},{"column":"status"}]}
query: {"specification_version":"0.1.0","note_types":["note"],"select":[{"kind":"path","as":"path"},{"kind":"field","field":"status","as":"status"}],"where":{"kind":"field","field":"status","operator":"equals","value":"open"}}
---
