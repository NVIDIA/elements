import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tooltip/define.js';

export default {
  title: 'Elements/Menu',
  component: 'nve-menu',
};

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

export const Dropdown = {
  render: () => html`
  <nve-button id="dropdown-menu-btn">dropdown</nve-button>
  <nve-dropdown anchor="dropdown-menu-btn">
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

export const Suffix = {
  render: () => html`
  <nve-menu>
    <nve-menu-item><kbd  slot="suffix" nve-text="code flat">CMD + C</kbd></nve-menu-item>
  </nve-menu>
  `
};

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

export const Complex = {
  render: () => html`
  <nve-button id="dropdown-menu-btn">dropdown</nve-button>
  <nve-dropdown anchor="dropdown-menu-btn">
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

export const VerticalNavigationDrawer = {
  render: () => html`
  <div nve-layout="column align:stretch full">
    <nve-drawer position="right" size="sm" modal closable>
      <nve-drawer-header>Applications</nve-drawer-header>
      <nve-drawer-content>
        <nve-menu>
          <nve-menu-item>item 1</nve-menu-item>
          <nve-menu-item current="page">item 2</nve-menu-item>
          <nve-menu-item>item 3</nve-menu-item>
          <nve-menu-item>item 4</nve-menu-item>
        </nve-menu>
      </nve-drawer-content>
    </nve-drawer>
    <nve-card style="height: 400px">
      <nve-card-header>
        <div slot="title">Header</div>
      </nve-card-header>
      <nve-card-content>
        <p nve-text="body">Content</p>
      </nve-card-content>
    </nve-card>
  </div>
  `
};

export const VerticalNavigationPanel = {
  render: () => html`
  <div nve-layout="row gap:md align:stretch">
    <nve-card>
      <nve-card-header>
        <div slot="title">Header</div>
      </nve-card-header>
      <nve-card-content>
        <p nve-text="body">Content</p>
      </nve-card-content>
    </nve-card>
    <nve-panel side="right" expanded closable style="max-width:280px; height:500px">
      <nve-panel-header>
        <h3 slot="title">Applications</h3>
      </nve-panel-header>
      <nve-panel-content>
        <nve-menu>
          <nve-menu-item>item 1</nve-menu-item>
          <nve-menu-item current="page">item 2</nve-menu-item>
          <nve-menu-item>item 3</nve-menu-item>
          <nve-menu-item>item 4</nve-menu-item>
        </nve-menu>
      </nve-panel-content>
    </nve-panel>
  </div>
  `
};

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

export const DangerStatus = {
  render: () => html`
  <div nve-layout="pad:lg">
    <nve-menu>
      <nve-menu-item status="danger">default</nve-menu-item>
      <nve-menu-item status="danger" disabled>disabled</nve-menu-item>
      <nve-menu-item status="danger" selected>selected</nve-menu-item>
      <nve-menu-item status="danger" current="page">current</nve-menu-item>
      <nve-menu-item status="danger"><nve-icon name="gear"></nve-icon> icon left</nve-menu-item>
      <nve-menu-item status="danger">icon right <nve-icon id="warning-icon" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon></nve-menu-item>
    </nve-menu>
  </div>
  `
}
