import { LitElement, unsafeCSS, html, css, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { getItems, grid } from '@elements/elements/test';
import layout from '@elements/elements/css/module.layout.css?inline';
import '@elements/elements/grid/define.js';
import '@elements/elements/badge/define.js'
import '@elements/elements/button/define.js';
import '@elements/elements/bulk-actions/define.js'
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
import '@elements/elements/tabs/define.js';
import '@lit-labs/virtualizer';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'nve-grid',
};

export const Default = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const MultiSelect = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column width="max-content" position="fixed">
        <nve-checkbox>
          <input type="checkbox" aria-label="select all rows" />
        </nve-checkbox>
      </nve-grid-column>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map((row, i) => html`
      <nve-grid-row>
        <nve-grid-cell>
          <nve-checkbox>
            <input type="checkbox" ?checked=${i === 1} aria-label="select row ${i}" />
          </nve-checkbox>
        </nve-grid-cell>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const MultiSelectBulkActions = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px">
    <nve-grid-header>
      <nve-grid-column width="max-content" position="fixed">
        <nve-checkbox>
          <input type="checkbox" aria-label="select all rows" />
        </nve-checkbox>
      </nve-grid-column>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(20).map((row, i) => html`
      <nve-grid-row .selected=${i === 1}>
        <nve-grid-cell>
          <nve-checkbox>
            <input type="checkbox" ?checked=${i === 1} aria-label="select row ${i}" />
          </nve-checkbox>
        </nve-grid-cell>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
    <nve-bulk-actions closable status="accent" slot="footer">
      1 selected
      <nve-button interaction="flat-destructive">delete</nve-button>
      <nve-icon-button interaction="flat" icon-name="additional-actions"></nve-icon-button>
    </nve-bulk-actions>
  </nve-grid>
</div>
  `
};

export const SingleSelect = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column width="max-content" position="fixed"></nve-grid-column>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map((row, i) => html`
      <nve-grid-row>
        <nve-grid-cell>
          <nve-radio>
            <input type="radio" ?checked=${i === 1} name="single-select" .value=${i} aria-label="select row ${i}" />
          </nve-radio>
        </nve-grid-cell>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const RowAction = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
      <nve-grid-column width="max-content" aria-label="additonal actions" position="fixed"></nve-grid-column>
    </nve-grid-header>
    ${getItems().map((row, i) => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
        <nve-grid-cell>
          <nve-icon-button interaction="flat" icon-name="additional-actions" aria-label="row ${i} actions"></nve-icon-button>
        </nve-grid-cell>
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const Footer = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(8).map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
    <nve-grid-footer>
      <p nve-text="body">footer content</p>
    </nve-grid-footer>
  </nve-grid>
</div>
  `
};

export const FooterScrollbar = {
  render: () => html`
<div nve-theme="root">
<nve-grid style="--scroll-height: 402px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(14).map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
    <nve-grid-footer>
      <p nve-text="body">footer content</p>
    </nve-grid-footer>
  </nve-grid>
</div>
  `
};

export const Pagination = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 370px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
    <nve-grid-footer>
      <nve-pagination value="1" items="100" step="10"></nve-pagination>
    </nve-grid-footer>
  </nve-grid>
</div>
  `
};

export const Scroll = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(100).map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnAction = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`
        <nve-grid-column>
          ${column.label} <nve-icon-button id="column-${i}-btn" slot="actions"></nve-icon-button>
        </nve-grid-column>`)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
  <nve-dropdown anchor="column-0-btn" arrow>
    <nve-search rounded>
      <input type="search" placeholder="search column" aria-label="search apps" />
    </nve-search>
    <nve-menu>
      <nve-menu-item><nve-icon name="settings"></nve-icon> settings</nve-menu-item>
      <nve-menu-item><nve-icon name="favorite-filled"></nve-icon> favorites</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
</div>
  `
};

export const ColumnWidth = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<nve-grid-column width="${i !== 4 ? '300px' : ''}">${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
    <nve-grid-footer>footer content</nve-grid-footer>
  </nve-grid>
</div>
  `
};

