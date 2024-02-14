import { LitElement, unsafeCSS, html, css, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { getItems, grid } from '@elements/elements/test';
import layout from '@elements/elements/css/module.layout.css?inline';
import '@elements/elements/grid/define.js';
import '@elements/elements/badge/define.js'
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/tabs/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/pagination/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/radio/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/sort-button/define.js';
import '@lit-labs/virtualizer';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'mlv-grid',
};

export const Default = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const MultiSelect = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    <mlv-grid-column width="max-content" position="fixed">
      <mlv-checkbox>
        <input type="checkbox" aria-label="select all rows" />
      </mlv-checkbox>
    </mlv-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map((row, i) => html`
    <mlv-grid-row>
      <mlv-grid-cell>
        <mlv-checkbox>
          <input type="checkbox" ?checked=${i === 1} aria-label="select row ${i}" />
        </mlv-checkbox>
      </mlv-grid-cell>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const MultiSelectBulkActions = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px">
  <mlv-grid-header>
    <mlv-grid-column width="max-content" position="fixed">
      <mlv-checkbox>
        <input type="checkbox" aria-label="select all rows" />
      </mlv-checkbox>
    </mlv-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(20).map((row, i) => html`
    <mlv-grid-row .selected=${i === 1}>
      <mlv-grid-cell>
        <mlv-checkbox>
          <input type="checkbox" ?checked=${i === 1} aria-label="select row ${i}" />
        </mlv-checkbox>
      </mlv-grid-cell>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <mlv-toolbar status="accent" slot="footer">
    <mlv-icon-button interaction="flat" icon-name="cancel" slot="prefix"></mlv-icon-button>
    <p mlv-text="boxy">1 selected</p>
    <mlv-button interaction="flat-destructive" slot="suffix">delete</mlv-button>
    <mlv-icon-button interaction="flat" icon-name="more-actions" slot="suffix"></mlv-icon-button>
  </mlv-toolbar>
</mlv-grid>
  `
};

export const SingleSelect = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    <mlv-grid-column width="max-content" position="fixed"></mlv-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map((row, i) => html`
    <mlv-grid-row>
      <mlv-grid-cell>
        <mlv-radio>
          <input type="radio" ?checked=${i === 1} name="single-select" .value=${i} aria-label="select row ${i}" />
        </mlv-radio>
      </mlv-grid-cell>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const RowAction = {
  render: () => html`
<div>
  <mlv-grid>
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
      <mlv-grid-column width="max-content" aria-label="additonal actions" position="fixed"></mlv-grid-column>
    </mlv-grid-header>
    ${getItems().map((row, i) => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
        <mlv-grid-cell>
          <mlv-icon-button interaction="flat" icon-name="more-actions" aria-label="row ${i} actions"></mlv-icon-button>
        </mlv-grid-cell>
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const RowGroups = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    <mlv-grid-column width="max-content" aria-label="expand groups" position="fixed"></mlv-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  <mlv-grid-row>
    <mlv-grid-cell>
      <mlv-icon-button icon-name="chevron" interaction="flat" direction="right" aria-label="view session 2yuecae SSD uploads"></mlv-icon-button>
    </mlv-grid-cell>
    <mlv-grid-cell>Session: 2yuecae</mlv-grid-cell>
    <mlv-grid-cell>upload</mlv-grid-cell>
    <mlv-grid-cell>pending</mlv-grid-cell>
    <mlv-grid-cell>p3</mlv-grid-cell>
    <mlv-grid-cell>12/04/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row selected>
    <mlv-grid-cell>
      <mlv-icon-button icon-name="chevron" interaction="flat" direction="down" aria-label="view session mvwgh3t SSD uploads"></mlv-icon-button>
    </mlv-grid-cell>
    <mlv-grid-cell>Session: mvwgh3t</mlv-grid-cell>
    <mlv-grid-cell>upload</mlv-grid-cell>
    <mlv-grid-cell>pending</mlv-grid-cell>
    <mlv-grid-cell>p0</mlv-grid-cell>
    <mlv-grid-cell>12/11/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row>
    <mlv-grid-cell></mlv-grid-cell>
    <mlv-grid-cell>SSD: mvwgh3t</mlv-grid-cell>
    <mlv-grid-cell>validating</mlv-grid-cell>
    <mlv-grid-cell>pending</mlv-grid-cell>
    <mlv-grid-cell>p0</mlv-grid-cell>
    <mlv-grid-cell>12/11/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row>
    <mlv-grid-cell></mlv-grid-cell>
    <mlv-grid-cell>SSD: qudbd8x</mlv-grid-cell>
    <mlv-grid-cell>uploading</mlv-grid-cell>
    <mlv-grid-cell>finished</mlv-grid-cell>
    <mlv-grid-cell>p0</mlv-grid-cell>
    <mlv-grid-cell>12/11/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row>
    <mlv-grid-cell></mlv-grid-cell>
    <mlv-grid-cell>SSD: j8hvikt</mlv-grid-cell>
    <mlv-grid-cell>queuing</mlv-grid-cell>
    <mlv-grid-cell>running</mlv-grid-cell>
    <mlv-grid-cell>p0</mlv-grid-cell>
    <mlv-grid-cell>12/11/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row>
    <mlv-grid-cell>
      <mlv-icon-button icon-name="chevron" interaction="flat" direction="right" aria-label="view session bg5ujqp SSD uploads"></mlv-icon-button>
    </mlv-grid-cell>
    <mlv-grid-cell>Session: bg5ujqp</mlv-grid-cell>
    <mlv-grid-cell>upload</mlv-grid-cell>
    <mlv-grid-cell>pending</mlv-grid-cell>
    <mlv-grid-cell>p1</mlv-grid-cell>
    <mlv-grid-cell>12/12/22</mlv-grid-cell>
  </mlv-grid-row>
  <mlv-grid-row>
    <mlv-grid-cell>
      <mlv-icon-button icon-name="chevron" interaction="flat" direction="right" aria-label="view session 6ruehvh SSD uploads"></mlv-icon-button>
    </mlv-grid-cell>
    <mlv-grid-cell>Session: 6ruehvh</mlv-grid-cell>
    <mlv-grid-cell>upload</mlv-grid-cell>
    <mlv-grid-cell>pending</mlv-grid-cell>
    <mlv-grid-cell>p2</mlv-grid-cell>
    <mlv-grid-cell>12/09/22</mlv-grid-cell>
  </mlv-grid-row>
</mlv-grid>
`
};

export const Footer = {
render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(8).map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <mlv-grid-footer>
    <p mlv-text="body">footer content</p>
  </mlv-grid-footer>
</mlv-grid>
  `
};

export const FooterScrollbar = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(14).map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <mlv-grid-footer>
    <p mlv-text="body">footer content</p>
  </mlv-grid-footer>
</mlv-grid>
  `
};

export const Pagination = {
  render: () => html`
<mlv-grid style="--scroll-height: 370px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <mlv-grid-footer>
    <mlv-pagination value="1" items="100" step="10"></mlv-pagination>
  </mlv-grid-footer>
</mlv-grid>
  `
};

export const Scroll = {
  render: () => html`
<mlv-grid style="height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(100).map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ScrollPosition = {
  render: () => html`
<mlv-grid style="height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(100).map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid><br>

<mlv-button>scroll top</mlv-button>
<script type="module">
  document.querySelector('mlv-button').addEventListener('click', () => {
    document.querySelector('mlv-grid').scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>
  `
};

export const FullHeight = {
  render: () => html`
<section mlv-layout="column gap:lg" style="height: 500px; padding: var(--mlv-ref-size-100); border: 1px solid var(--mlv-ref-border-color-emphasis); resize: vertical; overflow: hidden;">
  <mlv-search>
    <input type="search" aria-label="search" placeholder="search" />
  </mlv-search>
  <mlv-grid mlv-layout="full">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems(100).map(row => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
      </mlv-grid-row>
    `)}
  </mlv-grid>
</section>
  `
};

export const ColumnAction = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column], i) => html`
      <mlv-grid-column>
        ${column.label} <mlv-icon-button id="column-${i}-btn" slot="actions"></mlv-icon-button>
      </mlv-grid-column>`)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
<mlv-dropdown anchor="column-0-btn" arrow>
  <mlv-search rounded>
    <input type="search" placeholder="search column" aria-label="search apps" />
  </mlv-search>
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="gear"></mlv-icon> settings</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="star"></mlv-icon> favorites</mlv-menu-item>
  </mlv-menu>
</mlv-dropdown>
  `
};

export const ColumnWidth = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column width="${i !== 4 ? '300px' : ''}">${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <mlv-grid-footer>footer content</mlv-grid-footer>
</mlv-grid>
  `
};

