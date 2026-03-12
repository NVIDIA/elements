---
{
  title: 'Data Grid Multi Select',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content">
      <nve-checkbox>
        <input type="checkbox" aria-label="select all rows">
      </nve-checkbox>
    </nve-grid-column>
    <nve-grid-column>Column</nve-grid-column>
  </nve-grid-header>
  ...
  <nve-grid-row selected>
    <nve-grid-cell>
      <nve-checkbox>
        <input type="checkbox" checked aria-label="select row 1">
      </nve-checkbox>
    </nve-grid-cell>
    <nve-grid-cell>Cell</nve-grid-cell>
    ...
  </nve-grid-row>
  ...
</nve-grid>
```

## Multi Select

{% example '@nvidia-elements/core/grid/grid.examples.json' 'MultiSelect' %}

## Multi Select Bulk Actions

{% example '@nvidia-elements/core/grid/grid.examples.json' 'BulkActions' %}
