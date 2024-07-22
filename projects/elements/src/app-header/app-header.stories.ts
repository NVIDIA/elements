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
  title: 'Elements/App Header/Examples',
  component: 'mlv-app-header',
};

export const Default = {
  render: () => {
    return html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <mlv-button slot="nav-items" selected>Link 1</mlv-button>
  <mlv-button slot="nav-items">Link 2</mlv-button>
  <mlv-icon-button icon-name="chat-bubble" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button interaction="emphasis" slot="nav-actions">EL</mlv-icon-button>
</mlv-app-header>
  `
  }
};

export const AppBadge = {
  render: () => html`
<mlv-app-header>
  <mlv-logo color="yellow-nova">Ab</mlv-logo>
  <h2 slot="title">My App Title</h2>
  <mlv-button slot="nav-items" selected>Link 1</mlv-button>
  <mlv-button slot="nav-items">Link 2</mlv-button>
  <mlv-icon-button icon-name="chat-bubble" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
</mlv-app-header>
  `
};

export const NavItems = {
  render: () => html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <h2 slot="title">Nav Items</h2>
  <mlv-button slot="nav-items">Link 1</mlv-button>
  <mlv-button slot="nav-items" selected>Link 2</mlv-button>
  <mlv-icon-button icon-name="more-actions" slot="nav-items"></mlv-icon-button>
</mlv-app-header>
  `
};

export const NavActions = {
  render: () => html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <h2 slot="title">Nav Actions</h2>
  <mlv-icon-button icon-name="chat-bubble" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
</mlv-app-header>
  `
};

export const Dropdown = {
  render: () => {
    return html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <mlv-button slot="nav-items" selected>Link 1</mlv-button>
  <mlv-button slot="nav-items">Link 2</mlv-button>
  <mlv-icon-button icon-name="chat-bubble" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
  <mlv-icon-button id="dropdown-btn-1" interaction="emphasis" slot="nav-actions">EL</mlv-icon-button>
  <mlv-dropdown anchor="dropdown-btn-1" trigger="dropdown-btn-1" hidden behavior-trigger>
    <mlv-menu>
      <mlv-menu-item><mlv-icon name="person"></mlv-icon> Menu Item</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="gear"></mlv-icon> Menu Item</mlv-menu-item>
      <mlv-menu-item><mlv-icon name="star"></mlv-icon> Menu Item</mlv-menu-item>
      <mlv-divider></mlv-divider>
      <mlv-menu-item><mlv-icon name="logout"></mlv-icon> Menu Item</mlv-menu-item>
    </mlv-menu>
  </mlv-dropdown>
</mlv-app-header>
  `
  }
};
