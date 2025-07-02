---
{
  title: 'Data Grid Row Groups',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" aria-label="expand groups" position="fixed"></nve-grid-column>
    <nve-grid-column>Column 1</nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
    <nve-grid-column>Column 4</nve-grid-column>
  </nve-grid-header>
  ...
    <nve-grid-row>
      <nve-grid-cell>
        <nve-icon-button icon-name="caret" container="flat" direction="right" aria-label="view session 2yuecae SSD uploads"></nve-icon-button>
      </nve-grid-cell>
      <nve-grid-cell>Session: 2yuecae</nve-grid-cell>
      <nve-grid-cell>upload</nve-grid-cell>
      <nve-grid-cell>pending</nve-grid-cell>
      <nve-grid-cell>p3</nve-grid-cell>
      <nve-grid-cell>12/04/22</nve-grid-cell>
    </nve-grid-row>
  ...
</nve-grid>
```

{% story 'nve-grid', 'RowGroups' %}
