---
{
  title: 'Data Grid Display Settings',
  description: 'User-controlled display settings in NVIDIA Elements Data Grid: column visibility, density, and saved presets.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<div nve-layout="column gap:md full">
  <nve-dropdown closable id="column-settings-dropdown">
    settings...
  </nve-dropdown>
  <div nve-layout="row gap:sm align:vertical-center">
    <p nve-text="body muted">1,145 results found</p>
    <nve-button popovertarget="column-settings-dropdown">
      Display Settings
    </nve-button>
  </div>
  <nve-grid>...</nve-grid>
</div>
```

{% example '@nvidia-elements/core/grid/grid.examples.json' 'DisplaySettings' %}
