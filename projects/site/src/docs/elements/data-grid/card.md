---
{
  title: 'Data Grid Card',
  description: 'Render rows as cards in NVIDIA Elements Data Grid: switch to a card-style layout for dense or visual data.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<nve-card>
  <nve-card-header>
    <div nve-layout="column gap:xs">
      <h2 nve-text="heading sm bold">Header</h2>
      <h3 nve-text="body sm muted">Sub Header</h3>
    </div>
  </nve-card-header>
  <nve-grid container="flat">
    ...
  </nve-grid>
</nve-card>
```

## Card

{% example '@nvidia-elements/core/grid/grid.examples.json' 'Card' %}

## Card Tabs

{% example '@nvidia-elements/core/grid/grid.examples.json' 'CardTabs' %}