export const Content = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(10).map((row, ir) => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell], ic) => html`<mlv-grid-cell>${ir === 3 && ic === 2 ? `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores` : cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnFixed = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px; max-width: 800px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column position=${i === 0 ? 'fixed' : ''} width="200px">${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnMultiFixed = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px; max-width: 800px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column position=${(i === 0) || (i === 4) ? 'fixed' : ''} width="200px">${column.label}</mlv-grid-column>`)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnStackFixed = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px; max-width: 800px">
  <mlv-grid-header>
    <mlv-grid-column position="fixed" width="100px">Column 1</mlv-grid-column>
    <mlv-grid-column position="fixed" width="100px">Column 2</mlv-grid-column>
    <mlv-grid-column width="200px">Column 3</mlv-grid-column>
    <mlv-grid-column width="200px">Column 4</mlv-grid-column>
    <mlv-grid-column width="200px">Column 5</mlv-grid-column>
    <mlv-grid-column width="200px">Column 6</mlv-grid-column>
    <mlv-grid-column position="fixed" width="100px">Column 7</mlv-grid-column>
    <mlv-grid-column position="fixed" width="100px">Column 8</mlv-grid-column>
  </mlv-grid-header>
  ${grid(10, 8).rows.map(row => html`
    <mlv-grid-row>
      ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnAlignCenter = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column column-align="center">${column.label}</mlv-grid-column>`)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnAlignEnd = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column column-align="end">${column.label}</mlv-grid-column>`)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const ColumnAlignStart = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column column-align="start">${column.label}</mlv-grid-column>`)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const DisplaySettings = {
  render: () => html`
<div mlv-layout="column gap:md full">
  <mlv-dropdown closable anchor="column-settings">
    <mlv-checkbox-group style="width: 175px">
      <label>Columns</label>
      <mlv-checkbox>
        <label>Column 1</label>
        <input type="checkbox" checked />
      </mlv-checkbox>
      <mlv-checkbox>
        <label>Column 2</label>
        <input type="checkbox" checked />
      </mlv-checkbox>
      <mlv-checkbox>
        <label>Column 3</label>
        <input type="checkbox" checked />
      </mlv-checkbox>
      <mlv-checkbox>
        <label>Column 4</label>
        <input type="checkbox" checked />
      </mlv-checkbox>
    </mlv-checkbox-group>
    <mlv-divider></mlv-divider>
    <mlv-button interaction="flat-destructive" style="--height: initial">restore settings</mlv-button>
  </mlv-dropdown>
  <div mlv-layout="row gap:sm align:vertical-center">
    <p mlv-text="body muted">1,145 results found</p>
    <mlv-button id="column-settings">Display Settings</mlv-button>
  </div>
  <mlv-grid mlv-layout="full">
    <mlv-grid-header>
      ${grid(8, 4).columns.map(column => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${grid(8, 4).rows.map(row => html`
      <mlv-grid-row>
        ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const RowSort = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    <mlv-grid-column>
      None <mlv-sort-button sort="none"></mlv-sort-button>
    </mlv-grid-column>
    <mlv-grid-column>
      Ascending <mlv-sort-button sort="ascending"></mlv-sort-button>
    </mlv-grid-column>
    <mlv-grid-column>
      Descending <mlv-sort-button sort="descending"></mlv-sort-button>
    </mlv-grid-column>
    <mlv-grid-column>Default</mlv-grid-column>
    <mlv-grid-column>Default</mlv-grid-column>
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export function sortStringKeys<T>(list: T[], key: string, sortType: 'none' | 'ascending' | 'descending') {
  if (sortType === 'ascending') {
    return list.sort((a: any, b: any) => a[key].localeCompare(b[key]));
  }

  if (sortType === 'descending') {
    return list.sort((a: any, b: any) => a[key].localeCompare(b[key])).reverse();
  }

  return list;
}

class RowSortDemo extends LitElement {
  @state() private sort: 'none' | 'ascending' | 'descending' = 'none';

  static styles = [unsafeCSS(layout)];

  get items() {
    if (this.sort === 'ascending') {
      return getItems().sort((a: any, b: any) => a.field1.value.localeCompare(b.field1.value));
    }

    if (this.sort === 'descending') {
      return getItems().sort((a: any, b: any) => a.field1.value.localeCompare(b.field1.value)).reverse();
    }

    return getItems();
  }

  render() {
    return html`
      <mlv-grid>
        <mlv-grid-header>
        ${Object.entries(this.items[0]).map(([, column], i) => html`
          <mlv-grid-column>
            ${column.label} ${i === 0 ? html`<mlv-sort-button .sort=${this.sort} @sort=${e => this.sort = e.detail.next}></mlv-sort-button>` : nothing}
          </mlv-grid-column>`)}
        </mlv-grid-header>
        ${this.items.map(row => html`
        <mlv-grid-row>
          ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
        </mlv-grid-row>`)}
      </mlv-grid>
    `
  }
}

customElements.get('row-sort-demo') || customElements.define('row-sort-demo', RowSortDemo);

export const RowSortInteractive = {
  render: () => html`<row-sort-demo></row-sort-demo>`
};

class InfiniteScrollDemo extends LitElement {
  static styles = [unsafeCSS(layout)];

  @state() private rows = this.#group(grid(10000).rows, 100);

  @state() private grid = grid(0, 4)

  render() {
    return html`
      <mlv-grid style="--scroll-height: 400px" @scrollboxend=${() => this.#loadGroup()}>
        <mlv-grid-header>
          ${this.grid.columns.map(column => html`<mlv-grid-column>${column.label}</mlv-grid-column>`)}
        </mlv-grid-header>
        ${this.grid.rows.map(row => html`
        <mlv-grid-row>
          ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
        </mlv-grid-row>`)}
        <mlv-grid-footer>
          <p>Items ${this.grid.rows.length} / 10000</p>
        </mlv-grid-footer>
      </mlv-grid>
    `
  }

  connectedCallback() {
    super.connectedCallback();
    this.#loadGroup();
  }

  #group(items: any[], size: number) {
    return [...Array(Math.ceil(items.length / size))].map((_, i) => items.slice(size * i, size + size * i));
  }

  #loadGroup() {
    const group = this.rows.splice(0, 1)[0];
    if (group) {
      this.grid = { ...this.grid, rows: [...this.grid.rows, ...group] };
    }
  }
}

