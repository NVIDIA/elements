import { html } from 'lit';
import '@elements/elements/button-group/define.js';
import '@elements/elements/divider/define.js';

export default {
  title: 'Elements/Button Group/Examples',
  component: 'mlv-button-group',
};

export const Default = {
  render: () => html`
  <mlv-button-group>
    <mlv-icon-button pressed icon-name="split-vertical"></mlv-icon-button>
    <mlv-icon-button icon-name="split-horizontal"></mlv-icon-button>
    <mlv-icon-button icon-name="split-none"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const SingleSelect = {
  render: () => html`
  <mlv-button-group behavior-select="single">
    <mlv-icon-button pressed icon-name="bars-3-bottom-left"></mlv-icon-button>
    <mlv-icon-button icon-name="bars-3-bottom-right"></mlv-icon-button>
    <mlv-icon-button icon-name="bars-4"></mlv-icon-button>
  </mlv-button-group>
  `
};
export const MultiSelect = {
  render: () => html`
  <mlv-button-group behavior-select="multi">
    <mlv-icon-button pressed icon-name="bold" size="sm"></mlv-icon-button>
    <mlv-icon-button icon-name="italic" size="sm"></mlv-icon-button>
    <mlv-icon-button icon-name="strikethrough" size="sm"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const Flat = {
  render: () => html`
  <mlv-button-group container="flat">
    <mlv-icon-button pressed icon-name="split-vertical"></mlv-icon-button>
    <mlv-icon-button icon-name="split-horizontal"></mlv-icon-button>
    <mlv-icon-button icon-name="split-none"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const Action = {
  render: () => html`
  <mlv-button-group>
    <mlv-icon-button icon-name="copy"></mlv-icon-button>
    <mlv-icon-button icon-name="add-comment"></mlv-icon-button>
    <mlv-icon-button icon-name="download"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const ActionSplit = {
  render: () => html`
  <mlv-button-group>
    <mlv-button>button</mlv-button>
    <mlv-divider orientation="vertical"></mlv-divider>
    <mlv-icon-button icon-name="caret" size="sm" direction="down"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const ActionSplitRounded = {
  render: () => html`
  <mlv-button-group container="rounded">
    <mlv-button>button</mlv-button>
    <mlv-divider orientation="vertical"></mlv-divider>
    <mlv-icon-button icon-name="caret" size="sm" direction="down"></mlv-icon-button>
  </mlv-button-group>
  `
};

export const Rounded = {
  render: () => html`
  <mlv-button-group container="rounded" behavior-select="single">
    <mlv-button pressed>All Time</mlv-button>
    <mlv-button>30 Days</mlv-button>
    <mlv-button>90 Days</mlv-button>
  </mlv-button-group>
  `
};

export const RoundedIcon = {
  render: () => html`
  <mlv-button-group container="rounded" behavior-select="single">
    <mlv-icon-button icon-name="table"></mlv-icon-button>
    <mlv-icon-button icon-name="image"></mlv-icon-button>
  </mlv-button-group>
  `
};