---
{
  title: 'Data Grid Pagination',
  description: 'Paginate NVIDIA Elements Data Grid: server-driven and client-side paging with page-size controls.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

```html
<nve-grid>
  ...

  <nve-grid-footer>
    <nve-pagination value="1" items="100" step="10"></nve-pagination>
  </nve-grid-footer>
</nve-grid>
```

{% example '@nvidia-elements/core/grid/grid.examples.json' 'Pagination' %}
