---
{
  title: 'Data Grid Row Sort',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid', 'nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

Sort can be set via the `sort` property and `sort` event on the `nve-sort-button`. The grid sort API follows the [ARIA sort spec](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) and automatically will set the appropriate accessibility related attributes to convey the current sorting state.

```html
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>
      Column 1 <nve-sort-button sort="none"></nve-sort-button>
    </nve-grid-column>
    <nve-grid-column>Column 2</nve-grid-column>
    <nve-grid-column>Column 3</nve-grid-column>
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

<!-- TODO <Canvas of={RowSortInteractive} /> -->

## Column Sort Button Visibility

{% story 'nve-grid', 'ColumnSortButtonVisibility' %}

{% svg-logos 'lit' %}

## Lit <svg width="20" height="20"><use href="#lit-svg"></use></svg>

```typescript
class RowSortDemo extends LitElement {
  @state() sort: 'none' | 'ascending' | 'descending' = 'none';

  get items() {
    // application sort logic
  }

  render() {
    return html`
      <nve-grid>
        <nve-grid-header>
        ${Object.entries(this.items[0]).map(([, column], i) => html`
          <nve-grid-column>
            ${column.label} ${i === 0 ? html`<nve-sort-button .sort=${this.sort} @sort=${e => this.sort = e.detail.next}></nve-sort-button>` : html``}
          </nve-grid-column>`)}
        </nve-grid-header>
        ${this.items.map(row => html`
        <nve-grid-row>
          ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
        </nve-grid-row>`)}
      </nve-grid>
    `
  }
}
```