customElements.get('infinite-scroll-demo') || customElements.define('infinite-scroll-demo', InfiniteScrollDemo);

export const PerformanceInfiniteScroll = {
  render: () => html`<infinite-scroll-demo></infinite-scroll-demo>`
};

class GridPerformanceDemo extends LitElement {
  static styles = [unsafeCSS(layout), css`
  :host {
    display: block;
    height: 500px;
    padding: 24px 0;
  }
  `];

  @state() private show = false;

  @state() private grid = grid(1000);

  render() {
    return html`
      <mlv-button @click=${() => this.show = !this.show}>show large grid</mlv-button>
      <p>1000 rows, 4000 cells</p>
      ${this.show ? html`
      <mlv-grid style="--scroll-height: 400px; max-width: 1024px">
        <mlv-grid-header>
          ${this.grid.columns.map(column => html`<mlv-grid-column width="1fr">${column.label}</mlv-grid-column>`)}
        </mlv-grid-header>
        ${this.grid.rows.map(row => html`
        <mlv-grid-row>
          ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
        </mlv-grid-row>`)}
      </mlv-grid>
      ` : nothing}
    `
  }
  
  connectedCallback() {
    super.connectedCallback();
    window.MLV_ELEMENTS.state.env = 'production';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.MLV_ELEMENTS.state.env = 'watch';
  }
}

