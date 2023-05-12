import { html } from 'lit';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/menu/define.js';

export default {
  title: 'Elements/Menu/Examples',
  component: 'mlv-menu',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item>item 1</mlv-menu-item>
    <mlv-menu-item selected>item 2</mlv-menu-item>
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
      <mlv-menu-item><mlv-icon name="user"></mlv-icon> profile</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="settings"></mlv-icon> settings</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="favorite-filled"></mlv-icon> favorites</mlv-menu-item>
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
    <mlv-menu-item><mlv-icon name="user"></mlv-icon> profile</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="settings"></mlv-icon> settings</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="favorite-filled"></mlv-icon> favorites</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="logout"></mlv-icon> logout</mlv-menu-item>
  </mlv-menu>
  `
};

export const Links = {
  render: () => html`
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="user"></mlv-icon><a href="#">profile</a></mlv-menu-item>
    <mlv-menu-item><mlv-icon name="settings"></mlv-icon> <a href="#">settings</a></mlv-menu-item>
    <mlv-menu-item><mlv-icon name="favorite-filled"></mlv-icon> <a href="#">favorites</a></mlv-menu-item>
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
