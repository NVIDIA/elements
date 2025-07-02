---
{
  title: 'Data Grid Card',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<nve-card>
  <nve-card-header>
    <div slot="title">Data Grid</div>
    <div slot="subtitle">Card Example</div>
    <nve-icon-button slot="header-action" icon-name="filter-stroke"></nve-icon-button>
  </nve-card-header>
  <nve-grid container="flat">
    ...
  </nve-grid>
</nve-card>
```

## Card

{% story 'nve-grid', 'Card' %}

## Card Tabs

{% story 'nve-grid', 'CardTabs' %}
