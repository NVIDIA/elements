import { html } from 'lit';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Tabs/Examples',
  component: 'nve-tabs',
};

export const Default = {
  render: () => html`
  <nve-tabs behavior-select>
    <nve-tabs-item selected>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3</nve-tabs-item>
    <nve-tabs-item>Tab 4</nve-tabs-item>
    <nve-tabs-item disabled>Disabled</nve-tabs-item>
  </nve-tabs>
  `
};

export const LightTheme = {
  render: () => html`
  <div nve-theme="root light" nve-layout="row gap:sm pad:md">
    <nve-tabs behavior-select>
      <nve-tabs-item selected>Tab 1</nve-tabs-item>
      <nve-tabs-item>Tab 2</nve-tabs-item>
      <nve-tabs-item>Tab 3</nve-tabs-item>
      <nve-tabs-item disabled>Disabled</nve-tabs-item>
      <nve-tabs-item>Tab 5</nve-tabs-item>
    </nve-tabs>
  </div>
  `
};

export const DarkTheme = {
  render: () => html`
  <div nve-theme="root dark" nve-layout="row gap:sm pad:md">
    <nve-tabs behavior-select>
      <nve-tabs-item selected> Tab 1</nve-tabs-item>
      <nve-tabs-item>Tab 2</nve-tabs-item>
      <nve-tabs-item>Tab 3</nve-tabs-item>
      <nve-tabs-item disabled>Disabled</nve-tabs-item>
      <nve-tabs-item>Tab 5</nve-tabs-item>
    </nve-tabs>
  </div>
  `
};

export const BorderlessTabs = {
  render: () => html`
  <nve-tabs borderless behavior-select>
    <nve-tabs-item selected>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3 </nve-tabs-item>
    <nve-tabs-item disabled>Disabled</nve-tabs-item>
    <nve-tabs-item>Tab 5</nve-tabs-item>
  </nve-tabs>
  `
};

export const BorderBackground = {
  render: () => html`
  <nve-tabs>
    <nve-tabs-item selected style="--border-background: var(--nve-ref-color-brand-green-900);">
      Tab 1
    </nve-tabs-item>
    <nve-tabs-item>
      Tab 2
    </nve-tabs-item>
    <nve-tabs-item>
      Tab 3
    </nve-tabs-item>
  </nve-tabs>
  `
};

export const TabsWithDots = {
  render: () => html`
  <nve-tabs behavior-select>
    <nve-tabs-item>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3 </nve-tabs-item>
    <nve-tabs-item selected>
      Tab 4
      <nve-dot aria-label="10 notifications">10</nve-dot>
    </nve-tabs-item>
    <nve-tabs-item>Tab 5</nve-tabs-item>
  </nve-tabs>
  `
};

export const VerticalTabs = {
  render: () => html`
  <nve-tabs vertical behavior-select style="width: 250px">
    <nve-tabs-item selected>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3</nve-tabs-item>
    <nve-tabs-item disabled>Disabled</nve-tabs-item>
    <nve-tabs-item>Tab 5</nve-tabs-item>
  </nve-tabs>
  `
};

export const BorderlessVerticalTabs = {
  render: () => html`
  <nve-tabs vertical borderless behavior-select style="width: 250px">
    <nve-tabs-item>
      <nve-icon name="gear"></nve-icon> Tab 1
    </nve-tabs-item>
    <nve-tabs-item>
      <nve-icon name="person"></nve-icon> Tab 2
    </nve-tabs-item>
    <nve-tabs-item selected>
      <nve-icon name="beaker"></nve-icon> Tab 3
    </nve-tabs-item>
    <nve-tabs-item>
      <nve-icon name="add-grid"></nve-icon> Tab 4
    </nve-tabs-item>
  </nve-tabs>
  `
};

export const StatelessTabs = {
  render: () => html`
  <nve-tabs>
    <nve-tabs-item selected>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3</nve-tabs-item>
    <nve-tabs-item>Tab 4</nve-tabs-item>
    <nve-tabs-item disabled>Disabled</nve-tabs-item>
  </nve-tabs>
  `
};

export const Links = {
  render: () => html`
  <nve-tabs>
    <nve-tabs-item selected>
      <a href="#">Tab 1</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">Tab 2</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">Tab 3</a>
    </nve-tabs-item>
  </nve-tabs>
  `
};
