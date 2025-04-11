---
{
  title: 'Data Grid Scroll Height',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

A fixed height can be placed on the grid allowing rows to be scrolled within the bounding box of the grid.

```html
<nve-grid style="height: 400px">
  <nve-grid-header>
    <nve-grid-column>column 1</nve-grid-column>
    <nve-grid-column>column 2</nve-grid-column>
    <nve-grid-column>column 3</nve-grid-column>
    <nve-grid-column>column 4</nve-grid-column>
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

{% story 'nve-grid', 'Scroll' %}

## Full Height

Using `nve-layout="column"` and `nve-layout="full"` enables the grid to fill any remaining space of a parent containing element. This is helpful for preserving the grid height/fill while dynamic content above can freely change.

{% story 'nve-grid', 'FullHeight' %}

## Scroll Position

Scroll position can be controlled via the `scrollTo` API.

```javascript
document.querySelector('nve-grid').scrollTo({ top: 0, left: 0, behavior: 'smooth' });
```

{% story 'nve-grid', 'ScrollPosition' %}
