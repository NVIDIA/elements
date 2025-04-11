---
{
  title: 'Data Grid Pagination',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

The pagination pattern should be used when working with large data sets that need to be incrementally loaded or filtered for performance or usablity.

```html
<nve-grid>
  ...

  <nve-grid-footer>
    <nve-pagination value="1" items="100" step="10"></nve-pagination>
  </nve-grid-footer>
</nve-grid>
```

## Pagination

{% story 'nve-grid', 'Pagination' %}
