import { LitElement, unsafeCSS, html, css, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { getItems, grid } from '../../test/demo.js';
import layout from '@nvidia-elements/styles/layout.css?inline';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/badge/define.js'
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/pagination/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@lit-labs/virtualizer';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'nve-grid',
};

export const Default = {
  render: () => html`
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
  `
};

export const MultiSelect = {
  render: () => html`
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
  `
};

export const MultiSelectBulkActions = {
  render: () => html`
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
  <nve-toolbar status="accent" slot="footer">
    <nve-icon-button container="flat" icon-name="cancel" slot="prefix"></nve-icon-button>
    <p nve-text="boxy">1 selected</p>
    <nve-button container="flat" interaction="destructive" slot="suffix">delete</nve-button>
    <nve-icon-button container="flat" icon-name="more-actions" slot="suffix"></nve-icon-button>
  </nve-toolbar>
</nve-grid>
  `
};

export const SingleSelect = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" position="fixed"></nve-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems().map((row, i) => html`
    <nve-grid-row>
      <nve-grid-cell>
        <nve-radio>
          <input type="radio" ?checked=${i === 1} name="single-select" .value=${`${i}`} aria-label="select row ${i}" />
        </nve-radio>
      </nve-grid-cell>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

export const RowAction = {
  render: () => html`
<div>
  <nve-grid>
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
      <nve-grid-column width="max-content" aria-label="additonal actions" position="fixed"></nve-grid-column>
    </nve-grid-header>
    ${getItems().map((row, i) => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
        <nve-grid-cell>
          <nve-icon-button container="flat" icon-name="more-actions" aria-label="row ${i} actions"></nve-icon-button>
        </nve-grid-cell>
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

export const RowGroups = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" aria-label="expand groups" position="fixed"></nve-grid-column>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
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
  <nve-grid-row selected>
    <nve-grid-cell>
      <nve-icon-button icon-name="caret" container="flat" direction="down" aria-label="view session mvwgh3t SSD uploads"></nve-icon-button>
    </nve-grid-cell>
    <nve-grid-cell>Session: mvwgh3t</nve-grid-cell>
    <nve-grid-cell>upload</nve-grid-cell>
    <nve-grid-cell>pending</nve-grid-cell>
    <nve-grid-cell>p0</nve-grid-cell>
    <nve-grid-cell>12/11/22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell></nve-grid-cell>
    <nve-grid-cell>SSD: mvwgh3t</nve-grid-cell>
    <nve-grid-cell>validating</nve-grid-cell>
    <nve-grid-cell>pending</nve-grid-cell>
    <nve-grid-cell>p0</nve-grid-cell>
    <nve-grid-cell>12/11/22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell></nve-grid-cell>
    <nve-grid-cell>SSD: qudbd8x</nve-grid-cell>
    <nve-grid-cell>uploading</nve-grid-cell>
    <nve-grid-cell>finished</nve-grid-cell>
    <nve-grid-cell>p0</nve-grid-cell>
    <nve-grid-cell>12/11/22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell></nve-grid-cell>
    <nve-grid-cell>SSD: j8hvikt</nve-grid-cell>
    <nve-grid-cell>queuing</nve-grid-cell>
    <nve-grid-cell>running</nve-grid-cell>
    <nve-grid-cell>p0</nve-grid-cell>
    <nve-grid-cell>12/11/22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <nve-icon-button icon-name="caret" container="flat" direction="right" aria-label="view session bg5ujqp SSD uploads"></nve-icon-button>
    </nve-grid-cell>
    <nve-grid-cell>Session: bg5ujqp</nve-grid-cell>
    <nve-grid-cell>upload</nve-grid-cell>
    <nve-grid-cell>pending</nve-grid-cell>
    <nve-grid-cell>p1</nve-grid-cell>
    <nve-grid-cell>12/12/22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <nve-icon-button icon-name="caret" container="flat" direction="right" aria-label="view session 6ruehvh SSD uploads"></nve-icon-button>
    </nve-grid-cell>
    <nve-grid-cell>Session: 6ruehvh</nve-grid-cell>
    <nve-grid-cell>upload</nve-grid-cell>
    <nve-grid-cell>pending</nve-grid-cell>
    <nve-grid-cell>p2</nve-grid-cell>
    <nve-grid-cell>12/09/22</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
`
};

export const Footer = {
render: () => html`
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
  `
};

export const FooterScrollbar = {
  render: () => html`
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
  `
};

export const Pagination = {
  render: () => html`
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
  `
};

