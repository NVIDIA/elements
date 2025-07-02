---
{
  title: 'Data Grid Display Settings',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

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
