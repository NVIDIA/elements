import { LitElement, unsafeCSS, html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import layout from '@elements/elements/css/module.layout.css?inline';
import '@elements/elements/grid/define.js';
import '@elements/elements/badge/define.js';
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
import '@elements/elements/tabs/define.js';
import { getItems, grid } from '@elements/elements/test';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'mlv-grid',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const MultiSelect = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const MultiSelectBulkActions = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px">
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
    <mlv-bulk-actions closable status="accent">
      1 selected
      <mlv-button interaction="ghost-destructive">delete</mlv-button>
      <mlv-icon-button interaction="ghost" icon-name="additional-actions"></mlv-icon-button>
    </mlv-bulk-actions>
  </mlv-grid>
</div>
  `
};

export const SingleSelect = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const RowAction = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid>
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
      <mlv-grid-column width="max-content" aria-label="additonal actions" position="fixed"></mlv-grid-column>
    </mlv-grid-header>
    ${getItems().map((row, i) => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
        <mlv-grid-cell>
          <mlv-icon-button interaction="ghost" icon-name="additional-actions" aria-label="row ${i} actions"></mlv-icon-button>
        </mlv-grid-cell>
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const Footer = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const FooterScrollbar = {
  render: () => html`
<div mlv-theme="root">
<mlv-grid style="--scroll-height: 410px">
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
</div>
  `
};

export const Pagination = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const Scroll = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems(100).map(row => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const ColumnAction = {
  render: () => html`
<div mlv-theme="root">
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
      <mlv-menu-item><mlv-icon name="settings"></mlv-icon> settings</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="favorite-filled"></mlv-icon> favorites</mlv-menu-item>
    </mlv-menu>
  </mlv-dropdown>
</div>
  `
};

export const ColumnWidth = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column width=${i !== 4 ? '300px' : ''}>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems().map(row => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
      </mlv-grid-row>
    `)}
    <mlv-grid-footer>footer content</mlv-grid-footer>
  </mlv-grid>
