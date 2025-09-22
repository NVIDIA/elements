import { html } from 'lit';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/menu/define.js';

export default {
  title: 'Elements/Breadcrumb',
  component: 'nve-breadcrumb',
};

 
export const Default = {
  render: () => html`
    <nve-breadcrumb>
      <nve-button><a href="#" target="_self">Item 1</a></nve-button>
      <nve-button><a href="#" target="_self">Item 2</a></nve-button>
      <nve-button><a href="#" target="_self">Item 3</a></nve-button>
      <span>You Are Here</span>
    </nve-breadcrumb>
  `
};

export const WithIconButton = {
  render: () => html`
    <nve-breadcrumb>
      <nve-icon-button icon-name="home" size="sm"><a href="#" target="_self" aria-label="link to first page"></a></nve-icon-button>
      <nve-button><a href="#" target="_self">Item 1</a></nve-button>
      <nve-button><a href="#" target="_self">Item 2</a></nve-button>
      <span>You Are Here</span>
    </nve-breadcrumb>
  `
};

export const WithMenu = {
  render: () => html`
<nve-breadcrumb>
  <nve-icon-button popovertarget="more-links" icon-name="more-actions"></nve-icon-button>
  <nve-button><a href="#" target="_self">Item 4</a></nve-button>
  <nve-button><a href="#" target="_self">Item 5</a></nve-button>
  <span>You Are Here</span>
</nve-breadcrumb>
<nve-dropdown id="more-links">
  <nve-menu>
    <nve-menu-item>Item 1</nve-menu-item>
    <nve-menu-item>Item 2</nve-menu-item>
    <nve-menu-item>Item 3</nve-menu-item>
  </nve-menu>
</nve-dropdown>
  `
};

export const LightTheme = {
  render: () => html`
    <div nve-theme="root light" nve-layout="pad:lg">
      <nve-breadcrumb>
        <nve-icon-button icon-name="home" size="sm"><a href="#" target="_self" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#" target="_self">Item 1</a></nve-button>
        <nve-button><a href="#" target="_self">Item 2</a></nve-button>
        <span>You Are Here</span>
      </nve-breadcrumb>
    </div>
  `
}

export const DarkTheme = {
  render: () => html`
    <div nve-theme="root dark" nve-layout="pad:lg">
      <nve-breadcrumb>
        <nve-icon-button icon-name="home" size="sm"><a href="#" target="_self" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#" target="_self">Item 1</a></nve-button>
        <nve-button><a href="#" target="_self">Item 2</a></nve-button>
        <span>You Are Here</span>
      </nve-breadcrumb>
    </div>
  `
}
 