customElements.get('grid-performance-demo') || customElements.define('grid-performance-demo', GridPerformanceDemo);

export const Performance = {
  render: () => html`<grid-performance-demo></grid-performance-demo>`
};

class GridVirtualScrollDemo extends LitElement {
  items = new Array(10000).fill('').map((_i, n) => ({ column: `${n}-0`, column1: `${n}-1`, column2: `${n}-2`, column3: `${n}-3` }));

  render() {
    return html`
      <mlv-grid>
        <mlv-grid-header>
          <mlv-grid-column>column</mlv-grid-column>
          <mlv-grid-column>column</mlv-grid-column>
          <mlv-grid-column>column</mlv-grid-column>
          <mlv-grid-column>column</mlv-grid-column>
        </mlv-grid-header>

        <lit-virtualizer style="min-height: 350px" scroller .items=${this.items} .renderItem=${i => html`
          <mlv-grid-row style="width: 100%">
            ${Object.keys(i).map(key => html`<mlv-grid-cell>${i[key]}</mlv-grid-cell>`)}
          </mlv-grid-row>`}>
        </lit-virtualizer>
      </mlv-grid>
    `;
  }
}

customElements.get('grid-virtual-scroll-demo') || customElements.define('grid-virtual-scroll-demo', GridVirtualScrollDemo);

