---
{
  title: 'Data Grid Column Width',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

{% api 'nve-grid-column', 'property', 'width' %}

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="200px">Column 1</nve-grid-column>
    <nve-grid-column width="200px">Column 2</nve-grid-column>
    <nve-grid-column width="200px">Column 3</nve-grid-column>
    <nve-grid-column width="200px">Column 4</nve-grid-column>
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

## Column Width

{% story 'nve-grid', 'ColumnWidth' %}

## Content

By default columns are evenly devided unless width is explicitly provided. Content within a cell of a given column will wrap content to fit the width of the column.

{% story 'nve-grid', 'Content' %}
