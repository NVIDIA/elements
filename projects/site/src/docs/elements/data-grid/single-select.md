---
{
  title: 'Data Grid Single Select',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" aria-label="single selection"></nve-grid-column>
    <nve-grid-column>Column</nve-grid-column>
    ...
  </nve-grid-header>
  <nve-grid-row selected>
    <nve-grid-cell>
      <nve-radio>
        <input type="radio" name="single-select" checked aria-label="select row 1">
      </nve-radio>
    </nve-grid-cell>
    <nve-grid-cell>Cell</nve-grid-cell>
    ...
  </nve-grid-row>
  ...
</nve-grid>
```

{% story 'nve-grid', 'SingleSelect' %}