export const Scroll = {
  render: () => html`
<nve-grid style="height: 402px">
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems(100).map(row => html`
    <nve-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>footer</nve-grid-footer>
</nve-grid>
  `
};

export const ScrollPosition = {
  render: () => html`
<nve-grid style="height: 402px">
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems(100).map(row => html`
    <nve-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid><br>

<nve-button>scroll top</nve-button>
<script type="module">
  document.querySelector('nve-button').addEventListener('click', () => {
    document.querySelector('nve-grid').scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>
  `
};

export const FullHeight = {
  render: () => html`
<section nve-layout="column gap:lg" style="height: 500px; padding: var(--nve-ref-size-100); border: 1px solid var(--nve-ref-border-color-emphasis); resize: vertical; overflow: hidden;">
  <nve-search>
    <input type="search" aria-label="search" placeholder="search" />
  </nve-search>
  <nve-grid nve-layout="full">
    <nve-grid-header>
      ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
    </nve-grid-header>
    ${getItems(100).map(row => html`
      <nve-grid-row>
        ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</section>
  `
};

export const ColumnAction = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column], i) => html`
      <nve-grid-column>
        ${column.label} <nve-icon-button id="column-${i}-btn" icon-name="more-actions" slot="actions"></nve-icon-button>
      </nve-grid-column>`)}
  </nve-grid-header>
  ${getItems().map(row => html`
    <nve-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
<nve-dropdown anchor="column-0-btn">
  <nve-search rounded>
    <input type="search" placeholder="search column" aria-label="search apps" />
  </nve-search>
  <nve-menu>
    <nve-menu-item><nve-icon name="gear"></nve-icon> settings</nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> favorites</nve-menu-item>
  </nve-menu>
</nve-dropdown>
  `
};

export const ColumnWidth = {
  render: () => html`
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
  `
};

export const Content = {
  render: () => html`
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
  `
};

export const ColumnFixed = {
  render: () => html`
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
  `
};

export const ColumnMultiFixed = {
  render: () => html`
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
  `
};

export const ColumnStackFixed = {
  render: () => html`
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
  `
};

export const ColumnAlignCenter = {
  render: () => html`
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
  `
};

export const ColumnAlignEnd = {
  render: () => html`
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
  `
};

export const ColumnAlignStart = {
  render: () => html`
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
  `
};

export const DisplaySettings = {
  render: () => html`
<div nve-layout="column gap:md full">
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
  <nve-grid nve-layout="full">
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
  render: () => html`<row-sort-demo></row-sort-demo>`
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
  
  connectedCallback() {
    super.connectedCallback();
    window.NVE_ELEMENTS.state.env = 'production';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.NVE_ELEMENTS.state.env = 'development';
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
  render: () => html`<grid-virtual-scroll-demo></grid-virtual-scroll-demo>`
};

export const Stripe = {
  render: () => html`
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
  `
};

export const Card = {
  render: () => html`
<nve-card>
  <nve-card-header>
    <h2 nve-text="heading sm bold">Data Grid</h2>
    <h3 nve-text="body muted">Card Example</h3>
    <nve-icon-button slot="header-action" icon-name="more-actions"></nve-icon-button>
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
  `
};

export const CardTabs = {
  render: () => html`
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
  `
};

export const Placeholder = {
  render: () => html`
<nve-grid style="min-height: 400px">
  <nve-grid-header>
    <nve-grid-column></nve-grid-column>
  </nve-grid-header>
  <nve-grid-placeholder>
    <nve-progress-ring status="accent" size="lg"></nve-progress-ring>
  </nve-grid-placeholder>
</nve-grid>
  `
};

export const PlaceholderRetry = {
  render: () => html`
<nve-grid style="min-height: 400px">
  <nve-grid-header>
    <nve-grid-column></nve-grid-column>
  </nve-grid-header>
  <nve-grid-placeholder>
    <div nve-layout="column gap:md align:center">
      <h2 nve-text="heading">Data not found</h2>
      <p nve-text="body">Try adjusting filter settings or try again later.</p>
      <nve-button>Retry</nve-button>
    </div>
  </nve-grid-placeholder>
  <nve-grid-footer>footer</nve-grid-footer>
</nve-grid>
  `
};

export const Full = {
  render: () => html`
<nve-grid container="full" style="--scroll-height: 402px">
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems(20).map(row => html`
  <nve-grid-row>
    ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
  </nve-grid-row>
  `)}
</nve-grid>
  `
};

export const Flat = {
  render: () => html`
<nve-grid container="flat" style="--scroll-height: 402px">
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems(20).map(row => html`
  <nve-grid-row>
    ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell>`)}
  </nve-grid-row>
  `)}
</nve-grid>
  `
};

export const FocusTypes = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>span</nve-grid-column>
    <nve-grid-column>button</nve-grid-column>
    <nve-grid-column>2x buttons</nve-grid-column>
    <nve-grid-column>input</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>
      <span>span</span>
    </nve-grid-cell>
    <nve-grid-cell>
      <button>button</button>
    </nve-grid-cell>
    <nve-grid-cell>
      <button>button</button>
      <button>button</button>
    </nve-grid-cell>
    <nve-grid-cell>
      <input />
    </nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

export const PanelDetail = {
  render: () => html`
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
          <nve-icon-button container="flat" icon-name="expand-details" value=${row.id} aria-label="view ${row.id}"></nve-icon-button>
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
  `
};

export const PanelGrid = {
  render() {
    return html`
    <style>
      nve-panel#panel-grid {
        min-width: 380px;
        z-index: 99;
        height: 100vh;
        position: sticky;
        top: 0;
        right: 0;
      }

      .sb-story nve-panel#panel-grid {
        height: 700px;
      }

      body {
        padding: 0 !important;
      }
    </style>
    <main nve-layout="row gap:sm full">
      <section nve-layout="column gap:md full align:stretch">
        page content
      </section>
      <nve-panel expanded id="panel-grid">
        <nve-panel-header>
          <h2 slot="title">Recording</h2>
        </nve-panel-header>
        <nve-grid container="flat" stripe style="--scroll-height: 100vh">
          <nve-grid-header hidden>
            <nve-grid-column>Key</nve-grid-column>
            <nve-grid-column>Value</nve-grid-column>
          </nve-grid-header>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Session ID</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">123456</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Record Date</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">2023-09-04 11:00</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Tag</p></nve-grid-cell>
            <nve-grid-cell><nve-tag readonly>Production</nve-tag></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Route ID</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">9876123</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Configuration</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">prod-0.1.0</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Duration</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">1:23:34</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Description</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">local test run</p></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell><p nve-text="label muted">Number of Sensors</p></nve-grid-cell>
            <nve-grid-cell><p nve-text="label">24</p></nve-grid-cell>
          </nve-grid-row>
        </nve-grid>
      </nve-panel>
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
              <nve-icon-button @click=${() => this.selectedId = row.id} container="flat" icon-name="expand-details"></nve-icon-button>
            </nve-grid-cell>
          </nve-grid-row>`)}
          <nve-grid-footer>
            <nve-icon-button aria-label="show grid options" container="flat" icon-name="expand-details"></nve-icon-button>
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
  render: () => html`<grid-panel-demo></grid-panel-demo>`
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
            <nve-button container="flat" @click=${this.#update}>add column</nve-button>
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
  render: () => html`<grid-dynamic-column-demo></grid-dynamic-column-demo>`
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

export const InvalidDOM = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  <div>invalid</div>
  ${getItems().map(row => html`
    <nve-grid-row>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <span>invalid</span>
