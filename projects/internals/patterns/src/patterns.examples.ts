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
  title: 'Patterns/Examples',
  component: 'nve-internal-patterns'
};

/**
 * @summary Row of filled icon buttons with directional chevrons for pagination or step navigation controls.
 * @tags pattern test-case
 */
export const ButtonRowFilledIcon = {
  render: () => html`
  <div nve-layout="row gap:xs">
    <nve-icon-button icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

/**
 * @summary Row of flat icon buttons with minimal spacing for compact toolbar navigation controls.
 * @tags pattern test-case
 */
export const ButtonRowFlatIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-icon-button container="flat" icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

/**
 * @summary Compact row of small flat icon buttons for space-constrained toolbar or inline controls.
 * @tags pattern test-case
 */
export const ButtonRowSmallFlatIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-icon-button container="flat" size="sm" icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button container="flat" size="sm" icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button container="flat" size="sm" icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button container="flat" size="sm" icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

/**
 * @summary Row of flat text buttons with minimal spacing for secondary action groups.
 * @tags pattern test-case
 */
export const ButtonRowFlatText = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button container="flat">Button CTA</nve-button>
    <nve-button container="flat">Button CTA</nve-button>
  </div>
  `
};

/**
 * @summary Row of flat buttons with leading icons for labeled action toolbars like sync, revert, or add operations.
 * @tags pattern test-case
 */
export const ButtonRowFlatTextWithIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button container="flat">
      <nve-icon name="gear"></nve-icon>
      Sync MB
    </nve-button>
    <nve-button container="flat">
      <nve-icon name="undo"></nve-icon>
      Revert Timestamps
    </nve-button>
    <nve-button container="flat">
      <nve-icon name="add"></nve-icon>
      Add Event
    </nve-button>
  </div>
  `
};

/**
 * @summary Row of filled buttons with emphasis variant and overflow menu for primary action groups.
 * @tags pattern test-case
 */
export const ButtonRowFilledTextWithIcon = {
  render: () => html`
  <div nve-layout="row gap:xs">
    <nve-button>Button CTA</nve-button>
    <nve-button>Button CTA</nve-button>
    <nve-button interaction="emphasis">Button CTA</nve-button>
    <nve-icon-button icon-name="more-actions"></nve-icon-button>
  </div>
  `
};

/**
 * @summary Keyboard shortcut content example.
 * @tags pattern
 */
export const ShortcutFilled = {
  render: () => html`
    <kbd nve-text="code">CMD + C</kbd>
  `
};

/**
 * @summary Keyboard shortcut content example for inline text content.
 * @tags pattern test-case
 */
export const ShortcutFlat = {
  render: () => html`
    <kbd nve-text="code flat">CMD + C</kbd>
  `
};

/**
 * @summary Dropdown menu with keyboard shortcut hints displayed alongside menu items.
 * @tags pattern test-case
 */
export const ShortcutDropdown = {
  render: () => html`
  <nve-button popovertarget="code-menu">dropdown</nve-button>
  <nve-dropdown id="code-menu" hidden>
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