export const Content = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(10).map((row, ir) => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell], ic) => html`<nve-grid-cell>${ir === 3 && ic === 2 ? `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores` : cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnFixed = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px; max-width: 800px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<nve-grid-column position=${i === 0 ? 'fixed' : ''} width="200px">${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnMultiFixed = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px; max-width: 800px">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<nve-grid-column position=${(i === 0) || (i === 4) ? 'fixed' : ''} width="200px">${column.label}</nve-grid-column>`)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnStackFixed = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px; max-width: 800px">
    <nve-grid-header>
      <nve-grid-column position="fixed" width="100px">Column 1</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">Column 2</nve-grid-column>
      <nve-grid-column width="200px">Column 3</nve-grid-column>
      <nve-grid-column width="200px">Column 4</nve-grid-column>
      <nve-grid-column width="200px">Column 5</nve-grid-column>
      <nve-grid-column width="200px">Column 6</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">Column 7</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">Column 8</nve-grid-column>
    </nve-grid-header>
    ${grid(10, 8).rows.map(row => html`
      <nve-grid-row>
        ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnAlignCenter = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column column-align="center">${column.label}</nve-grid-column>`)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnAlignEnd = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column column-align="end">${column.label}</nve-grid-column>`)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const ColumnAlignStart = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column column-align="start">${column.label}</nve-grid-column>`)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const DisplaySettings = {
  render: () => html`
<div nve-theme="root" nve-layout="column gap:md grow">
  <nve-dropdown closable anchor="column-settings">
    <nve-checkbox-group style="width: 175px">
      <label>Columns</label>
      <nve-checkbox>
        <label>Column 1</label>
        <input type="checkbox" checked />
      </nve-checkbox>
      <nve-checkbox>
        <label>Column 2</label>
        <input type="checkbox" checked />
      </nve-checkbox>
      <nve-checkbox>
        <label>Column 3</label>
        <input type="checkbox" checked />
      </nve-checkbox>
      <nve-checkbox>
        <label>Column 4</label>
        <input type="checkbox" checked />
      </nve-checkbox>
    </nve-checkbox-group>
    <nve-divider></nve-divider>
    <nve-button interaction="flat-destructive" style="--height: initial">restore settings</nve-button>
  </nve-dropdown>
  <div nve-layout="row gap:sm align:vertical-center">
    <p nve-text="body muted">1,145 results found</p>
    <nve-button id="column-settings">Display Settings</nve-button>
  </div>
  <nve-grid nve-layout="grow">
    <nve-grid-header>
      ${grid(8, 4).columns.map(column => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${grid(8, 4).rows.map(row => html`
      <nve-grid-row>
        ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const RowSort = {
  render: () => html`
<div nve-theme="root">
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column>
        None <nve-sort-button sort="none"></nve-sort-button>
      </nve-grid-column>
      <nve-grid-column>
        Ascending <nve-sort-button sort="ascending"></nve-sort-button>
      </nve-grid-column>
      <nve-grid-column>
        Descending <nve-sort-button sort="descending"></nve-sort-button>
      </nve-grid-column>
      <nve-grid-column>Default</nve-grid-column>
      <nve-grid-column>Default</nve-grid-column>
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
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
      <nve-grid>
        <nve-grid-header>
        ${Object.entries(this.items[0]).map(([, column], i) => html`
          <nve-grid-column>
            ${column.label} ${i === 0 ? html`<nve-sort-button .sort=${this.sort} @sort=${e => this.sort = e.detail.next}></nve-sort-button>` : nothing}
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

customElements.get('row-sort-demo') || customElements.define('row-sort-demo', RowSortDemo);

export const RowSortInteractive = {
  render: () => html`
<div nve-theme="root">
  <row-sort-demo></row-sort-demo>
</div>
  `
};

class InfiniteScrollDemo extends LitElement {
  static styles = [unsafeCSS(layout)];

  @state() private rows = this.#group(grid(10000).rows, 100);

  @state() private grid = grid(0, 4)

  render() {
    return html`
      <nve-grid style="--scroll-height: 400px" @scrollboxend=${() => this.#loadGroup()}>
        <nve-grid-header>
          ${this.grid.columns.map(column => html`<nve-grid-column>${column.label}</nve-grid-column>`)}
        </nve-grid-header>
        ${this.grid.rows.map(row => html`
        <nve-grid-row>
          ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
        </nve-grid-row>`)}
        <nve-grid-footer>
          <p>Items ${this.grid.rows.length} / 10000</p>
        </nve-grid-footer>
      </nve-grid>
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
  render: () => html`
<div nve-theme="root">
  <infinite-scroll-demo></infinite-scroll-demo>
</div>
  `
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
      <nve-button @click=${() => this.show = !this.show}>show large grid</nve-button>
      <p>1000 rows, 4000 cells</p>
      ${this.show ? html`
      <nve-grid style="--scroll-height: 400px; max-width: 1024px">
        <nve-grid-header>
          ${this.grid.columns.map(column => html`<nve-grid-column width="1fr">${column.label}</nve-grid-column>`)}
        </nve-grid-header>
        ${this.grid.rows.map(row => html`
        <nve-grid-row>
          ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
        </nve-grid-row>`)}
      </nve-grid>
      ` : nothing}
    `
  }
}

customElements.get('grid-performance-demo') || customElements.define('grid-performance-demo', GridPerformanceDemo);

export const Performance = {
  render: () => html`
<div nve-theme="root">
  <grid-performance-demo></grid-performance-demo>
</div>
  `
};

class GridVirtualScrollDemo extends LitElement {
  items = new Array(10000).fill('').map((_i, n) => ({ column: `${n}-0`, column1: `${n}-1`, column2: `${n}-2`, column3: `${n}-3` }));

  render() {
    return html`
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column>column</nve-grid-column>
          <nve-grid-column>column</nve-grid-column>
          <nve-grid-column>column</nve-grid-column>
          <nve-grid-column>column</nve-grid-column>
        </nve-grid-header>

        <lit-virtualizer style="min-height: 350px" scroller .items=${this.items} .renderItem=${i => html`
          <nve-grid-row style="width: 100%">
            ${Object.keys(i).map(key => html`<nve-grid-cell>${i[key]}</nve-grid-cell>`)}
          </nve-grid-row>`}>
        </lit-virtualizer>
      </nve-grid>
    `;
  }
}

customElements.get('grid-virtual-scroll-demo') || customElements.define('grid-virtual-scroll-demo', GridVirtualScrollDemo);

export const PerformanceVirtualScroll = {
  render: () => html`
<div nve-theme="root">
  <grid-virtual-scroll-demo></grid-virtual-scroll-demo>
</div>
  `
};

export const Stripe = {
  render: () => html`
<div nve-theme="root">
  <nve-grid stripe>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const Card = {
  render: () => html`
<div nve-theme="root">
  <nve-card>
    <nve-card-header>
      <h2 nve-text="heading sm bold">Data Grid</h2>
      <h3 nve-text="body muted">Card Example</h3>
      <nve-icon-button slot="header-action" icon-name="additional-actions"></nve-icon-button>
    </nve-card-header>
    <nve-grid container="flat" style="--scroll-height: 325px">
      <nve-grid-header>
        ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
      </nve-grid-header>
      ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
      `)}
    </nve-grid>
  </nve-card>
</div>
  `
};

export const CardTabs = {
  render: () => html`
<div nve-theme="root">
  <nve-card>
    <nve-card-header>
      <h2 nve-text="heading sm bold">Data Grid</h2>
      <nve-tabs>
        <nve-tabs-item selected>tab 1</nve-tabs-item>
        <nve-tabs-item>tab 2</nve-tabs-item>
        <nve-tabs-item>tab 3</nve-tabs-item>
      </nve-tabs>
    </nve-card-header>
    <nve-grid container="flat" style="--scroll-height: 325px">
      <nve-grid-header>
        ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
      </nve-grid-header>
      ${getItems().map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
      </nve-grid-row>
      `)}
    </nve-grid>
  </nve-card>
</div>
  `
};

export const Placeholder = {
  render: () => html`
<div nve-theme="root">
  <nve-grid style="--scroll-height: 402px">
    <nve-grid-header>
      <nve-grid-column></nve-grid-column>
    </nve-grid-header>
    <nve-grid-placeholder>
      Loading...
    </nve-grid-placeholder>
  </nve-grid>
</div>
  `
};

export const Full = {
  render: () => html`
<div nve-theme="root">
  <nve-grid container="full">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems().map(row => html`
    <nve-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
    </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const Flat = {
  render: () => html`
    <div nve-theme="root">
      <nve-grid container="flat">
        <nve-grid-header>
          ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
        </nve-grid-header>
        ${getItems().map(row => html`
        <nve-grid-row>
          ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
        </nve-grid-row>
        `)}
      </nve-grid>
    </div>`
};

export const PanelDetail = {
  render: () => html`
<div nve-theme="root">
  <div id="grid-detail-panel" nve-layout="row gap:md align:stretch">
    <nve-grid>
      <nve-grid-header>
        ${grid(10, 3).columns.map(column => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
        <nve-grid-column width="max-content" aria-label="details"></nve-grid-column>
      </nve-grid-header>
      ${grid(10, 3).rows.map((row, i) => html`
        <nve-grid-row ?selected=${i === 1}>
          ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
          <nve-grid-cell>
            <nve-icon-button interaction="flat" icon-name="additional-actions" value=${row.id} aria-label="view ${row.id}"></nve-icon-button>
          </nve-grid-cell>
        </nve-grid-row>
      `)}
    </nve-grid>
    <nve-panel expanded closable style="min-width: 280px">
      <nve-panel-header>
        <h2 slot="title">Row 2 Details</h2>
      </nve-panel-header>
      <nve-panel-content>
        <div nve-layout="column gap:md">
          <div nve-layout="column gap:xs">
            <label nve-text="body sm muted">Task</label>
            <p nve-text="eyebrow sm">Workflow</p>
          </div>
          <div nve-layout="column gap:xs">
            <label nve-text="body sm muted">Status</label>
            <nve-badge status="success">Complete</nve-badge>
          </div>
          <div nve-layout="column gap:xs">
            <label nve-text="body sm muted">Priority</label>
            <nve-badge status="pending">P1</nve-badge>
          </div>
        </div>
      </nve-panel-content>
    </nve-panel>
  </div>
</div>
  `
};

class GridPanelDemo extends LitElement {
  @state() private selectedId: string = null;

  #grid = grid(8, 3);

  static styles = [unsafeCSS(layout)];

  render() {
    return html`
      <div nve-layout="row gap:md align:stretch" style="height: calc(100% - 28px)">
        <nve-grid>
          <nve-grid-header>
            ${this.#grid.columns.map(column => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
            <nve-grid-column width="max-content" aria-label="details"></nve-grid-column>
          </nve-grid-header>
          ${this.#grid.rows.map(row => html`
          <nve-grid-row ?selected=${this.selectedId === row.id}>
            ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
            <nve-grid-cell>
              <nve-icon-button @click=${() => this.selectedId = row.id} interaction="flat" icon-name="additional-actions"></nve-icon-button>
            </nve-grid-cell>
          </nve-grid-row>`)}
          <nve-grid-footer>
            <nve-icon-button aria-label="show grid options" interaction="flat" icon-name="additional-actions"></nve-icon-button>
          </nve-grid-footer>
        </nve-grid>
        <nve-panel closable ?expanded=${!!this.selectedId} @close=${() => this.selectedId = null} style="min-width: 280px">
          <nve-panel-header>
            <h2 slot="title">Row ${this.selectedId}</h2>
          </nve-panel-header>
        </nve-panel>
      </div>
    `
  }
}

customElements.get('grid-panel-demo') || customElements.define('grid-panel-demo', GridPanelDemo);

export const PanelDetailInteractive = {
  render: () => html`
<div nve-theme="root">
  <grid-panel-demo></grid-panel-demo>
</div>
  `
};

class GridDynamicColumnDemo extends LitElement {
  @state() private selectedId: string = null;

  @state() private grid = grid(10, 6);

  static styles = [unsafeCSS(layout)];

  render() {
    return html`
      <div nve-layout="row gap:md align:stretch" style="height: calc(100% - 28px)">
        <nve-grid>
          <nve-grid-header>
            ${this.grid.columns.map((column, i) => html`<nve-grid-column width="200px" position=${(i === this.grid.columns.length - 1) || (i === 0) ? 'fixed' : ''}>${column.label}</nve-grid-column> `)}
          </nve-grid-header>
          ${this.grid.rows.map(row => html`
          <nve-grid-row ?selected=${this.selectedId === row.id}>
            ${row.cells.map(cell => html`<nve-grid-cell>${cell.label}</nve-grid-cell> `)}
          </nve-grid-row>`)}
          <nve-grid-footer>
            <nve-button interaction="flat" @click=${this.#update}>add column</nve-button>
          </nve-grid-footer>
        </nve-grid>
      </div>
      
    `
  }

  #update() {
    this.grid = grid(10, this.shadowRoot.querySelectorAll('nve-grid-column').length + 1);
  }
}

customElements.get('grid-dynamic-column-demo') || customElements.define('grid-dynamic-column-demo', GridDynamicColumnDemo);

export const ColumnDynamicFixed = {
  render: () => html`
<div nve-theme="root">
  <grid-dynamic-column-demo></grid-dynamic-column-demo>
</div>
  `
};

export const All = {
  render: () => html`
<div nve-layout="grid gap:lg span-items:4 pad:md">
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Grid</h2>
    ${Default.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Multi Select</h2>
    ${MultiSelect.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Multi Select Bulk Actions</h2>
    ${MultiSelectBulkActions.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Single Select</h2>
    ${SingleSelect.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Card Tabs</h2>
    ${CardTabs.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Panel Detail</h2>
    ${PanelDetail.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Multi Fixed</h2>
    ${ColumnMultiFixed.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Fixed</h2>
    ${ColumnFixed.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Dynamic Fixed</h2>
    ${ColumnDynamicFixed.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Width</h2>
    ${ColumnWidth.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Footer</h2>
    ${Footer.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Scroll</h2>
    ${Scroll.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Align center</h2>
    ${ColumnAlignCenter.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Column Align End</h2>
    ${ColumnAlignEnd.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Row Action</h2>
    ${RowAction.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Row Sort</h2>
    ${RowSort.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Pagination</h2>
    ${Pagination.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Stripe</h2>
    ${Stripe.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Card</h2>
    ${Card.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Placeholder</h2>
    ${Placeholder.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Full</h2>
    ${Full.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Flat</h2>
    ${Flat.render()}
  </div>
  <div nve-layout="column gap:md align:stretch">
    <h2 nve-text="heading">Content Width</h2>
    ${Content.render()}
  </div>
</div>`
}
