import { html } from 'lit';
import '@elements/elements/button-group/define.js';

export default {
  title: 'Elements/Button Group/Examples',
  component: 'nve-button-group',
};

export const Default = {
  render: () => html`
  <nve-button-group>
    <nve-icon-button pressed icon-name="split-vertical"></nve-icon-button>
    <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
    <nve-icon-button icon-name="split-none"></nve-icon-button>
  </nve-button-group>
  `
};

export const SingleSelect = {
  render: () => html`
  <nve-button-group behavior-select="single">
    <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
    <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
    <nve-icon-button icon-name="bars-4"></nve-icon-button>
  </nve-button-group>
  `
};
export const MultiSelect = {
  render: () => html`
  <nve-button-group behavior-select="multi">
    <nve-icon-button pressed icon-name="bold"></nve-icon-button>
    <nve-icon-button icon-name="italic"></nve-icon-button>
    <nve-icon-button icon-name="strikethrough"></nve-icon-button>
  </nve-button-group>
  `
};

export const Flat = {
  render: () => html`
  <nve-button-group interaction="flat">
    <nve-icon-button pressed icon-name="split-vertical"></nve-icon-button>
    <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
    <nve-icon-button icon-name="split-none"></nve-icon-button>
  </nve-button-group>
  `
};

export const Action = {
  render: () => html`
  <nve-button-group>
    <nve-icon-button icon-name="copy"></nve-icon-button>
    <nve-icon-button icon-name="add-comment"></nve-icon-button>
    <nve-icon-button icon-name="download"></nve-icon-button>
  </nve-button-group>
  `
};

export const ActionSplit = {
  render: () => html`
  <nve-button-group>
    <nve-button>button</nve-button>
    <nve-divider orientation="vertical"></nve-divider>
    <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
  </nve-button-group>
  `
};

export const ActionSplitRounded = {
  render: () => html`
  <nve-button-group interaction="rounded">
    <nve-button>button</nve-button>
    <nve-divider orientation="vertical"></nve-divider>
    <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
  </nve-button-group>
  `
};

export const Rounded = {
  render: () => html`
  <nve-button-group interaction="rounded" behavior-select="single">
    <nve-button pressed>All Time</nve-button>
    <nve-button>30 Days</nve-button>
    <nve-button>90 Days</nve-button>
  </nve-button-group>
  `
};

export const RoundedIcon = {
  render: () => html`
  <nve-button-group interaction="rounded" behavior-select="single">
    <nve-icon-button icon-name="table"></nve-icon-button>
    <nve-icon-button icon-name="image"></nve-icon-button>
  </nve-button-group>
  `
};