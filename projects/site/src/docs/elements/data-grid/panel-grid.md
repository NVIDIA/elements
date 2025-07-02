---
{
  title: 'Data Grid Panel Grid',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<main nve-layout="row gap:sm full">
  <section nve-layout="column gap:md full align:stretch">
    page content
  </section>
  <nve-panel expanded>
    <nve-grid container="flat" stripe>
      ...
    </nve-grid>
  </nve-panel>
</main>
```

{% story 'nve-grid', 'PanelGrid' %}
