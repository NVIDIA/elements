import { html } from 'lit';
import '@elements/elements/tabs/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dot/define.js';
import '@elements/elements/icon/define.js';

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

export const TabsWithDots = {
  render: () => html`
  <nve-tabs behavior-select>
    <nve-tabs-item>Tab 1</nve-tabs-item>
    <nve-tabs-item>Tab 2</nve-tabs-item>
    <nve-tabs-item>Tab 3 </nve-tabs-item>
    <nve-tabs-item selected>
      Tab 4
      <nve-dot status="warning" aria-label="10 notifications">10</nve-dot>
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