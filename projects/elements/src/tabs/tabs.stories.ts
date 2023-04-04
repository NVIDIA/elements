import { html } from 'lit';
import '@elements/elements/tabs/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dot/define.js';
import '@elements/elements/icon/define.js';

export default {
  title: 'Elements/Tabs/Examples',
  component: 'nve-tabs',
  parameters: { badges: ['alpha'] }
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
  <nve-card nve-theme="light" style="--border-radius: none">
    <nve-tabs behavior-select>
      <nve-tabs-item selected>Tab 1</nve-tabs-item>
      <nve-tabs-item>Tab 2</nve-tabs-item>
      <nve-tabs-item>Tab 3</nve-tabs-item>
      <nve-tabs-item disabled>Disabled</nve-tabs-item>
      <nve-tabs-item>Tab 5</nve-tabs-item>
    </nve-tabs>
  </nve-card>
  `
};

export const DarkTheme = {
  render: () => html`
  <nve-card nve-theme="dark" style="--border-radius: none">
    <nve-tabs behavior-select>
      <nve-tabs-item selected> Tab 1</nve-tabs-item>
      <nve-tabs-item>Tab 2</nve-tabs-item>
      <nve-tabs-item>Tab 3</nve-tabs-item>
      <nve-tabs-item disabled>Disabled</nve-tabs-item>
      <nve-tabs-item>Tab 5</nve-tabs-item>
    </nve-tabs>
  </nve-card>
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
  <nve-card style="--border-radius: none; width: 250px;">
    <nve-tabs vertical behavior-select>
      <nve-tabs-item selected>Tab 1</nve-tabs-item>
      <nve-tabs-item>Tab 2</nve-tabs-item>
      <nve-tabs-item>Tab 3</nve-tabs-item>
      <nve-tabs-item disabled>Disabled</nve-tabs-item>
      <nve-tabs-item>Tab 5</nve-tabs-item>
    </nve-tabs>
  </nve-card>
  `
};

export const BorderlessVerticalTabs = {
  render: () => html`
  <nve-card style="--border-radius: none; width: 250px;">
    <nve-tabs vertical borderless behavior-select>
      <nve-tabs-item>
        <nve-icon name="settings"></nve-icon> Tab 1
      </nve-tabs-item>
      <nve-tabs-item>
        <nve-icon name="user"></nve-icon> Tab 2
      </nve-tabs-item>
      <nve-tabs-item selected>
        <nve-icon name="beaker"></nve-icon> Tab 3
      </nve-tabs-item>
      <nve-tabs-item>
        <nve-icon name="dashboard"></nve-icon> Tab 4
      </nve-tabs-item>
    </nve-tabs>
  </nve-card>
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