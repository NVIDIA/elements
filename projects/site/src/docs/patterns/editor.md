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

{% example '@internals/patterns/editor.examples.json', 'FileBrowser', '{ "inline": false, "height": "700px" }' %}

## Diff View

{% example '@internals/patterns/editor.examples.json', 'DiffView', '{ "inline": false, "height": "650px" }' %}

## Read-Only Viewer

{% example '@internals/patterns/editor.examples.json', 'ReadOnly', '{ "inline": false, "height": "650px" }' %}
