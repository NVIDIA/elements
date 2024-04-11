import { html } from 'lit';
import { IconButton } from '@elements/elements/icon-button';
import { spread } from '@elements/elements/internal';
import { ICON_NAMES } from '@elements/elements/icon';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'mlv-icon-button',
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
  render: (args: ArgTypes) => html`<mlv-icon-button ${spread(args)}></mlv-icon-button>`,
  args: { disabled: false, iconName: 'menu', interaction: '' }
};

export const Emphasize = { ...Default, args: { iconName: 'menu', interaction: 'emphasis' } };
export const Destructive = { ...Default, args: {  iconName: 'menu', interaction: 'destructive' } };
export const Flat = { ...Default, args: {  iconName: 'menu', interaction: 'flat' } };
export const Disabled = { ...Default, args: {  iconName: 'menu', disabled: true } };

export const Interactions = {
  render: () => html`
    <mlv-icon-button icon-name="menu"></mlv-icon-button>
    <mlv-icon-button interaction="emphasis" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button interaction="destructive" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button disabled icon-name="menu"></mlv-icon-button>
  `
}

export const Size = {
  render: () => html`
    <mlv-icon-button size="sm" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button icon-name="menu"></mlv-icon-button>
    <mlv-icon-button size="lg" icon-name="menu"></mlv-icon-button>
  `
}

export const FlatInteractions = {
  render: () => html`
    <mlv-icon-button container="flat" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button container="flat" interaction="emphasis" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button container="flat" interaction="destructive" icon-name="menu"></mlv-icon-button>
    <mlv-icon-button container="flat" icon-name="menu" disabled></mlv-icon-button>
  `
}

export const PressedToggle = {
  render: () => html`
  <div mlv-layout="row gap:sm pad-bottom:md">
    <mlv-icon-button icon-name="filter-stroke"></mlv-icon-button>
    <mlv-icon-button pressed icon-name="filter"></mlv-icon-button>
  </div>

  <div mlv-layout="row gap:sm">
    <mlv-icon-button icon-name="eye-hidden" container="flat" aria-label="show"></mlv-icon-button>
    <mlv-icon-button pressed icon-name="eye" container="flat" aria-label="hide"></mlv-icon-button>
  </div>
  `
}

export const SelectedFlat = {
  render: () => html`
    <mlv-icon-button selected icon-name="split-vertical" aria-label="split vertical" container="flat"></mlv-icon-button>
    <mlv-icon-button icon-name="split-horizontal" aria-label="split horizontal" container="flat"></mlv-icon-button>
    <mlv-icon-button icon-name="split-none" aria-label="preview" container="flat"></mlv-icon-button>
  `
}

export const CustomIcon = {
  render: () => html`
    <mlv-icon-button interaction="emphasis">ML</mlv-icon-button>
    <mlv-icon-button>🎉</mlv-icon-button>
    <mlv-icon-button>
      🔗 <a href="#" aria-label="custom icon button"></a>
    </mlv-icon-button>
  `
}

export const Link = {
  render: () => html`
    <mlv-icon-button icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </mlv-icon-button>
    <mlv-icon-button container="flat" icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </mlv-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light">
      <mlv-icon-button icon-name="menu"></mlv-icon-button>
      <mlv-icon-button interaction="emphasis" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button container="flat" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button disabled icon-name="menu"></mlv-icon-button>
    </div>
    <div mlv-theme="root dark">
      <mlv-icon-button icon-name="menu"></mlv-icon-button>
      <mlv-icon-button interaction="emphasis" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button container="flat" icon-name="menu"></mlv-icon-button>
      <mlv-icon-button disabled icon-name="menu"></mlv-icon-button>
    </div>
  `
}