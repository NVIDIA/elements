import { html } from 'lit';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import { spread } from '@nvidia-elements/core/internal';
import { ICON_NAMES } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'nve-icon-button',
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasis', 'destructive', 'flat']
    },
    iconName: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

type ArgTypes = IconButton;

export const Default = {
  render: (args: ArgTypes) => html`<nve-icon-button ${spread(args)}></nve-icon-button>`,
  args: { disabled: false, iconName: 'menu', interaction: '' }
};

export const Emphasize = { ...Default, args: { iconName: 'menu', interaction: 'emphasis' } };
export const Destructive = { ...Default, args: {  iconName: 'menu', interaction: 'destructive' } };
export const Flat = { ...Default, args: {  iconName: 'menu', interaction: 'flat' } };
export const Disabled = { ...Default, args: {  iconName: 'menu', disabled: true } };

export const Interactions = {
  render: () => html`
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button disabled icon-name="menu"></nve-icon-button>
  `
}

export const Size = {
  render: () => html`
    <nve-icon-button size="sm" icon-name="menu"></nve-icon-button>
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button size="lg" icon-name="menu"></nve-icon-button>
  `
}

export const FlatInteractions = {
  render: () => html`
    <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="menu" disabled></nve-icon-button>
  `
}

export const PressedToggle = {
  render: () => html`
  <div nve-layout="row gap:sm pad-bottom:md">
    <nve-icon-button icon-name="filter-stroke"></nve-icon-button>
    <nve-icon-button pressed icon-name="filter"></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button icon-name="eye-hidden" container="flat" aria-label="show"></nve-icon-button>
    <nve-icon-button pressed icon-name="eye" container="flat" aria-label="hide"></nve-icon-button>
  </div>
  `
}

export const SelectedFlat = {
  render: () => html`
    <nve-icon-button selected icon-name="split-vertical" aria-label="split vertical" container="flat"></nve-icon-button>
    <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal" container="flat"></nve-icon-button>
    <nve-icon-button icon-name="split-none" aria-label="preview" container="flat"></nve-icon-button>
  `
}

export const CustomIcon = {
  render: () => html`
    <nve-icon-button interaction="emphasis">ML</nve-icon-button>
    <nve-icon-button>🎉</nve-icon-button>
    <nve-icon-button>
      🔗 <a href="#" aria-label="custom icon button"></a>
    </nve-icon-button>
  `
}

export const Link = {
  render: () => html`
    <nve-icon-button icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
    <nve-icon-button container="flat" icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon-button icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
      <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
      <nve-icon-button disabled icon-name="menu"></nve-icon-button>
    </div>
    <div nve-theme="root dark">
      <nve-icon-button icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
      <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
      <nve-icon-button disabled icon-name="menu"></nve-icon-button>
    </div>
  `
}