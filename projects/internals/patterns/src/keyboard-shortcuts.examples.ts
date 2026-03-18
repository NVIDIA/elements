import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/tabs/define.js';

export default {
  title: 'Patterns/Keyboard Shortcuts',
  component: 'nve-patterns'
};

/**
 * @summary Keyboard shortcut badge with filled styling for displaying key combinations. Use in help dialogs, onboarding tooltips, or documentation to communicate available shortcuts to users.
 * @tags pattern
 */
export const ShortcutFilled = {
  render: () => html`
    <kbd nve-text="code">CMD + C</kbd>
  `
};

/**
 * @summary Use for displaying keyboard shortcuts as inline text content.
 * @tags pattern test-case
 */
export const ShortcutFlat = {
  render: () => html`
    <kbd nve-text="code flat">CMD + C</kbd>
  `
};

/**
 * @summary Use for dropdown menus with keyboard shortcut hints displayed alongside menu items.
 * @tags pattern test-case
 */
export const ShortcutDropdown = {
  render: () => html`
  <nve-button popovertarget="code-menu">dropdown</nve-button>
  <nve-dropdown id="code-menu">
    <nve-menu>
      <nve-menu-item>
        <nve-icon name="edit"></nve-icon> Edit
      </nve-menu-item>
      <nve-menu-item>
        <div nve-layout="row align:space-between full">
          <span nve-layout="row gap:sm align:vertical-center">
            <nve-icon name="copy"></nve-icon> Copy
          </span>
          <kbd nve-text="code">CMD + C</kbd>
        </div>
      </nve-menu-item>
      <nve-menu-item>
        <nve-icon name="delete"></nve-icon> Delete
      </nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};
