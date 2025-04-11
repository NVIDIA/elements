---
{
  title: 'Data Grid Panel Detail',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Use a right aligned [panel](./?path=/docs/elements-page-documentation--docs) when displaying advanced filtering or display settings for the grid. Item detail panels should be open using a action button placed at the end of the grid row.

```html
<nve-page>
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column>Column 1</nve-grid-column>
      <nve-grid-column>Column 2</nve-grid-column>
      <nve-grid-column>Column 3</nve-grid-column>
      <nve-grid-column width="max-content" aria-label="details"></nve-grid-column>
    </nve-grid-header>
    <nve-grid-row>
      <nve-grid-cell>Cell 1-1</nve-grid-cell>
      <nve-grid-cell>Cell 1-2</nve-grid-cell>
      <nve-grid-cell>Cell 1-3</nve-grid-cell>
      <nve-grid-cell>
        <nve-icon-button container="flat" icon-name="additional-actions" aria-label="view item 1"></nve-icon-button>
      </nve-grid-cell>
    </nve-grid-row>
  </nve-grid>
  <nve-page-panel slot="right" size="sm" expanded closable>
    ...
  </nve-page-panel>
</nve-page>
```

{% story 'nve-grid', 'PanelDetail' %}