</nve-grid>
  `
};


export const Audit = {
  render: () => html`
<nve-grid style="height: 450px">
  <div hidden></div>
  <nve-grid-header>
    <div hidden></div>
    ${Object.entries(getItems()[0]).map(([, column]) => html`<nve-grid-column>${column.label}</nve-grid-column> `)}
  </nve-grid-header>
  ${getItems(50).map(row => html`
    <nve-grid-row>
      <div hidden></div>
      ${Object.entries(row).map(([, cell]) => html`<nve-grid-cell>${cell.value}<nve-tooltip hidden>???</nve-tooltip></nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

export const ColumnSortButtonVisibility = {
  render: () => html `
  <nve-grid>
  <nve-grid-header>
    <nve-grid-column>
      Column 1 <nve-sort-button sort="none"></nve-sort-button>
    </nve-grid-column>
    <nve-grid-column>
      Column 2 <nve-sort-button sort="ascending"></nve-sort-button>
    </nve-grid-column>
    <nve-grid-column>
      Column 3 <nve-sort-button sort="descending"></nve-sort-button>
    </nve-grid-column>
    <nve-grid-column>Column 4</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>cell 1-1</nve-grid-cell>
    <nve-grid-cell>cell 1-2</nve-grid-cell>
    <nve-grid-cell>cell 1-3</nve-grid-cell>
    <nve-grid-cell>cell 1-4</nve-grid-cell>
  </nve-grid-row>
</nve-grid>`
}
