import { html } from 'lit';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/dropdown/define.js';

export default {
  title: 'Elements/App Header',
  component: 'nve-app-header',
};

/* eslint-disable @nvidia-elements/lint/no-deprecated-tags */

export const Default = {
  render: () => {
    return html`
<nve-app-header>
  <nve-logo></nve-logo>
  <nve-button slot="nav-items" selected>Link 1</nve-button>
  <nve-button slot="nav-items">Link 2</nve-button>
  <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  <nve-icon-button interaction="emphasis" slot="nav-actions">EL</nve-icon-button>
</nve-app-header>
  `
  }
};

export const AppBadge = {
  render: () => html`
<nve-app-header>
  <nve-logo color="yellow-nova">Ab</nve-logo>
  <h2 slot="title">My App Title</h2>
  <nve-button slot="nav-items" selected>Link 1</nve-button>
  <nve-button slot="nav-items">Link 2</nve-button>
  <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  <nve-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</nve-icon-button>
</nve-app-header>
  `
};

export const NavItems = {
  render: () => html`
<nve-app-header>
  <nve-logo></nve-logo>
  <h2 slot="title">Nav Items</h2>
  <nve-button slot="nav-items">Link 1</nve-button>
  <nve-button slot="nav-items" selected>Link 2</nve-button>
  <nve-icon-button icon-name="more-actions" slot="nav-items"></nve-icon-button>
</nve-app-header>
  `
};

export const NavActions = {
  render: () => html`
<nve-app-header>
  <nve-logo></nve-logo>
  <h2 slot="title">Nav Actions</h2>
  <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  <nve-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</nve-icon-button>
</nve-app-header>
  `
};

export const Dropdown = {
  render: () => {
    return html`
<nve-app-header>
  <nve-logo></nve-logo>
  <nve-button slot="nav-items" selected>Link 1</nve-button>
  <nve-button slot="nav-items">Link 2</nve-button>
  <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  <nve-icon-button popovertarget="dropdown-1" interaction="emphasis" slot="nav-actions">EL</nve-icon-button>
  <nve-dropdown id="dropdown-1">
    <nve-menu>
      <nve-menu-item><nve-icon name="person"></nve-icon> Menu Item</nve-menu-item>
      <nve-menu-item><nve-icon name="gear"></nve-icon> Menu Item</nve-menu-item>
      <nve-menu-item><nve-icon name="star"></nve-icon> Menu Item</nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item><nve-icon name="logout"></nve-icon> Menu Item</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
</nve-app-header>
  `
  }
};
