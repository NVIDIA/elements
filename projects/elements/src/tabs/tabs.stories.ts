import { html } from 'lit';
import '@elements/elements/tabs/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dot/define.js';
import '@elements/elements/icon/define.js';

export default {
  title: 'Elements/Tabs/Examples',
  component: 'mlv-tabs',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
  <mlv-tabs behavior-select>
    <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
    <mlv-tabs-item>Tab 2</mlv-tabs-item>
    <mlv-tabs-item>Tab 3</mlv-tabs-item>
    <mlv-tabs-item>Tab 4</mlv-tabs-item>
    <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
  </mlv-tabs>
  `
};

export const LightTheme = {
  render: () => html`
  <mlv-card mlv-theme="light" style="--border-radius: none">
    <mlv-tabs behavior-select>
      <mlv-tabs-item selected>
        Tab 1
        <mlv-dot status="scheduled"></mlv-dot>
      </mlv-tabs-item>
      <mlv-tabs-item>Tab 2</mlv-tabs-item>
      <mlv-tabs-item>Tab 3</mlv-tabs-item>
      <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
      <mlv-tabs-item>Tab 5</mlv-tabs-item>
    </mlv-tabs>
  </mlv-card>
  `
};

export const DarkTheme = {
  render: () => html`
  <mlv-card mlv-theme="dark" style="--border-radius: none">
    <mlv-tabs behavior-select>
      <mlv-tabs-item selected>
        Tab 1
        <mlv-dot status="starting"></mlv-dot>
      </mlv-tabs-item>
      <mlv-tabs-item>Tab 2</mlv-tabs-item>
      <mlv-tabs-item>Tab 3</mlv-tabs-item>
      <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
      <mlv-tabs-item>Tab 5</mlv-tabs-item>
    </mlv-tabs>
  </mlv-card>
  `
};

export const VerticalTabs = {
  render: () => html`
  <mlv-card style="--border-radius: none; width: 250px;">
    <mlv-tabs vertical behavior-select>
      <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
      <mlv-tabs-item>Tab 2</mlv-tabs-item>
      <mlv-tabs-item>Tab 3</mlv-tabs-item>
      <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
      <mlv-tabs-item>Tab 5</mlv-tabs-item>
    </mlv-tabs>
  </mlv-card>
  `
};

export const BorderlessTabs = {
  render: () => html`
  <mlv-tabs borderless behavior-select>
    <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
    <mlv-tabs-item>Tab 2</mlv-tabs-item>
    <mlv-tabs-item>Tab 3 </mlv-tabs-item>
    <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
    <mlv-tabs-item>Tab 5</mlv-tabs-item>
  </mlv-tabs>
  `
};



export const BorderlessVerticalTabs = {
  render: () => html`
  <mlv-card style="--border-radius: none; width: 250px;">
    <mlv-tabs vertical borderless behavior-select>
      <mlv-tabs-item>
        <mlv-icon status="accent" name="settings"></mlv-icon> Tab 1
      </mlv-tabs-item>
      <mlv-tabs-item>
        <mlv-icon status="success" name="user"></mlv-icon> Tab 2
      </mlv-tabs-item>
      <mlv-tabs-item selected>
        <mlv-icon status="warning" name="beaker"></mlv-icon> Tab 3
      </mlv-tabs-item>
      <mlv-tabs-item>
        <mlv-icon status="danger" name="dashboard"></mlv-icon> Tab 4
      </mlv-tabs-item>
    </mlv-tabs>
  </mlv-card>
  `
};