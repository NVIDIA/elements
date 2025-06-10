---
{
  title: 'Data Grid Display Settings',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

Display settings are placed above the data grid leveraging dropdowns to provide various configuration options. Columns can be hidden via the `hidden` attribute or conditionaly rendered in DOM. Display settings can include column visibility or advanced filtering options.

```html
<section nve-layout="row gap:md align:stretch">
  <nve-panel expanded closable>
    ...
  </nve-panel>

  <div nve-layout="column gap:md">
    <nve-button>display settings</nve-button>
    <nve-grid>
      ...
    </nve-grid>
  </div>
</section>
```

{% story 'nve-grid', 'DisplaySettings' %}
