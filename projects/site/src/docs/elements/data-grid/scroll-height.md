---
{
  title: 'Data Grid Scroll Height',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

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

## Scroll Height

{% story 'nve-grid', 'Scroll' %}

## Full Height

{% story 'nve-grid', 'FullHeight' %}

## Scroll Position

```javascript
document.querySelector('nve-grid').scrollTo({ top: 0, left: 0, behavior: 'smooth' });
```

{% story 'nve-grid', 'ScrollPosition' %}
