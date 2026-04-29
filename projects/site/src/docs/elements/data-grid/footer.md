---
{
  title: 'Data Grid Footer',
  description: 'Add a footer to NVIDIA Elements Data Grid: summary rows, totals, and pagination controls.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Column 1</nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
    <nve-grid-column>Column 4</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Cell 1-1</nve-grid-cell>
    <nve-grid-cell>Cell 1-2</nve-grid-cell>
    <nve-grid-cell>Cell 1-3</nve-grid-cell>
    <nve-grid-cell>Cell 1-4</nve-grid-cell>
  </nve-grid-row>
  ...
  <nve-grid-footer>footer content</nve-grid-footer>
</nve-grid>
```

## Footer

{% api 'nve-grid-footer', 'description' %}

{% example '@nvidia-elements/core/grid/grid.examples.json' 'Footer' %}
