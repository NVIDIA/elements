import { LitElement, unsafeCSS, html, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { getItems, grid } from '../test/demo.js';
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
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@lit-labs/virtualizer';

export default {
  title: 'Elements/Data Grid',
  component: 'nve-grid',
};

/**
 * @summary Basic data grid component with header and rows, demonstrating the basic structure and layout of a grid.
 */
export const Default = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary The datagrid follows the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/#kbd_label) for standardized keyboard navigation.
 */
export const Keynav = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="150px">Key</nve-grid-column>
    <nve-grid-column>Function</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Right Arrow</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>Moves focus one cell to the right.</li>
        <li>If focus is on the right-most cell in the row, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Left Arrow</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>Moves focus one cell to the left.</li>
        <li>If focus is on the left-most cell in the row, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Down Arrow</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>Moves focus one cell down.</li>
        <li>If focus is on the bottom cell in the column, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Up Arrow</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>Moves focus one cell Up.</li>
        <li>If focus is on the top cell in the column, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Page Down</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>In example 3, moves focus down five rows, scrolling so the bottom row in the currently visible set of rows becomes the first visible row.</li>
        <li>If focus is in the last row, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Page Up</kbd>
    </nve-grid-cell>
    <nve-grid-cell>
      <ul nve-text="list">
        <li>In example 3, moves focus up 5 rows, scrolling so the top row in the currently visible set of rows becomes the last visible row.</li>
        <li>If focus is in the first row of the grid, focus does not move.</li>
      </ul>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Home</kbd>
    </nve-grid-cell>
    <nve-grid-cell>Moves focus to the first cell in the row that contains focus.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>End</kbd>
    </nve-grid-cell>
    <nve-grid-cell>Moves focus to the last cell in the row that contains focus.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Control</kbd> + <kbd>Home</kbd>
    </nve-grid-cell>
    <nve-grid-cell>Moves focus to the first cell in the first row.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>
      <kbd>Control</kbd> + <kbd>End</kbd>
    </nve-grid-cell>
    <nve-grid-cell>Moves focus to the last cell in the last row.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>`
};

/**
 * @summary Multi Select rows use a checkbox as the first focusable item within the row.
 * When selected set the `selected` attribute/property on the row. This will ensure selected
 * styles as well as the proper `ariaSelected` state for accessibility.
 */
export const MultiSelect = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" position="fixed">
      <nve-checkbox>
        <input type="checkbox" aria-label="select all rows" />
      </nve-checkbox>
    </nve-grid-column>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      <nve-grid-cell>
        <nve-checkbox>
          <input type="checkbox" ?checked=${r === 1} aria-label="select row ${r}" />
        </nve-checkbox>
      </nve-grid-cell>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Use bulk actions for operations on multiple items. Display only
 * when rows are selected. Closing bulk actions deselects all selected rows.
 */
export const MultiSelectBulkActions = {
  render: () => html`
<nve-grid style="--scroll-height: 402px">
  <nve-grid-header>
    <nve-grid-column width="max-content" position="fixed">
      <nve-checkbox>
        <input type="checkbox" aria-label="select all rows" />
      </nve-checkbox>
    </nve-grid-column>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(20).fill('').map((_, r) => html`
    <nve-grid-row .selected=${r === 1}>
      <nve-grid-cell>
        <nve-checkbox>
          <input type="checkbox" ?checked=${r === 1} aria-label="select row ${r}" />
        </nve-checkbox>
      </nve-grid-cell>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
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

/**
 * @summary A single select datagrid allows users to choose exactly one row
 * from a data table by providing radio buttons in the first column, ensuring
 * only one item can be selected at a time. To enable single select, place `nve-radio`
 * input as the first grid cell of each row. Set `name` attribute on each radio
 * to ensure to associate the same radio group.
 */
export const SingleSelect = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" position="fixed"></nve-grid-column>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      <nve-grid-cell>
        <nve-radio>
          <input type="radio" ?checked=${r === 1} name="single-select" .value=${`${r}`} aria-label="select row ${r}" />
        </nve-radio>
      </nve-grid-cell>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Row actions enable additional user actions specific to a given row.
 * Place a `nve-icon-button` at the end of the grid row for actions.
 */
export const RowAction = {
  render: () => html`
<nve-dropdown id="row-actions-dropdown" align="end">
  <nve-menu>
    <nve-menu-item>action 1</nve-menu-item>
    <nve-menu-item>action 2</nve-menu-item>
    <nve-menu-item>action 3</nve-menu-item>
  </nve-menu>
</nve-dropdown>
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
    <nve-grid-column width="max-content" aria-label="additonal actions" position="fixed"></nve-grid-column>
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
      <nve-grid-cell>
        <nve-icon-button id="action-${r}" popovertarget="row-actions-dropdown" container="flat" icon-name="more-actions" aria-label="row ${r} actions"></nve-icon-button>
      </nve-grid-cell>
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Row groups can be used to organize related rows of a similar subtype.
 */
export const RowGroups = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="max-content" aria-label="expand groups" position="fixed"></nve-grid-column>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
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

/**
 * @summary The footer can be used to display contextual information or additional user actions such as pagination.
 */
export const Footer = {
render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(8).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>
    <p nve-text="body">footer content</p>
  </nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary The footer can be used to display contextual information or additional user actions such as pagination.
 * @tags test-case
 */
export const FooterScrollbar = {
  render: () => html`
<nve-grid style="--scroll-height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(14).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>
    <p nve-text="body">footer content</p>
  </nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary The pagination pattern should be used when working with large
 * data sets that need to be incrementally loaded or filtered for performance or
 * useability.
 */
export const Pagination = {
  render: () => html`
<nve-grid style="--scroll-height: 370px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>
    <nve-pagination value="1" items="100" step="10"></nve-pagination>
  </nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary A fixed height can be placed on the grid allowing rows to be
 * scrolled within the bounding box of the grid.
 */
export const Scroll = {
  render: () => html`
<nve-grid style="height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(100).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>footer</nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary Scroll position can be controlled via the `scrollTo` API.
 */
export const ScrollPosition = {
  render: () => html`
<nve-grid id="scroll-position-grid" style="height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(20).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>
    <nve-button id="scroll-top-button">scroll top</nve-button>
  </nve-grid-footer>
</nve-grid>
<script type="module">
  const grid = document.querySelector('#scroll-position-grid');
  const button = document.querySelector('#scroll-top-button');
  button.addEventListener('click', () => {
    grid.scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>
  `
};

/**
 * @summary Using `nve-layout="column"` the grid to fill any remaining space
 * of a parent containing element. This is helpful for preserving the grid
 * height/fill while dynamic content above can freely change.
 */
export const FullHeight = {
  render: () => html`
<section nve-layout="column gap:lg" style="height: 500px; padding: var(--nve-ref-size-100); border: 1px solid var(--nve-ref-border-color-emphasis); resize: vertical; overflow: hidden;">
  <nve-search>
    <input type="search" aria-label="search" placeholder="search" />
  </nve-search>
  <nve-grid style="height: 100%; min-height: 0;">
    <nve-grid-header>
      ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
    </nve-grid-header>
    ${Array(10).fill('').map((_, r) => html`
      <nve-grid-row>
        ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</section>
  `
};

/**
 * @summary Column actions can be created by using the `nve-icon-button` to
 * trigger dropdowns or panels to reveal additional actions to the user.
 */
export const ColumnAction = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`
      <nve-grid-column>
        column ${i} <nve-icon-button container="flat" popovertarget="grid-column-action-dropdown" icon-name="more-actions" slot="actions"></nve-icon-button>
      </nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
<nve-dropdown id="grid-column-action-dropdown">
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

/**
 * @summary Column width control for responsive grid layouts, enabling flexible content sizing and optimal space utilization across different screen sizes.
 */
export const ColumnWidth = {
  render: () => html`
<nve-grid style="--scroll-height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column width=${i !== 4 ? '300px' : ''}>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>footer content</nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary Basic grid content display with evenly distributed columns, demonstrating standard data presentation and cell content wrapping behavior.
 */
export const Content = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Columns can be fixed to any given side, however fixed columns should
 * not span past the half way point of the grid.
 */
export const ColumnFixed = {
  render: () => html`
<nve-grid style="--scroll-height: 402px; max-width: 800px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column position=${i === 0 ? 'fixed' : ''} width="200px">column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Multiple Columns can fixed to any given side, however fixed columns
 * should not span past the half way point of the grid.
 */
export const ColumnMultiFixed = {
  render: () => html`
<nve-grid style="--scroll-height: 402px; max-width: 800px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column position=${(i === 0) || (i === 4) ? 'fixed' : ''} width="200px">column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Multiple columns can be stacked and fixed to any given side, however
 * fixed columns should not span past the half way point of the grid.
 */
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
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(8).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Dynamic column management with programmatic addition and positioning, demonstrating flexible grid configuration for evolving data requirements.
 */
export const ColumnDynamicFixed = {
  render: () => html`
<nve-grid id="column-dynamic-fixed-grid" style="--scroll-height: 402px;">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column width="200px" position=${(i === 0) || (i === 4) ? 'fixed' : ''}>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
  <nve-grid-footer>
    <nve-button container="flat">add column</nve-button>
  </nve-grid-footer>
</nve-grid>
<script type="module">
  const grid = document.querySelector('#column-dynamic-fixed-grid');
  const button = grid.querySelector('nve-button');
  button.addEventListener('click', () => {
    const columns = grid.querySelectorAll('nve-grid-column');
    columns.filter((_ , i) => i !== 0).forEach(column => {
      column.position = '';
    });

    // add new column
    const newColumn = document.createElement('nve-grid-column');
    newColumn.position = 'fixed';
    newColumn.width = '200px';
    newColumn.textContent = 'column ' + columns.length + 1;
    grid.querySelector('nve-grid-header').appendChild(newColumn);

    // add new cell to each row to the end
    grid.querySelectorAll('nve-grid-row').forEach((row, i) => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = 'cell ' + i + '-' + columns.length + 1;
      row.appendChild(cell);
    });
  });
</script>
  `
};

/**
 * @summary Center-aligned column content for improved visual balance and data presentation, enhancing readability for numeric and centered data types.
 */
export const ColumnAlignCenter = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column column-align="center">column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Right-aligned column content for numeric data and values, providing consistent visual alignment and improved data scanning for financial or metric displays.
 */
export const ColumnAlignEnd = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column column-align="end">column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Left-aligned column content for text data and labels, providing consistent visual alignment and improved readability for textual information.
 */
export const ColumnAlignStart = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column column-align="start">column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Users can customize their data view through a dropdown menu above the grid, 
 * allowing them to show/hide columns and restore default settings for a personalized experience.
 */
export const DisplaySettings = {
  render: () => html`
<div nve-layout="column gap:md full">
  <nve-dropdown closable id="column-settings-dropdown">
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
    <nve-button popovertarget="column-settings-dropdown" popovertargetaction="hide" interaction="flat-destructive" style="--height: initial">restore settings</nve-button>
  </nve-dropdown>
  <div nve-layout="row gap:sm align:vertical-center">
    <p nve-text="body muted">1,145 results found</p>
    <nve-button popovertarget="column-settings-dropdown">Display Settings</nve-button>
  </div>
  <nve-grid>
    <nve-grid-header>
      ${Array(4).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
    </nve-grid-header>
    ${Array(10).fill('').map((_, r) => html`
      <nve-grid-row>
        ${Array(4).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell> `)}
      </nve-grid-row>
    `)}
  </nve-grid>
</div>
  `
};

/**
 * @summary Basic row sorting functionality with sort buttons, enabling users to organize data by different criteria for improved data analysis and navigation.
 */
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
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary A grid heatmap pattern can be implemented when combining the [nve-sys-visualization-sequential-diverging-red-green-*](docs/foundations/visualization/#sequential-diverging-red-green) theme tokens.
 * Heatmap patterns can be useful for visualizing test results, performance metrics or any data that has a fixed range of values.
 */
export const HeatmapPattern = {
  render: () => html`
<nve-grid container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="150px" position="fixed">Test Pipeline</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const testData = Array(15).fill('').map(() => ({
    id: 'id_' + self.crypto.getRandomValues(new Uint32Array(1))[0].toString(16),
    tests: Array(5).fill('').map(() => (Math.random() * 100).toFixed(2).padStart(5, '0'))
  }));

  const grid = document.querySelector('nve-grid');
  const gridHeader = document.querySelector('nve-grid-header');

  const columns = testData[0].tests.map((_, i) => {
    const column = document.createElement('nve-grid-column');
    column.textContent = 'Test Suite ' + (i + 1);
    return column;
  });

  const rows = testData.map(pipeline => {
    const row = document.createElement('nve-grid-row');
    const pipelineCell = document.createElement('nve-grid-cell');
    pipelineCell.textContent = pipeline.id;

    const testCells = pipeline.tests.map(test => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = test + '%';
      cell.setAttribute('data-value', test);
      return cell;
    });

    row.append(pipelineCell, ...testCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-value^='0'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-100); }
    [data-value^='1'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-100); }
    [data-value^='2'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
    [data-value^='3'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-300); }
    [data-value^='4'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
    [data-value^='5'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-500); }
    [data-value^='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-600); }
    [data-value^='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-700); }
    [data-value^='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
    [data-value^='9'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); }
    [data-value='100'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); }
    [data-value] { --color: var(--nve-ref-color-neutral-1200); --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted) }
    [data-value^='0'], [data-value^='1'], [data-value^='9'], [data-value~='100'] { --color: var(--nve-ref-color-neutral-100); }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};

/**
 * @summary CSS anchor positioning for tooltips within grid cells, demonstrating proper tooltip placement and content visibility in constrained grid environments.
 */
export const ContentVisibilityCSSAnchor = {
  render: () => html`
  <nve-grid style="height: 200px;">
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell><span id="target">Target 1</span></nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
    <nve-grid-row><nve-grid-cell>Empty</nve-grid-cell></nve-grid-row>
  </nve-grid>
  <nve-tooltip anchor="target" position="right">My tooltip</nve-tooltip>
  `
};

export function sortStringKeys<T>(list: T[], key: string, sortType: 'none' | 'ascending' | 'descending') {
  if (sortType === 'ascending') {
    return list.sort((a: {}, b: {}) => a[key].localeCompare(b[key]));
  }

  if (sortType === 'descending') {
    return list.sort((a: {}, b: {}) => a[key].localeCompare(b[key])).reverse();
  }

  return list;
}

class RowSortDemo extends LitElement {
  @state() private sort: 'none' | 'ascending' | 'descending' = 'none';

  static styles = [unsafeCSS(layout)];

  get items() {
    if (this.sort === 'ascending') {
      return getItems().sort((a: { field1: { value: string } }, b: { field1: { value: string } }) => a.field1.value.localeCompare(b.field1.value));
    }

    if (this.sort === 'descending') {
      return getItems().sort((a: { field1: { value: string } }, b: { field1: { value: string } }) => a.field1.value.localeCompare(b.field1.value)).reverse();
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

/**
 * @summary Row sort can be used to sort the rows of the grid.
 * @tags test-case
 */
export const RowSortInteractive = {
  render: () => html`<row-sort-demo></row-sort-demo>`
};

class InfiniteScrollDemo extends LitElement {
  static styles = [unsafeCSS(layout)];

  @state() private rows = this.#group(grid(10000).rows, 100);

  @state() private grid: { columns: { id: string; label: string; sort: string }[]; rows: Partial<{ id: string; cells: { id: string; label: string }[] }>[] } = grid(0, 4)

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

  #group(items: {}[], size: number) {
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

/**
 * @summary Infinite scroll can be used to load data as the user scrolls down the grid.
 * @tags test-case performance
 */
export const PerformanceInfiniteScroll = {
  render: () => html`<infinite-scroll-demo></infinite-scroll-demo>`
};

/**
 * @summary Performance can be used to test the performance of the grid.
 * @tags test-case performance
 */
export const Performance = {
  render: () => html`
  <section id="grid-performance-demo" nve-layout="column gap:md full" style="height: 500px;">
    <nve-button>show large grid</nve-button>
    <p nve-text="body muted">1000 rows, 4000 cells</p>
  </section>
  <script type="module">
    import '@nvidia-elements/core/grid/define.js';
    const section = document.getElementById('grid-performance-demo');
    const button = section.querySelector('nve-button');

    button.addEventListener('click', () => {
      const existingGrid = section.querySelector('nve-grid');
      if (existingGrid) {
        existingGrid.remove();
      } else {
        const grid = document.createElement('nve-grid');
        grid.style.setProperty('--scroll-height', '400px');
        grid.style.setProperty('max-width', '1024px');

        const header = document.createElement('nve-grid-header');
        const columns = new Array(4).fill('').map((_, i) => {
          const column = document.createElement('nve-grid-column');
          column.textContent = 'Column ' + i;
          return column;
        });

        const rows = new Array(1000).fill('').map((_, i) => {
          const row = document.createElement('nve-grid-row');
          new Array(4).fill('').forEach((_, c) => {
            const cell = document.createElement('nve-grid-cell');
            cell.textContent = 'Cell ' + i + '-' + c;
            row.appendChild(cell);
          });
          return row;
        });

        header.append(...columns);
        grid.appendChild(header);
        grid.append(...rows);
        section.appendChild(grid);
      }
    });
  </script>
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

/**
 * @summary Performance virtual scroll can be used to test the performance of the grid.
 * @tags test-case performance
 */
export const PerformanceVirtualScroll = {
  render: () => html`<grid-virtual-scroll-demo></grid-virtual-scroll-demo>`
};

/**
 * @summary Striped row styling for improved visual separation and data scanning, enhancing readability in large datasets with alternating row backgrounds.
 */
export const Stripe = {
  render: () => html`
<nve-grid stripe>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Grid can be nested in Cards for various UI patterns such as card
 * tab groups. Use the `container="flat"` attribute to enable proper styling of
 * the grid when nested within a card.
 */
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
      ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
    </nve-grid-header>
    ${Array(5).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
    `)}
  </nve-grid>
</nve-card>
  `
};

/**
 * @summary Grid integrated with tabs for organized data presentation, enabling multiple data views within a single interface for comprehensive information display.
 */
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
      ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
    </nve-grid-header>
    ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
    `)}
  </nve-grid>
</nve-card>
  `
};

/**
 * @summary Loading placeholder state for grid content, providing visual feedback during data fetching and improving perceived performance for users.
 */
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

/**
 * @summary Error state placeholder with retry functionality, providing user-friendly error handling and recovery options when data loading fails.
 */
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

/**
 * @summary Full-width grid container for maximum space utilization, providing edge-to-edge data display for comprehensive information presentation.
 */
export const Full = {
  render: () => html`
<nve-grid container="full" style="--scroll-height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
  <nve-grid-row>
    ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
  </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Flat container styling for minimal visual weight, providing subtle grid presentation that integrates seamlessly with surrounding content.
 */
export const Flat = {
  render: () => html`
<nve-grid container="flat" style="--scroll-height: 402px">
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(20).fill('').map((_, r) => html`
  <nve-grid-row>
    ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
  </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Different focusable element types within grid cells, demonstrating keyboard navigation and accessibility support for various interactive content.
 * @tags test-case
 */
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

/**
 * @summary Use a right aligned [panel](docs/elements/page/#panels) when
 * displaying advanced filtering or display settings for the grid. Item detail
 * panels should be open using a action button placed at the end of the grid row.
 */
export const PanelDetail = {
  render: () => html`
<nve-page id="grid-panel-demo" style="max-height: 500px;">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
  </nve-page-header>
  <section nve-layout="column gap:md pad:md full">
    <nve-grid>
      <nve-grid-header>
        ${Array(3).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column> `)}
        <nve-grid-column width="max-content" aria-label="details"></nve-grid-column>
      </nve-grid-header>
      ${Array(10).fill('').map((_, i) => html`
        <nve-grid-row ?selected=${i === 1}>
          ${Array(3).fill('').map((_, c) => html`<nve-grid-cell>cell ${i}-${c}</nve-grid-cell> `)}
          <nve-grid-cell>
            <nve-icon-button container="flat" icon-name="expand-details" value=${i} aria-label="view ${i}"></nve-icon-button>
          </nve-grid-cell>
        </nve-grid-row>
      `)}
    </nve-grid>
  </section>
  <nve-page-panel slot="right" size="sm" expanded closable>
    <nve-page-panel-header>
      <h3 nve-text="heading medium sm">Row 2 Details</h3>
    </nve-page-panel-header>
    <nve-page-panel-content>
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
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
<script type="module">
  const page = document.getElementById('grid-panel-demo');
  const grid = page.querySelector('nve-grid');
  const panel = page.querySelector('nve-page-panel');
  const rows = grid.querySelectorAll('nve-grid-row');
  const heading = page.querySelector('nve-page-panel-header h3');

  panel.addEventListener('close', () => {
    rows.forEach(row => row.selected = false);
    panel.hidden = true;
  });

  grid.addEventListener('click', (e) => {
    if (e.target.localName === 'nve-icon-button') {
      const row = e.target.closest('nve-grid-row');
      rows.forEach(row => row.selected = false);
      panel.hidden = false;
      heading.textContent = 'Row ' + e.target.value + ' Details';
      row.selected = !panel.hidden;
    }
  });
</script>
  `
};

/**
 * @summary Panel Grid can be used to display key value type data sets for
 * details of a given item in a collection.
 */
export const PanelGrid = {
  render() {
    return html`
    <nve-page style="max-height: 500px;">
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm"></nve-logo>
        <h2 slot="prefix">Infrastructure</h2>
      </nve-page-header>
      <section nve-layout="column gap:md pad:md full">
        page content
      </section>
      <nve-page-panel slot="right" expanded closable>
        <nve-page-panel-header>
          <h3 nve-text="heading medium sm">Recording</h3>
        </nve-page-panel-header>
        <nve-grid container="flat" stripe>
          <nve-grid-header>
            <nve-grid-column style="height: 0; overflow: hidden;">Key</nve-grid-column>
            <nve-grid-column style="height: 0; overflow: hidden;">Value</nve-grid-column>
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
      </nve-page-panel>
    </nve-page>
    `;
  }
}

/**
 * @summary Examples of invalid grid usage patterns for testing and documentation purposes, showing what not to do when implementing grids.
 * @tags anti-pattern
 */
export const InvalidDOM = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  <div>invalid</div>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      ${Array(r === 9 ? 4 : 5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
  <span>invalid</span>
</nve-grid>
  `
};


/**
 * @summary Examples of invalid grid usage patterns for testing and documentation purposes, showing what not to do when implementing grids.
 * @tags anti-pattern
 */
export const Audit = {
  render: () => html`
<nve-grid style="height: 450px">
  <div hidden></div>
  <nve-grid-header>
    <div hidden></div>
    ${Array(5).fill('').map((_, i) => html`<nve-grid-column>column ${i}</nve-grid-column>`)}
  </nve-grid-header>
  ${Array(10).fill('').map((_, r) => html`
    <nve-grid-row>
      <div hidden></div>
      ${Array(5).fill('').map((_, c) => html`<nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`)}
    </nve-grid-row>
  `)}
</nve-grid>
  `
};

/**
 * @summary Grid row sort can be implemented via the `nve-sort-button`.
 * The grid follows the [ARIA sort spec](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
 * and automatically sets the appropriate accessibility related attributes to convey the current sorting state.
 */
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