</div>
  `
};

export const ColumnFixed = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px; max-width: 800px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column position=${i === 0 ? 'fixed' : ''} width="200px">${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems().map(row => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell> `)}
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const ColumnMultiFixed = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px; max-width: 800px">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column], i) => html`<mlv-grid-column position=${(i === 0) || (i === 4) ? 'fixed' : ''} width="200px">${column.label}</mlv-grid-column>`)}
    </mlv-grid-header>
    ${getItems().map(row => html`
      <mlv-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
      </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const ColumnStackFixed = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px; max-width: 800px">
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
</div>
  `
};

export const ColumnAlignCenter = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const ColumnAlignEnd = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const ColumnAlignStart = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const DisplaySettings = {
  render: () => html`
<div mlv-theme="root" mlv-layout="column gap:md grow">
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
    <mlv-button interaction="ghost-destructive" style="--height: initial">restore settings</mlv-button>
  </mlv-dropdown>
  <div mlv-layout="row gap:sm align:vertical-center">
    <p mlv-text="body muted">1,145 results found</p>
    <mlv-button id="column-settings">Display Settings</mlv-button>
  </div>
  <mlv-grid mlv-layout="grow">
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
<div mlv-theme="root">
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

@customElement('row-sort-demo')
class RowSortDemo extends LitElement {
  @state() sort: 'none' | 'ascending' | 'descending' = 'none';

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

export const RowSortInteractive = {
  render: () => html`
<div mlv-theme="root">
  <row-sort-demo></row-sort-demo>
</div>
  `
};

@customElement('batch-render-demo')
class BatchRenderDemo extends LitElement {
  static styles = [unsafeCSS(layout)];

  @state() rows = this.#group(grid(10000).rows, 100);

  @state() grid = grid(0, 4)

  render() {
    return html`
      <mlv-grid style="--scroll-height: 400px" @scrollend=${() => this.#loadGroup()}>
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

export const BatchRender = {
  render: () => html`
<div mlv-theme="root">
  <batch-render-demo></batch-render-demo>
</div>
  `
};

@customElement('grid-performance-demo')
class GridPerformanceDemo extends LitElement {
  static styles = [unsafeCSS(layout), css`
  :host {
    display: block;
    height: 500px;
  }
  `];

  @state() show = false;

  @state() grid = grid(1000);

  render() {
    return html`
      <mlv-button @click=${() => this.show = !this.show}>show</mlv-button>
      <p>1000 rows, 4000 cells</p>
      ${this.show ? html`
      <mlv-grid style="--scroll-height: 400px; width: 1024px">
        <mlv-grid-header>
          ${this.grid.columns.map(column => html`<mlv-grid-column>${column.label}</mlv-grid-column>`)}
        </mlv-grid-header>
        ${this.grid.rows.map(row => html`
        <mlv-grid-row>
          ${row.cells.map(cell => html`<mlv-grid-cell>${cell.label}</mlv-grid-cell> `)}
        </mlv-grid-row>`)}
      </mlv-grid>
      ` : nothing}
    `
  }
}

export const Performance = {
  render: () => html`
<div mlv-theme="root">
  <grid-performance-demo></grid-performance-demo>
</div>
  `
};

export const Stripe = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const Card = {
  render: () => html`
<div mlv-theme="root">
  <mlv-card>
    <mlv-card-header>
      <h2 mlv-text="heading sm bold">Data Grid</h2>
      <h3 mlv-text="body muted">Card Example</h3>
      <mlv-icon-button slot="header-action" icon-name="additional-actions"></mlv-icon-button>
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
</div>
  `
};

export const CardTabs = {
  render: () => html`
<div mlv-theme="root">
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
</div>
  `
};

export const Placeholder = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid style="--scroll-height: 410px">
    <mlv-grid-header>
      <mlv-grid-column></mlv-grid-column>
    </mlv-grid-header>
    <mlv-grid-placeholder>
      Loading...
    </mlv-grid-placeholder>
  </mlv-grid>
</div>
  `
};

export const Fill = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid container="fill">
    <mlv-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
    </mlv-grid-header>
    ${getItems().map(row => html`
    <mlv-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
    </mlv-grid-row>
    `)}
  </mlv-grid>
</div>
  `
};

export const Flat = {
  render: () => html`
    <div mlv-theme="root">
      <mlv-grid container="flat">
        <mlv-grid-header>
          ${Object.entries(getItems()[0]).map(([, column]) => html`<mlv-grid-column>${column.label}</mlv-grid-column> `)}
        </mlv-grid-header>
        ${getItems().map(row => html`
        <mlv-grid-row>
          ${Object.entries(row).map(([, cell]) => html`<mlv-grid-cell>${cell.value}</mlv-grid-cell>`)}
        </mlv-grid-row>
        `)}
      </mlv-grid>
    </div>`
};

export const PanelDetail = {
  render: () => html`
<div mlv-theme="root">
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
            <mlv-icon-button interaction="ghost" icon-name="additional-actions" value=${row.id} aria-label="view ${row.id}"></mlv-icon-button>
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
</div>
  `
};

@customElement('mlv-grid-panel-demo')
class PanelDemo extends LitElement {
  @state() selectedId: string = null;

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
              <mlv-icon-button @click=${() => this.selectedId = row.id} interaction="ghost" icon-name="additional-actions"></mlv-icon-button>
            </mlv-grid-cell>
          </mlv-grid-row>`)}
          <mlv-grid-footer>
            <mlv-icon-button aria-label="show grid options" interaction="ghost" icon-name="additional-actions"></mlv-icon-button>
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

export const PanelDetailInteractive = {
  render: () => html`
<div mlv-theme="root">
  <mlv-grid-panel-demo></mlv-grid-panel-demo>
</div>
  `
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
    <h2 mlv-text="heading">Column Stack Fixed</h2>
    ${ColumnStackFixed.render()}
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
    <h2 mlv-text="heading">Fill</h2>
    ${Fill.render()}
  </div>
  <div mlv-layout="column gap:md align:stretch">
    <h2 mlv-text="heading">Flat</h2>
    ${Flat.render()}
  </div>
</div>`
}
