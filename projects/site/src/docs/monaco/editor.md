---
{
  title: 'Monaco Editor',
  layout: 'docs.11ty.js',
  tag: 'nve-monaco-editor',
  hideExamplesTab: true
}
---

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-layout="column pad:xs gap:xs" nve-text="relaxed">
      <div><code>nve-monaco-editor</code> is only intended for advanced use cases. Elements provides no API stability guarantees for the direct access to the <a href="https://microsoft.github.io/monaco-editor/docs.html">Monaco Editor API</a> provided here, as it is subject to change at the pace of this third-party dependency.</div>
      <div>We recommend starting with <a href="docs/monaco/input/"><code>nve-monaco-input</code></a> for most users.</div>
    </div>
  </nve-alert>
</nve-alert-group>

## Installation

{% install 'nve-monaco-editor' %}

## Default

{% story '@nvidia-elements/monaco/editor/editor.stories.json', 'Default', '{ "resizable": false, "inline": true }' %}