export const PerformanceVirtualScroll = {
  render: () => html`<grid-virtual-scroll-demo></grid-virtual-scroll-demo>`
};

export const Stripe = {
  render: () => html`
<mlv-grid stripe>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const Card = {
  render: () => html`
<mlv-card>
  <mlv-card-header>
    <h2 mlv-text="heading sm bold">Data Grid</h2>
    <h3 mlv-text="body muted">Card Example</h3>
    <mlv-icon-button slot="header-action" icon-name="more-actions"></mlv-icon-button>
  </mlv-card-header>
  <mlv-grid container="flat" style="--scroll-height: 325px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
    `)}
  </mlv-grid>
</mlv-card>
  `
};

export const CardTabs = {
  render: () => html`
<mlv-card>
  <mlv-card-header>
    <h2 mlv-text="heading sm bold">Data Grid</h2>
    <mlv-tabs>
      <mlv-tabs-item selected>tab 1</mlv-tabs-item>
      <mlv-tabs-item>tab 2</mlv-tabs-item>
      <mlv-tabs-item>tab 3</mlv-tabs-item>
    </mlv-tabs>
  </mlv-card-header>
  <mlv-grid container="flat" style="--scroll-height: 325px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
    `)}
  </mlv-grid>
</mlv-card>
  `
};

export const Placeholder = {
  render: () => html`
<mlv-grid style="--scroll-height: 402px">
  <mlv-grid-header>
    <mlv-grid-column></mlv-grid-column>
  </mlv-grid-header>
  <mlv-grid-placeholder>
    Loading...
  </mlv-grid-placeholder>
</mlv-grid>
  `
};

export const Full = {
  render: () => html`
