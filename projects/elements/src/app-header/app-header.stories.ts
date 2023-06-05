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
  component: 'nve-app-header',
  parameters: { badges: ['alpha'] }
};

@customElement('app-header-default-demo')
class AppHeaderDefaultDemo extends LitElement {
  @state() activeId = '';

  render() {
    const ddownOneId = "default-dropdown-1";
    const ddownTwoId = "default-dropdown-2";

    return html`
<nve-app-header>
  <nve-logo></nve-logo>
  <nve-button slot="nav-items" selected>Link 1</nve-button>
  <nve-button slot="nav-items">Link 2</nve-button>
  <nve-icon-button icon-name="assist" slot="nav-actions" @click=${() => alert('Thanks for clicking the feedback icon button!')}></nve-icon-button>
  <nve-icon-button icon-name="search" slot="nav-actions" @click=${() => alert('Thanks for clicking the search icon button!')}></nve-icon-button>
  <nve-icon-button icon-name="app-switcher" id=${ddownOneId + '-btn'} slot="nav-actions" @click=${() => this.activeId = ddownOneId}></nve-icon-button>
  <nve-icon-button id=${ddownTwoId + '-btn'} @click=${() => this.activeId = ddownTwoId} interaction="emphasize" slot="nav-actions">EL</nve-icon-button>
</nve-app-header>
<nve-dropdown id=${ddownOneId}
  anchor=${ddownOneId + '-btn'}
  .hidden=${this.activeId !== ddownOneId}
  @close=${() => this.activeId === ddownOneId ? this.activeId = '' : ''}>
  <nve-menu>
    <nve-menu-item><nve-icon name="user"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="settings"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="favorite-filled"></nve-icon> Menu Item</nve-menu-item>
    <nve-divider></nve-divider>
    <nve-menu-item><nve-icon name="logout"></nve-icon> Menu Item</nve-menu-item>
  </nve-menu>
</nve-dropdown>
<nve-dropdown id=${ddownTwoId}
  anchor=${ddownTwoId + '-btn'}
  .hidden=${this.activeId !== ddownTwoId}
  @close=${() => this.activeId === ddownTwoId ? this.activeId = '' : ''} arrow>
  <nve-menu>
    <nve-menu-item><nve-icon name="user"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="settings"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="assist"></nve-icon> Menu Item</nve-menu-item>
  </nve-menu>
</nve-dropdown>
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
<div nve-theme="root">
  <nve-app-header>
    <nve-logo color="yellow-nova">Ab</nve-logo>
    <h2 slot="title">My App Title</h2>
    <nve-button slot="nav-items" selected>Link 1</nve-button>
    <nve-button slot="nav-items">Link 2</nve-button>
    <nve-icon-button icon-name="assist" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="app-switcher" slot="nav-actions"></nve-icon-button>
    <nve-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</nve-icon-button>
  </nve-app-header>
</div>
  `
};

export const NavItems = {
  render: () => html`
<div nve-theme="root">
  <nve-app-header>
    <nve-logo></nve-logo>
    <h2 slot="title">Nav Items</h2>
    <nve-button slot="nav-items">Link 1</nve-button>
    <nve-button slot="nav-items" selected>Link 2</nve-button>
    <nve-icon-button icon-name="additional-actions" slot="nav-items"></nve-icon-button>
  </nve-app-header>
</div>
  `
};

export const NavActions = {
  render: () => html`
<div nve-theme="root">
  <nve-app-header>
    <nve-logo></nve-logo>
    <h2 slot="title">Nav Actions</h2>
    <nve-icon-button icon-name="assist" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="app-switcher" slot="nav-actions"></nve-icon-button>
    <nve-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</nve-icon-button>
  </nve-app-header>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-app-header>
    <nve-logo color="orange-pumpkin">Lt</nve-logo>
    <h2 slot="title">Light Theme</h2>
    <nve-button slot="nav-items">Link 1</nve-button>
    <nve-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</nve-icon-button>
  </nve-app-header>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-app-header>
    <nve-logo color="orange-pumpkin">Dt</nve-logo>
    <h2 slot="title">Dark Theme</h2>
    <nve-button slot="nav-items">Link 1</nve-button>
    <nve-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</nve-icon-button>
  </nve-app-header>
</div>
  `
}
