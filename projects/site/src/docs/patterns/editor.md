---
{
  title: 'Editor Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Code editor layouts using the [Monaco Input](./docs/monaco/input/) component
with [Page](./docs/elements/page/) layouts for building IDE-style interfaces
in AV and Robotics applications.

## File Browser

{% example '@internals/patterns/editor.examples.json', 'EditorFileBrowser', '{ "inline": false, "height": "700px" }' %}

## Diff View

{% example '@internals/patterns/editor.examples.json', 'EditorDiffView', '{ "inline": false, "height": "650px" }' %}

## Read-Only Viewer

{% example '@internals/patterns/editor.examples.json', 'EditorReadOnly', '{ "inline": false, "height": "650px" }' %}