<mlv-grid container="full" style="--scroll-height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(20).map(row => html`
  <mlv-grid-row>
    ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
  </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const Flat = {
  render: () => html`
<mlv-grid container="flat" style="--scroll-height: 402px">
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  ${getItems(20).map(row => html`
  <mlv-grid-row>
    ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
  </mlv-grid-row>
  `)}
</mlv-grid>
  `
};

export const PanelDetail = {
  render: () => html`
<div id="grid-detail-panel" mlv-layout="row gap:md align:stretch">
  <mlv-grid>
    <mlv-grid-header>
      ${grid(10, 3).columns.map(column => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
      <mlv-grid-column width="max-content" aria-label="details"></mlv-grid-column>
    </mlv-grid-header>
    ${grid(10, 3).rows.map((row, i) => html`
      <mlv-grid-row ?selected=${i === 1}>
        ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
        <mlv-grid-cell>
          <mlv-icon-button interaction="flat" icon-name="more-actions" value=${row.id} aria-label="view ${row.id}"></mlv-icon-button>
        </mlv-grid-cell>
      </mlv-grid-row>
    `)}
  </mlv-grid>
  <mlv-panel expanded closable style="min-width: 280px">
    <mlv-panel-header>
      <h2 slot="title">Row 2 Details</h2>
    </mlv-panel-header>
    <mlv-panel-content>
      <div mlv-layout="column gap:md">
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Task</label>
          <p mlv-text="eyebrow sm">Workflow</p>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Status</label>
          <mlv-badge status="success">Complete</mlv-badge>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Priority</label>
          <mlv-badge status="pending">P1</mlv-badge>
        </div>
      </div>
    </mlv-panel-content>
  </mlv-panel>
</div>
  `
};

export const PanelGrid = {
  render() {
    return html`
    <style>
      mlv-panel#panel-grid {
        min-width: 380px;
        z-index: 99;
        height: 100vh;
        position: sticky;
        top: 0;
        right: 0;
      }

      .sb-story mlv-panel#panel-grid {
        height: 700px;
      }

      body {
        padding: 0 !important;
      }
    </style>
    <main mlv-layout="row gap:sm full">
      <section mlv-layout="column gap:md full align:stretch">
        page content
      </section>
      <mlv-panel expanded id="panel-grid">
        <mlv-panel-header>
          <h2 slot="title">Recording</h2>
        </mlv-panel-header>
        <mlv-grid container="flat" stripe style="--scroll-height: 100vh">
          <mlv-grid-header hidden>
            <mlv-grid-column>Key</mlv-grid-column>
            <mlv-grid-column>Value</mlv-grid-column>
          </mlv-grid-header>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Session ID</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">123456</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Record Date</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">2023-09-04 11:00</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Tag</p></mlv-grid-cell>
            <mlv-grid-cell><mlv-tag readonly>Production</mlv-tag></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Route ID</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">9876123</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Configuration</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">prod-0.1.0</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Duration</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">1:23:34</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Description</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">local test run</p></mlv-grid-cell>
          </mlv-grid-row>
          <mlv-grid-row>
            <mlv-grid-cell><p mlv-text="label muted">Number of Sensors</p></mlv-grid-cell>
            <mlv-grid-cell><p mlv-text="label">24</p></mlv-grid-cell>
          </mlv-grid-row>
        </mlv-grid>
      </mlv-panel>
    </main>
    `;
  }
}

class GridPanelDemo extends LitElement {
  @state() private selectedId: string = null;

  #grid = grid(8, 3);

  static styles = [unsafeCSS(layout)];

