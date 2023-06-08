import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import '@elements/elements/app-header/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/dropdown/define.js';

export default {
  title: 'Elements/App Header/Examples',
  component: 'mlv-app-header',
};

@customElement('app-header-default-demo')
class AppHeaderDefaultDemo extends LitElement {
  @state() activeId = '';

  render() {
    const ddownOneId = "default-dropdown-1";
    const ddownTwoId = "default-dropdown-2";

    return html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <mlv-button slot="nav-items" selected>Link 1</mlv-button>
  <mlv-button slot="nav-items">Link 2</mlv-button>
  <mlv-icon-button icon-name="assist" slot="nav-actions" @click=${() => alert('Thanks for clicking the feedback icon button!')}></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions" @click=${() => alert('Thanks for clicking the search icon button!')}></mlv-icon-button>
  <mlv-icon-button icon-name="app-switcher" id=${ddownOneId + '-btn'} slot="nav-actions" @click=${() => this.activeId = ddownOneId}></mlv-icon-button>
  <mlv-icon-button id=${ddownTwoId + '-btn'} @click=${() => this.activeId = ddownTwoId} interaction="emphasize" slot="nav-actions">EL</mlv-icon-button>
</mlv-app-header>
<mlv-dropdown id=${ddownOneId}
  anchor=${ddownOneId + '-btn'}
  .hidden=${this.activeId !== ddownOneId}
  @close=${() => this.activeId === ddownOneId ? this.activeId = '' : ''}>
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="user"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="settings"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="favorite-filled"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-divider></mlv-divider>
    <mlv-menu-item><mlv-icon name="logout"></mlv-icon> Menu Item</mlv-menu-item>
  </mlv-menu>
</mlv-dropdown>
<mlv-dropdown id=${ddownTwoId}
  anchor=${ddownTwoId + '-btn'}
  .hidden=${this.activeId !== ddownTwoId}
  @close=${() => this.activeId === ddownTwoId ? this.activeId = '' : ''} arrow>
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="user"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="settings"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="assist"></mlv-icon> Menu Item</mlv-menu-item>
  </mlv-menu>
</mlv-dropdown>
  `
  }
}

export const Default = {
  render: () => {
    return html`
<app-header-default-demo></app-header-default-demo>
  `
  }
};

export const AppBadge = {
  render: () => html`
<div mlv-theme="root">
  <mlv-app-header>
    <mlv-logo color="yellow-nova">Ab</mlv-logo>
    <h2 slot="title">My App Title</h2>
    <mlv-button slot="nav-items" selected>Link 1</mlv-button>
    <mlv-button slot="nav-items">Link 2</mlv-button>
    <mlv-icon-button icon-name="assist" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="app-switcher" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>
</div>
  `
};

export const NavItems = {
  render: () => html`
<div mlv-theme="root">
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Nav Items</h2>
    <mlv-button slot="nav-items">Link 1</mlv-button>
    <mlv-button slot="nav-items" selected>Link 2</mlv-button>
    <mlv-icon-button icon-name="additional-actions" slot="nav-items"></mlv-icon-button>
  </mlv-app-header>
</div>
  `
};

export const NavActions = {
  render: () => html`
<div mlv-theme="root">
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Nav Actions</h2>
    <mlv-icon-button icon-name="assist" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="app-switcher" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md">
  <mlv-app-header>
    <mlv-logo color="orange-pumpkin">Lt</mlv-logo>
    <h2 slot="title">Light Theme</h2>
    <mlv-button slot="nav-items">Link 1</mlv-button>
    <mlv-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md">
  <mlv-app-header>
    <mlv-logo color="orange-pumpkin">Dt</mlv-logo>
    <h2 slot="title">Dark Theme</h2>
    <mlv-button slot="nav-items">Link 1</mlv-button>
    <mlv-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>
</div>
  `
}
