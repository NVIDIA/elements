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
  component: 'patterns'
};

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

export const ButtonRowFlatText = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button container="flat">Button CTA</nve-button>
    <nve-button container="flat">Button CTA</nve-button>
  </div>
  `
};

export const ButtonRowFlatTextWithIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button container="flat">
      <nve-icon name="gear" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Sync MB
    </nve-button>
    <nve-button container="flat">
      <nve-icon name="undo" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Revert Timestamps
    </nve-button>
    <nve-button container="flat">
      <nve-icon name="add" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Add Event
    </nve-button>
  </div>
  `
};

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

export const Trend = {
  render: () => html`
  <div nve-layout="column gap:sm">
    <label nve-text="label medium sm muted">Label</label>
    <div nve-layout="row gap:sm align:vertical-center">
      <h3 nve-text="heading semibold lg">198,298</h3>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
    <label nve-text="label medium sm muted">Since last week</label>
  </div>
  `
};

export const TrendTopBadge = {
  render: () => html`
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <label nve-text="label medium sm muted">Since last week</label>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
    <div nve-layout="column gap:sm">
      <h3 nve-text="heading semibold lg">198,298</h3>
      <label nve-text="label medium sm muted">Label</label>
    </div>
  </div>
  `
};

export const TrendBottomBadge = {
  render: () => html`
  <div nve-layout="column gap:xs">
    <div nve-layout="column gap:sm">
      <label nve-text="label medium sm muted">Label</label>
      <h3 nve-text="heading semibold lg">198,298</h3>
    </div>
    <div nve-layout="row gap:sm align:vertical-center">
      <label nve-text="label medium sm muted">Since last week</label>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
  </div>
  `
};

export const ShortcutFilled = {
  render: () => html`
    <kbd nve-text="code">CMD + C</kbd>
  `
};

export const ShortcutFlat = {
  render: () => html`
    <kbd nve-text="code flat">CMD + C</kbd>
  `
};

export const ShortcutDropdown = {
  render: () => html`
  <nve-button id="code-menu">dropdown</nve-button>

  <nve-dropdown anchor="code-menu" trigger="code-menu" hidden>
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


  <script>
    const dropdown = document.querySelector('nve-dropdown');
    dropdown.addEventListener('open', () => dropdown.hidden = false);
    dropdown.addEventListener('close', () => dropdown.hidden = true);
  </script>
  `
  };
