---
{
  title: 'Data Grid Column Fixed',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

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

{% api 'nve-grid-column', 'property', 'position' %}

{% example '@nvidia-elements/core/grid/grid.examples.json' 'ColumnFixed' %}

## Column Multi Fixed

{% example '@nvidia-elements/core/grid/grid.examples.json' 'ColumnMultiFixed' %}

## Column Stack Fixed

{% example '@nvidia-elements/core/grid/grid.examples.json' 'ColumnStackFixed' %}

<!-- TODO ## Column Dynamic Fixed

{% example '@nvidia-elements/core/grid/grid.examples.json' 'ColumnDynamicFixed' %} -->
