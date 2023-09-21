import { html } from 'lit';
import '@elements/elements/tabs/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dot/define.js';
import '@elements/elements/icon/define.js';

export default {
  title: 'Elements/Tabs/Examples',
  component: 'mlv-tabs',
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
  <div mlv-theme="root light" mlv-layout="row gap:sm pad:md">
    <mlv-tabs behavior-select>
      <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
      <mlv-tabs-item>Tab 2</mlv-tabs-item>
      <mlv-tabs-item>Tab 3</mlv-tabs-item>
      <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
      <mlv-tabs-item>Tab 5</mlv-tabs-item>
    </mlv-tabs>
  </div>
  `
};

export const DarkTheme = {
  render: () => html`
  <div mlv-theme="root dark" mlv-layout="row gap:sm pad:md">
    <mlv-tabs behavior-select>
      <mlv-tabs-item selected> Tab 1</mlv-tabs-item>
      <mlv-tabs-item>Tab 2</mlv-tabs-item>
      <mlv-tabs-item>Tab 3</mlv-tabs-item>
      <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
      <mlv-tabs-item>Tab 5</mlv-tabs-item>
    </mlv-tabs>
  </div>
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

export const TabsWithDots = {
  render: () => html`
  <mlv-tabs behavior-select>
    <mlv-tabs-item>Tab 1</mlv-tabs-item>
    <mlv-tabs-item>Tab 2</mlv-tabs-item>
    <mlv-tabs-item>Tab 3 </mlv-tabs-item>
    <mlv-tabs-item selected>
      Tab 4
      <mlv-dot aria-label="10 notifications">10</mlv-dot>
    </mlv-tabs-item>
    <mlv-tabs-item>Tab 5</mlv-tabs-item>
  </mlv-tabs>
  `
};

export const VerticalTabs = {
  render: () => html`
  <mlv-tabs vertical behavior-select style="width: 250px">
    <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
    <mlv-tabs-item>Tab 2</mlv-tabs-item>
    <mlv-tabs-item>Tab 3</mlv-tabs-item>
    <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
    <mlv-tabs-item>Tab 5</mlv-tabs-item>
  </mlv-tabs>
  `
};

export const BorderlessVerticalTabs = {
  render: () => html`
  <mlv-tabs vertical borderless behavior-select style="width: 250px">
    <mlv-tabs-item>
      <mlv-icon name="gear"></mlv-icon> Tab 1
    </mlv-tabs-item>
    <mlv-tabs-item>
      <mlv-icon name="person"></mlv-icon> Tab 2
    </mlv-tabs-item>
    <mlv-tabs-item selected>
      <mlv-icon name="beaker"></mlv-icon> Tab 3
    </mlv-tabs-item>
    <mlv-tabs-item>
      <mlv-icon name="add-grid"></mlv-icon> Tab 4
    </mlv-tabs-item>
  </mlv-tabs>
  `
};

export const StatelessTabs = {
  render: () => html`
  <mlv-tabs>
    <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
    <mlv-tabs-item>Tab 2</mlv-tabs-item>
    <mlv-tabs-item>Tab 3</mlv-tabs-item>
    <mlv-tabs-item>Tab 4</mlv-tabs-item>
    <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
  </mlv-tabs>
  `
};

export const Links = {
  render: () => html`
  <mlv-tabs>
    <mlv-tabs-item selected>
      <a href="#">Tab 1</a>
    </mlv-tabs-item>
    <mlv-tabs-item>
      <a href="#">Tab 2</a>
    </mlv-tabs-item>
    <mlv-tabs-item>
      <a href="#">Tab 3</a>
    </mlv-tabs-item>
  </mlv-tabs>
  `
};
