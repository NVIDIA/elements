---
{
  title: 'Data Grid Panel Grid',
  description: 'Embed a Data Grid inside a panel layout: inspector views, edit-in-place flows, and split-pane patterns.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
  </nve-page-header>
  <nve-page-panel slot="right" expanded closable>
    <nve-page-panel-header>
      <h3 nve-text="heading medium sm">Recording</h3>
    </nve-page-panel-header>
    <nve-grid container="flat" stripe>
      <nve-grid-header>
        <nve-grid-column style="height: 0; overflow: hidden;">Key</nve-grid-column>
        <nve-grid-column style="height: 0; overflow: hidden;">Value</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row>
        <nve-grid-cell><p nve-text="label muted">Session ID</p></nve-grid-cell>
        <nve-grid-cell><p nve-text="label">123456</p></nve-grid-cell>
      </nve-grid-row>
    </nve-grid>
  </nve-page-panel>
</nve-page>
```

{% example '@nvidia-elements/core/grid/grid.examples.json' 'PanelGrid' %}
