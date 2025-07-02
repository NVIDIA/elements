---
{
  title: 'Data Grid Column Alignment',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column column-align="left">Column 1</nve-grid-column>
    <nve-grid-column column-align="right">Column 2</nve-grid-column>
    <nve-grid-column column-align="center">Column 3</nve-grid-column>
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

{% api 'nve-grid-column', 'property', 'columnAlign' %}

## Column Align Center

{% story 'nve-grid', 'ColumnAlignCenter' %}

## Column Align End

{% story 'nve-grid', 'ColumnAlignEnd' %}

## Column Align Start

{% story 'nve-grid', 'ColumnAlignStart' %}
