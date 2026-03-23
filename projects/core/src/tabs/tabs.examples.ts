import { html } from 'lit';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Tabs',
  component: 'nve-tabs',
};

/**
 * @summary Basic tabs component for organizing content into selectable sections with disabled state support.
 */
export const Default = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Borderless tabs variant for minimal visual styling without border emphasis.
 * @tags test-case
 */
export const BorderlessTabs = {
  render: () => html`
<nve-tabs borderless behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3 </nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with custom border background styling for brand-specific visual customization.
 * @tags test-case
 */
export const BorderBackground = {
  render: () => html`
<nve-tabs behavior-select style="--indicator-background: var(--nve-ref-color-brand-green-900); --indicator-border-radius: none;">
  <nve-tabs-item selected>
    Tab 1
  </nve-tabs-item>
  <nve-tabs-item>
    Tab 2
  </nve-tabs-item>
  <nve-tabs-item>
    Tab 3
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with notification dots for indicating unread content or alerts within tab sections.
 */
export const WithDots = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3 </nve-tabs-item>
  <nve-tabs-item selected>
    Tab 4
    <nve-dot aria-label="10 notifications">10</nve-dot>
  </nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Vertical tabs layout for sidebar navigation and vertical content organization patterns.
 */
export const VerticalTabs = {
  render: () => html`
<nve-tabs vertical behavior-select style="width: 250px">
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Borderless vertical tabs with icons for enhanced visual navigation and minimal styling.
 * @tags test-case
 */
export const BorderlessVerticalTabs = {
  render: () => html`
<nve-tabs vertical borderless behavior-select style="width: 250px">
  <nve-tabs-item>
    <nve-icon name="gear"></nve-icon> Tab 1
  </nve-tabs-item>
  <nve-tabs-item>
    <nve-icon name="person"></nve-icon> Tab 2
  </nve-tabs-item>
  <nve-tabs-item selected>
    <nve-icon name="beaker"></nve-icon> Tab 3
  </nve-tabs-item>
  <nve-tabs-item>
    <nve-icon name="add-grid"></nve-icon> Tab 4
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Stateless tabs for external state management without built-in selection behavior.
 */
export const StatelessTabs = {
  render: () => html`
<nve-tabs>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with link navigation for routing-based tab switching and page navigation.
 */
export const Links = {
  render: () => html`
<nve-tabs>
  <nve-tabs-item selected>
    <a href="./docs/elements/tabs/#links">Tab 1</a>
  </nve-tabs-item>
  <nve-tabs-item>
    <a href="./docs/elements/tabs/#links">Tab 2</a>
  </nve-tabs-item>
  <nve-tabs-item>
    <a href="/docs/elements/tabs/#links">Tab 3</a>
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with overflow handling for managing large numbers of tabs with scrolling behavior.
 * @tags test-case
 */
export const OverflowTabs = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
  <nve-tabs-item>Tab 6</nve-tabs-item>
  <nve-tabs-item>Tab 7</nve-tabs-item>
  <nve-tabs-item>Tab 8</nve-tabs-item>
  <nve-tabs-item>Tab 9</nve-tabs-item>
  <nve-tabs-item>Tab 10</nve-tabs-item>
  <nve-tabs-item>Tab 11</nve-tabs-item>
  <nve-tabs-item>Tab 12</nve-tabs-item>
  <nve-tabs-item>Tab 13</nve-tabs-item>
  <nve-tabs-item>Tab 14</nve-tabs-item>
  <nve-tabs-item>Tab 15</nve-tabs-item>
  <nve-tabs-item>Tab 16</nve-tabs-item>
  <nve-tabs-item>Tab 17</nve-tabs-item>
  <nve-tabs-item>Tab 18</nve-tabs-item>
  <nve-tabs-item>Tab 19</nve-tabs-item>
  <nve-tabs-item>Tab 20</nve-tabs-item>
</nve-tabs>`,
};

/**
 * @summary Tabs selection state and a popover working together without any CSS Anchor Positioning collisions.
 * @tags test-case
 */
export const WithTooltips = {
  render: () => html`
<nve-tooltip id="tab1">Tooltip for tab 1</nve-tooltip>
<nve-tooltip id="tab2">Tooltip for tab 2</nve-tooltip>
<nve-tooltip id="tab3">Tooltip for tab 3</nve-tooltip>
<nve-tabs behavior-select>
  <nve-tabs-item selected popovertarget="tab1">Tab 1</nve-tabs-item>
  <nve-tabs-item popovertarget="tab2">Tab 2</nve-tabs-item>
  <nve-tabs-item id="tab-item-3" popovertarget="tab3">Tab 3</nve-tabs-item>
</nve-tabs>`
};
