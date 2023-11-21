import { html } from 'lit';
import '@elements/elements/button/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/card/define.js';

export default {
  title: 'Elements/Menu/Examples',
  component: 'mlv-menu',
};

export const Default = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item>item 1</mlv-menu-item>
    <mlv-menu-item>item 2</mlv-menu-item>
    <mlv-menu-item>item 3</mlv-menu-item>
    <mlv-menu-item>item 4</mlv-menu-item>
  </mlv-menu>
  `
};

export const Dropdown = {
  render: () => html`
  <mlv-button id="dropdown-menu-btn">dropdown</mlv-button>
  <mlv-dropdown anchor="dropdown-menu-btn">
    <mlv-menu>
      <mlv-menu-item><mlv-icon name="person"></mlv-icon> profile</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="gear"></mlv-icon> settings</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="star"></mlv-icon> favorites</mlv-menu-item>
      <mlv-divider></mlv-divider>
      <mlv-menu-item><mlv-icon name="logout"></mlv-icon> logout</mlv-menu-item>
    </mlv-menu>
  </mlv-dropdown>
  `
};

export const Selected = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item>item 1</mlv-menu-item>
    <mlv-menu-item selected>item 2</mlv-menu-item>
    <mlv-menu-item>item 3</mlv-menu-item>
    <mlv-menu-item>item 4</mlv-menu-item>
  </mlv-menu>
  `
};

export const Current = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item>item 1</mlv-menu-item>
    <mlv-menu-item current="page">item 2</mlv-menu-item>
    <mlv-menu-item>item 3</mlv-menu-item>
    <mlv-menu-item>item 4</mlv-menu-item>
  </mlv-menu>
  `
};

export const Disabled = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item>item 1</mlv-menu-item>
    <mlv-menu-item disabled>item 2</mlv-menu-item>
    <mlv-menu-item>item 3</mlv-menu-item>
    <mlv-menu-item>item 4</mlv-menu-item>
  </mlv-menu>
  `
};

export const Icons = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="person"></mlv-icon> profile</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="gear"></mlv-icon> settings</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="star"></mlv-icon> favorites</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="logout"></mlv-icon> logout</mlv-menu-item>
  </mlv-menu>
  `
};

export const Links = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="person"></mlv-icon><a href="#">profile</a></mlv-menu-item>
    <mlv-menu-item><mlv-icon name="gear"></mlv-icon> <a href="#">settings</a></mlv-menu-item>
    <mlv-menu-item><mlv-icon name="star"></mlv-icon> <a href="#">favorites</a></mlv-menu-item>
    <mlv-menu-item><mlv-icon name="logout"></mlv-icon> <a href="#">logout</a></mlv-menu-item>
  </mlv-menu>
  `
};

export const Complex = {
  render: () => html`
  <mlv-button id="dropdown-menu-btn">dropdown</mlv-button>
  <mlv-dropdown anchor="dropdown-menu-btn">
    <mlv-search rounded>
      <input type="search" placeholder="search tools" aria-label="search apps" />
    </mlv-search>
    <mlv-menu>
      <mlv-menu-item>
        <mlv-logo color="pink-rose" size="sm">Db</mlv-logo> Debugger
      </mlv-menu-item>
      <mlv-menu-item>
        <mlv-logo color="blue-cobalt" size="sm">TM</mlv-logo> Task Manager
      </mlv-menu-item>
      <mlv-menu-item>
        <mlv-logo color="yellow-nova" size="sm">CI</mlv-logo> CI Services
      </mlv-menu-item>
      <mlv-divider></mlv-divider>
      <mlv-menu-item>
        <mlv-logo size="sm"></mlv-logo> All Apps
      </mlv-menu-item>
    </mlv-menu>
  </mlv-dropdown>
  `
};

export const VerticalNavigationDrawer = {
  render: () => html`
  <div mlv-layout="column align:stretch full">
    <mlv-drawer position="right" size="sm" modal closable>
      <mlv-drawer-header>Applications</mlv-drawer-header>
      <mlv-drawer-content>
        <mlv-menu>
          <mlv-menu-item>item 1</mlv-menu-item>
          <mlv-menu-item current="page">item 2</mlv-menu-item>
          <mlv-menu-item>item 3</mlv-menu-item>
          <mlv-menu-item>item 4</mlv-menu-item>
        </mlv-menu>
      </mlv-drawer-content>
    </mlv-drawer>
    <mlv-card style="height: 400px">
      <mlv-card-header>
        <div slot="title">Header</div>
      </mlv-card-header>
      <mlv-card-content>
        <p mlv-text="body">Content</p>
      </mlv-card-content>
    </mlv-card>
  </div>
  `
};

export const VerticalNavigationPanel = {
  render: () => html`
  <div mlv-layout="row gap:md align:stretch">
    <mlv-card>
      <mlv-card-header>
        <div slot="title">Header</div>
      </mlv-card-header>
      <mlv-card-content>
        <p mlv-text="body">Content</p>
      </mlv-card-content>
    </mlv-card>
    <mlv-panel side="right" expanded closable style="max-width:280px; height:500px">
      <mlv-panel-header>
        <h3 slot="title">Applications</h3>
      </mlv-panel-header>
      <mlv-panel-content>
        <mlv-menu>
          <mlv-menu-item>item 1</mlv-menu-item>
          <mlv-menu-item current="page">item 2</mlv-menu-item>
          <mlv-menu-item>item 3</mlv-menu-item>
          <mlv-menu-item>item 4</mlv-menu-item>
        </mlv-menu>
      </mlv-panel-content>
    </mlv-panel>
  </div>
  `
};
