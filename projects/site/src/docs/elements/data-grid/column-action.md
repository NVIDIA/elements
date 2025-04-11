---
{
  title: 'Data Grid Column Action',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Column actions can be created by using the `nve-icon-button` to trigger dropdowns or panels to reveal additional actions to the user.

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>
      Column 1 <nve-icon-button slot="actions"></nve-icon-button>
    </nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
    <nve-grid-column>Column 4</nve-grid-column>
  </nve-grid-header>
    <nve-grid-row>
      ...
    </nve-grid-row>
  ...
</nve-grid>
```

## Column Action

{% story 'nve-grid', 'ColumnAction' %}
