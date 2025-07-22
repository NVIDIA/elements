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

{% story 'nve-grid', 'Card' %}

## Card Tabs

{% story 'nve-grid', 'CardTabs' %}