  render() {
    return html`
      <div mlv-layout="row gap:md align:stretch" style="height: calc(100% - 28px)">
        <mlv-grid>
          <mlv-grid-header>
            ${this.#grid.columns.map(column => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
            <mlv-grid-column width="max-content" aria-label="details"></mlv-grid-column>
          </mlv-grid-header>
          ${this.#grid.rows.map(row => html`
          <mlv-grid-row ?selected=${this.selectedId === row.id}>
            ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
            <mlv-grid-cell>
              <mlv-icon-button @click=${() => this.selectedId = row.id} interaction="flat" icon-name="more-actions"></mlv-icon-button>
            </mlv-grid-cell>
          </mlv-grid-row>`)}
          <mlv-grid-footer>
            <mlv-icon-button aria-label="show grid options" interaction="flat" icon-name="more-actions"></mlv-icon-button>
          </mlv-grid-footer>
        </mlv-grid>
        <mlv-panel closable ?expanded=${!!this.selectedId} @close=${() => this.selectedId = null} style="min-width: 280px">
          <mlv-panel-header>
            <h2 slot="title">Row ${this.selectedId}</h2>
          </mlv-panel-header>
        </mlv-panel>
      </div>
    `
  }
}

customElements.get('grid-panel-demo') || customElements.define('grid-panel-demo', GridPanelDemo);

export const PanelDetailInteractive = {
  render: () => html`<grid-panel-demo></grid-panel-demo>`
};

class GridDynamicColumnDemo extends LitElement {
  @state() private selectedId: string = null;

  @state() private grid = grid(10, 6);

  static styles = [unsafeCSS(layout)];

  render() {
    return html`
      <div mlv-layout="row gap:md align:stretch" style="height: calc(100% - 28px)">
        <mlv-grid>
          <mlv-grid-header>
            ${this.grid.columns.map((column, i) => html`<mlv-grid-column width="200px" position=${(i === this.grid.columns.length - 1) || (i === 0) ? 'fixed' : ''}>${column.label}</mlv-grid-column> `)}
          </mlv-grid-header>
          ${this.grid.rows.map(row => html`
          <mlv-grid-row ?selected=${this.selectedId === row.id}>
            ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
          </mlv-grid-row>`)}
          <mlv-grid-footer>
            <mlv-button interaction="flat" @click=${this.#update}>add column</mlv-button>
          </mlv-grid-footer>
        </mlv-grid>
      </div>
      
    `
  }

  #update() {
    this.grid = grid(10, this.shadowRoot.querySelectorAll('mlv-grid-column').length + 1);
  }
}

customElements.get('grid-dynamic-column-demo') || customElements.define('grid-dynamic-column-demo', GridDynamicColumnDemo);

export const ColumnDynamicFixed = {
  render: () => html`<grid-dynamic-column-demo></grid-dynamic-column-demo>`
};

export const All = {
  render: () => html`
<div mlv-layout="grid gap:lg span-items:4 pad:md">
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Grid</h2>
    ${Default.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Multi Select</h2>
    ${MultiSelect.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Multi Select Bulk Actions</h2>
    ${MultiSelectBulkActions.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Single Select</h2>
    ${SingleSelect.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Card Tabs</h2>
    ${CardTabs.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Panel Detail</h2>
    ${PanelDetail.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Multi Fixed</h2>
    ${ColumnMultiFixed.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Fixed</h2>
    ${ColumnFixed.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Dynamic Fixed</h2>
    ${ColumnDynamicFixed.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Width</h2>
    ${ColumnWidth.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Footer</h2>
    ${Footer.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Scroll</h2>
    ${Scroll.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Align center</h2>
    ${ColumnAlignCenter.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Column Align End</h2>
    ${ColumnAlignEnd.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Row Action</h2>
    ${RowAction.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Row Sort</h2>
    ${RowSort.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Pagination</h2>
    ${Pagination.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Stripe</h2>
    ${Stripe.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Card</h2>
    ${Card.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Placeholder</h2>
    ${Placeholder.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Full</h2>
    ${Full.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Flat</h2>
    ${Flat.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Content Width</h2>
    ${Content.render()}
  </div>
</div>`
}

export const InvalidDOM = {
  render: () => html`
<mlv-grid>
  <mlv-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
  </mlv-grid-header>
  <div>invalid</div>
  ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
    </mlv-grid-row>
  `)}
  <span>invalid</span>
</mlv-grid>
  `
};
