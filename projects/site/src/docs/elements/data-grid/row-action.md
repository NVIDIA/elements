---
{
  title: 'Data Grid Row Action',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Row actions enable addtional user actions specific to a given row. Place a `nve-icon-button` at the end of the grid row for actions.

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Column 1</nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
    <nve-grid-column width="max-content" position="fixed" aria-label="additonal actions"></nve-grid-column>
  </nve-grid-header>
  ...
  <nve-grid-row>
    <nve-grid-cell>Cell 1-1</nve-grid-cell>
    <nve-grid-cell>Cell 1-2</nve-grid-cell>
    <nve-grid-cell>Cell 1-3</nve-grid-cell>
    <nve-grid-cell>
      <nve-icon-button container="flat" icon-name="additional-actions" aria-label="row 1 actions"></nve-icon-button>
    </nve-grid-cell>
  </nve-grid-row>
  ...
</nve-grid>
```

## Action

{% story 'nve-grid', 'RowAction' %}
