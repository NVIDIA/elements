import { html } from 'lit';
import '@elements/elements/button/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/search/define.js';

export default {
  title: 'Elements/Menu/Examples',
  component: 'nve-menu',
};

export const Default = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item selected>item 2</nve-menu-item>
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
