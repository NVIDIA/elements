---
{
  title: 'Data Grid Multi Select',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Multi Select rows use a checkbox as the first focusable item within the row When selected set the `selected` attribute/property on the row. This will ensure selected styles as well as the proper `ariaSelected` state for accessibility.

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

{% story 'nve-grid', 'MultiSelect' %}

## Multi Select Bulk Actions

When a user has actions that can be applied to multiple items, use the bulk actions component. The bulk actions should only be visible when at least one or more rows are selected. If the bulk actions are closed then all selected rows should be deselected.

{% story 'nve-grid', 'MultiSelectBulkActions' %}
