---
{
  title: 'Data Grid Column Fixed',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

Columns positioned to a fixed location within the grid preventing the column from scrolling when the grid has horizontal scroll. Use the `position="fixed"` attribute to position the column.

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column position="fixed">Column 1</nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
    <nve-grid-column>Column 4</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>cell 1-1</nve-grid-cell>
    <nve-grid-cell>cell 1-2</nve-grid-cell>
    <nve-grid-cell>cell 1-3</nve-grid-cell>
    <nve-grid-cell>cell 1-4</nve-grid-cell>
  </nve-grid-row>
  ...
</nve-grid>
```

## Column Fixed

{% story 'nve-grid', 'ColumnFixed' %}

## Column Multi Fixed

Multiple Columns can fixed to any given side, however fixed columns should not span past the half way point of the grid.

{% story 'nve-grid', 'ColumnMultiFixed' %}

## Column Stack Fixed

{% story 'nve-grid', 'ColumnStackFixed' %}

<!-- TODO ## Column Dynamic Fixed

{% story 'nve-grid', 'ColumnDynamicFixed' %} -->
