---
{
  title: 'Data Grid',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

## Installation

```typescript
import '@nvidia-elements/core/grid/define.js';
```

```html
<nve-grid>
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

{% story 'nve-grid', 'Default' %}
