---
{
  title: 'Data Grid Panel Grid',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

Panel Grid can be used to display key value type data sets for details of a given item in a collection.

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
