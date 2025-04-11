---
{
  title: 'Data Grid Single Select',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Single selection enables users to use a radio list association to select one item at a time. To enable single select, place a `nve-radio` input as the first grid cell of each row. Set the `name` attribute on each radio to ensure they associate to the same radio group.

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" aria-label="single selection"></nve-grid-column>
    <nve-grid-column>Column</nve-grid-column>
    ...
  </nve-grid-header>
  <nve-grid-row selected>
    <nve-grid-cell>
      <nve-radio>
        <input type="radio" name="single-select" checked aria-label="select row 1">
      </nve-radio>
    </nve-grid-cell>
    <nve-grid-cell>Cell</nve-grid-cell>
    ...
  </nve-grid-row>
  ...
</nve-grid>
```

## Single Select

{% story 'nve-grid', 'SingleSelect' %}
