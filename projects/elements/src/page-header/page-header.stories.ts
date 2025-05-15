import { html } from 'lit';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Page Header',
  component: 'nve-page-header',
};

export const Default = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button selected container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="chat-bubble"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="search"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps"></nve-icon-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
</nve-page-header>
  `
  }
};

/**
 * @description Use dropdowns and menus to allow progressive disclosure of additional navigation or global user actions.
 */
export const DropdownMenu = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button selected container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm" popovertarget="page-header-dropdown">EL</nve-icon-button>
</nve-page-header>
<nve-dropdown position="bottom" id="page-header-dropdown">
  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="gear"></nve-icon> Menu Item</nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> Menu Item</nve-menu-item>
    <nve-divider></nve-divider>
    <nve-menu-item><nve-icon name="logout"></nve-icon> Menu Item</nve-menu-item>
  </nve-menu>
</nve-dropdown>
  `
  }
};

/**
 * @description Use a Icon Button to represent collapsible top level navigation, optimal for mobile or constrained viewport sizes.
 */
export const MenuButton = {
  render: () => {
    return html`
<nve-page-header>
  <nve-icon-button slot="prefix" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button selected container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="chat-bubble"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="search"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps"></nve-icon-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
</nve-page-header>
  `
  }
};

/**
 * @description Use the Logo element when representing an application that is part of a suite of applicaitons in a given problem domain.
 */
export const AppLogo = {
  render: () => html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm" color="yellow-nova">AV</nve-logo>
  <h2 slot="prefix">Infrastructure</h2>
  <nve-button container="flat" selected><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="chat-bubble"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="search"></nve-icon-button>
  <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps"></nve-icon-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
</nve-page-header>
  `
};

export const PrefixNavigation = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button container="flat"><a href="#">Features</a></nve-button>
  <nve-button container="flat"><a href="#">Guide</a></nve-button>
  <nve-button container="flat"><a href="#">Docs</a></nve-button>
  <nve-button container="flat"><a href="#">Teams</a></nve-button>
  <nve-button slot="suffix" container="flat"><a href="#">Login</a></nve-button>
  <nve-button slot="suffix" interaction="emphasis" size="sm"><a href="#">Start Building</a></nve-button>
</nve-page-header>
  `
  }
};

export const CenterNavigation = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <div nve-layout="row align:center gap:xxs full">
    <nve-button container="flat"><a href="#">Features</a></nve-button>
    <nve-button container="flat"><a href="#">Guide</a></nve-button>
    <nve-button container="flat"><a href="#">Docs</a></nve-button>
    <nve-button container="flat"><a href="#">Teams</a></nve-button>
  </div>
  <nve-button slot="suffix" container="flat"><a href="#">Login</a></nve-button>
  <nve-button slot="suffix" interaction="emphasis" size="sm"><a href="#">Start Building</a></nve-button>
</nve-page-header>
  `
  }
};

export const SuffixNavigation = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button slot="suffix" container="flat"><a href="#">Features</a></nve-button>
  <nve-button slot="suffix" container="flat"><a href="#">Guide</a></nve-button>
  <nve-button slot="suffix" container="flat"><a href="#">Docs</a></nve-button>
  <nve-button slot="suffix" container="flat"><a href="#">Teams</a></nve-button>
  <nve-button slot="suffix" container="flat"><a href="#">Login</a></nve-button>
  <nve-button slot="suffix" interaction="emphasis" size="sm"><a href="#">Start Building</a></nve-button>
</nve-page-header>
  `
  }
};

export const Search = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-search slot="suffix" rounded style="width: 220px">
    <input type="search" />
  </nve-search>
  <nve-button slot="suffix" container="flat"><a href="#">Login</a></nve-button>
</nve-page-header>
  `
  }
};

export const UserDetail = {
  render: () => {
    return html`
<nve-page-header>
  <nve-logo slot="prefix" size="sm"></nve-logo>
  <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  <nve-button container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">GH</nve-icon-button>
  <div slot="suffix" nve-layout="column gap:md">
    <p nve-text="label sm trim:none">Grace Hopper</p>
    <p nve-text="body sm muted trim:none nowrap">infra-0087ef65-19e80</p>
  </div>
</nve-page-header>
  `
  }
};