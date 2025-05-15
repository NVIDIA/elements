import { html } from 'lit';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';

export default {
  title: 'Elements/Dropdown Group',
  component: 'nve-dropdown-group',
};

export const Default = {
  render: () => html`
    <nve-button popovertarget="menu-1">menu</nve-button>
    <nve-dropdown-group>
      <nve-dropdown id="menu-1">
        <nve-menu>
          <nve-menu-item popovertarget="menu-2">
            item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
          </nve-menu-item>
          <nve-menu-item>item 1-2</nve-menu-item>
          <nve-menu-item>item 1-3</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="menu-2" position="right">
        <nve-menu>
          <nve-menu-item>item 2-1</nve-menu-item>
          <nve-menu-item popovertarget="menu-3">
            item 2-2 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
          </nve-menu-item>
          <nve-menu-item>item 2-3</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="menu-3" position="right">
        <nve-menu>
          <nve-menu-item>item 3-1</nve-menu-item>
          <nve-menu-item>item 3-2</nve-menu-item>
          <nve-menu-item>item 3-3</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </nve-dropdown-group>
  `
};

export const WithDisabledItems = {
  render: () => html`
    <nve-button popovertarget="disabled-menu-1">Disabled Items</nve-button>
    <nve-dropdown-group>
      <nve-dropdown id="disabled-menu-1">
        <nve-menu>
          <nve-menu-item popovertarget="disabled-menu-2">
            item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
          </nve-menu-item>
          <nve-menu-item disabled>item 1-2</nve-menu-item>
          <nve-menu-item>item 1-3</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="disabled-menu-2" position="right">
        <nve-menu>
          <nve-menu-item>item 2-1</nve-menu-item>
          <nve-menu-item disabled>item 2-2</nve-menu-item>
          <nve-menu-item popovertarget="disabled-menu-3">
            item 2-3 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="disabled-menu-3" position="right">
        <nve-menu>
          <nve-menu-item>item 3-1</nve-menu-item>
          <nve-menu-item disabled>item 3-2</nve-menu-item>
          <nve-menu-item>item 3-3</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </nve-dropdown-group>
  `
};

export const WithIcons = {
  render: () => html`
    <nve-button popovertarget="icon-menu-1">Icons Menu</nve-button>
    <nve-dropdown-group>
      <nve-dropdown id="icon-menu-1">
        <nve-menu>
          <nve-menu-item popovertarget="icon-menu-2">
            <nve-icon name="folder" size="sm"></nve-icon> item 1-1 <nve-icon name="caret" direction="right" size="sm"></nve-icon>
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="image" size="sm"></nve-icon> item 1-2
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="video-camera" size="sm"></nve-icon> item 1-3
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="icon-menu-2" position="right">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="document" size="sm"></nve-icon> item 2-1
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="document" size="sm"></nve-icon> item 2-2
          </nve-menu-item>
          <nve-menu-item popovertarget="icon-menu-3">
            <nve-icon name="terminal" size="sm"></nve-icon> item 2-3 <nve-icon name="caret" direction="right" size="sm"></nve-icon>
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="icon-menu-3" position="right">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="terminal" size="sm"></nve-icon> item 3-1
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="terminal" size="sm"></nve-icon> item 3-2
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="terminal" size="sm"></nve-icon> item 3-3
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </nve-dropdown-group>
  `
};

export const WithMoreIcons = {
  render: () => html`
    <nve-button popovertarget="more-icon-menu-1">More Icons</nve-button>
    <nve-dropdown-group>
      <nve-dropdown id="more-icon-menu-1">
        <nve-menu>
          <nve-menu-item popovertarget="more-icon-menu-2">
            <nve-icon name="person" size="sm"></nve-icon> item 1-1 <nve-icon name="caret" direction="right" size="sm"></nve-icon>
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="arrow" direction="right" size="sm"></nve-icon> item 1-2
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="star" size="sm"></nve-icon> item 1-3
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="more-icon-menu-2" position="right">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="flag" size="sm"></nve-icon> item 2-1
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="home" size="sm"></nve-icon> item 2-2
          </nve-menu-item>
          <nve-menu-item popovertarget="more-icon-menu-3">
            <nve-icon name="gear" size="sm"></nve-icon> item 2-3 <nve-icon name="chevron" direction="right" size="sm"></nve-icon>
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
      <nve-dropdown id="more-icon-menu-3" position="right">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="dot" size="sm"></nve-icon> item 3-1
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="exclamation-mark" size="sm"></nve-icon> item 3-2
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="edit" size="sm"></nve-icon> item 3-3
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </nve-dropdown-group>
  `
};