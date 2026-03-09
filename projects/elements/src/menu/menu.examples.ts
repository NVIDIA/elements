import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/page/define.js';

export default {
  title: 'Elements/Menu',
  component: 'nve-menu',
};

/**
 * @summary Basic menu with simple text items for the default menu structure and styling.
 */
export const Default = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with keyboard navigation and ARIA disclosure pattern inside a dropdown. Use when menu items need accessible focus management and arrow key navigation.
 * @tags pattern
 */
export const Dropdown = {
  render: () => html`
  <nve-button popovertarget="dropdown-menu">dropdown</nve-button>
  <nve-dropdown id="dropdown-menu">
    <nve-menu>
      <nve-menu-item><nve-icon name="person"></nve-icon> profile</nve-menu-item>
      <nve-menu-item><nve-icon name="gear"></nve-icon> settings</nve-menu-item>
      <nve-menu-item><nve-icon name="star"></nve-icon> favorites</nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item><nve-icon name="logout"></nve-icon> logout</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};

/**
 * @summary Menu with a selected item showing the visual state for user-selected options.
 */
export const Selected = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item selected>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with a current page item showing the visual state for the active/current page in navigation.
 */
export const Current = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item current="page">item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary By default Menu will show a blue border on the selected item. You can change the border color by setting `--border-background` on the `<nve-menu-item>`
 * @tags test-case
 */
export const BorderBackground = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item current="page" style="--border-background: var(--nve-ref-color-brand-green-900);">item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with disabled items showing unavailable options while maintaining visual context.
 * @tags test-case
 */
export const Disabled = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item disabled>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu items with icons to add visual context and improve usability.
 */
export const Icons = {
  render: () => html`
  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon> profile</nve-menu-item>
    <nve-menu-item><nve-icon name="gear"></nve-icon> settings</nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> favorites</nve-menu-item>
    <nve-menu-item><nve-icon name="logout"></nve-icon> logout</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu items with links for navigation functionality within menu structures.
 */
export const Links = {
  render: () => html`
  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon><a href="#">profile</a></nve-menu-item>
    <nve-menu-item><nve-icon name="gear"></nve-icon> <a href="#">settings</a></nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> <a href="#">favorites</a></nve-menu-item>
    <nve-menu-item><nve-icon name="logout"></nve-icon> <a href="#">logout</a></nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu item features a default slot for content, along with a suffix slot for displaying elements such as keyboard shortcuts at the end of the menu item container.
 */
export const Suffix = {
  render: () => html`
  <nve-menu>
    <nve-menu-item><kbd  slot="suffix" nve-text="code flat">CMD + C</kbd></nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with constrained height showing scrollable behavior when content exceeds container limits.
 * @tags test-case
 */
export const Scroll = {
  render: () => html`
  <nve-menu style="--max-height: 150px">
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
    <nve-menu-item>item 5</nve-menu-item>
    <nve-menu-item>item 6</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Complex dropdown menu with search functionality and branded logos for application selection interfaces.
 * @tags pattern
 */
export const Complex = {
  render: () => html`
  <nve-button popovertarget="dropdown-menu">dropdown</nve-button>
  <nve-dropdown id="dropdown-menu">
    <nve-search rounded>
      <input type="search" placeholder="search tools" aria-label="search apps" />
    </nve-search>
    <nve-menu>
      <nve-menu-item>
        <nve-logo color="pink-rose" size="sm">Db</nve-logo> Debugger
      </nve-menu-item>
      <nve-menu-item>
        <nve-logo color="blue-cobalt" size="sm">TM</nve-logo> Task Manager
      </nve-menu-item>
      <nve-menu-item>
        <nve-logo color="yellow-nova" size="sm">CI</nve-logo> CI Services
      </nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item>
        <nve-logo size="sm"></nve-logo> All Apps
      </nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};

/**
 * @summary Navigation drawers overlay the existing page content. Navigation is for out of page context navigation.
 * @tags pattern
 */
export const VerticalNavigationDrawer = {
  render: () => html`
  <nve-page>
    <nve-page-header>
      <nve-logo slot="prefix" size="sm"></nve-logo>
      <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
    </nve-page-header>
    <main nve-layout="column gap:md pad:md">
      <nve-button popovertarget="menu-drawer">toggle drawer</nve-button>
    </main>
    <nve-drawer position="right" size="sm" modal closable id="menu-drawer">
      <nve-drawer-header>
      <h3 nve-text="heading">Drawer</h3>
      </nve-drawer-header>
      <nve-drawer-content>
        <nve-menu>
          <nve-menu-item>item 1</nve-menu-item>
          <nve-menu-item current="page">item 2</nve-menu-item>
          <nve-menu-item>item 3</nve-menu-item>
          <nve-menu-item>item 4</nve-menu-item>
        </nve-menu>
      </nve-drawer-content>
    </nve-drawer>
  </nve-page>
  `
};

/**
 * @summary Navigation panels are inline to the page and push the existing page content to the side. Navigation should be relevant and contextual to the page content.
 * @tags pattern
 */
export const VerticalNavigationPanel = {
  render: () => html`
<nve-page>
  <nve-page-header>
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  </nve-page-header>
  <nve-page-panel slot="left" expanded style="max-width:280px">
    <nve-page-panel-header>
      <h3 nve-text="heading">Drawer</h3>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <nve-menu>
        <nve-menu-item>item 1</nve-menu-item>
        <nve-menu-item current="page">item 2</nve-menu-item>
        <nve-menu-item>item 3</nve-menu-item>
        <nve-menu-item>item 4</nve-menu-item>
      </nve-menu>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:md pad:md">
    <p nve-text="body">Content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Menu item with tooltip integration showing how to provide extra context and warnings.
 * @tags pattern test-case
 */
export const MenuItemTooltip = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item popovertarget="menu-tooltip" id="menu-item-2">
      item 2
      <nve-icon id="menu-anchor" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon>
      <nve-tooltip anchor="menu-anchor" open-delay="2000" id="menu-tooltip">This is a warning tooltip</nve-tooltip>
    </nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
  </nve-menu>
  `
}

/**
 * @summary Menu items with danger status styling for destructive actions like delete or logout operations.
 */
export const DangerStatus = {
  render: () => html`
  <nve-menu>
    <nve-menu-item status="danger">default</nve-menu-item>
    <nve-menu-item status="danger" disabled>disabled</nve-menu-item>
    <nve-menu-item status="danger" selected>selected</nve-menu-item>
    <nve-menu-item status="danger" current="page">current</nve-menu-item>
    <nve-menu-item status="danger"><nve-icon name="gear"></nve-icon> icon left</nve-menu-item>
    <nve-menu-item status="danger">icon right <nve-icon id="warning-icon" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon></nve-menu-item>
  </nve-menu>
  `
}
