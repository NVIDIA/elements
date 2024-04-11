import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
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

@customElement('app-header-default-demo')
class AppHeaderDefaultDemo extends LitElement {
  @state() private activeId = '';

  render() {
    const ddownOneId = "default-dropdown-1";
    const ddownTwoId = "default-dropdown-2";

    return html`
<mlv-app-header>
  <mlv-logo></mlv-logo>
  <mlv-button slot="nav-items" selected>Link 1</mlv-button>
  <mlv-button slot="nav-items">Link 2</mlv-button>
  <mlv-icon-button icon-name="chat-bubble" slot="nav-actions" @click=${() => alert('Thanks for clicking the feedback icon button!')}></mlv-icon-button>
  <mlv-icon-button icon-name="search" slot="nav-actions" @click=${() => alert('Thanks for clicking the search icon button!')}></mlv-icon-button>
  <mlv-icon-button icon-name="switch-apps" id=${ddownOneId + '-btn'} slot="nav-actions" @click=${() => this.activeId = ddownOneId}></mlv-icon-button>
  <mlv-icon-button id=${ddownTwoId + '-btn'} @click=${() => this.activeId = ddownTwoId} interaction="emphasis" slot="nav-actions">EL</mlv-icon-button>
</mlv-app-header>
<mlv-dropdown id=${ddownOneId}
  anchor=${ddownOneId + '-btn'}
  .hidden=${this.activeId !== ddownOneId}
  @close=${() => this.activeId === ddownOneId ? this.activeId = '' : ''}>
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="person"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="gear"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="star"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-divider></mlv-divider>
    <mlv-menu-item><mlv-icon name="logout"></mlv-icon> Menu Item</mlv-menu-item>
  </mlv-menu>
</mlv-dropdown>
<mlv-dropdown id=${ddownTwoId}
  anchor=${ddownTwoId + '-btn'}
  .hidden=${this.activeId !== ddownTwoId}
  @close=${() => this.activeId === ddownTwoId ? this.activeId = '' : ''} arrow>
  <mlv-menu>
    <mlv-menu-item><mlv-icon name="person"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="gear"></mlv-icon> Menu Item</mlv-menu-item>
    <mlv-menu-item><mlv-icon name="chat-bubble"></mlv-icon> Menu Item</mlv-menu-item>
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
<div>
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
</div>
  `
};

export const NavItems = {
  render: () => html`
<div>
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Nav Items</h2>
    <mlv-button slot="nav-items">Link 1</mlv-button>
    <mlv-button slot="nav-items" selected>Link 2</mlv-button>
    <mlv-icon-button icon-name="more-actions" slot="nav-items"></mlv-icon-button>
  </mlv-app-header>
</div>
  `
};

export const NavActions = {
  render: () => html`
<div>
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Nav Actions</h2>
    <mlv-icon-button icon-name="chat-bubble" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="search" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
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
    <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
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
    <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>
</div>
  `
}
