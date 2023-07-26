import { html } from 'lit';
import { IconButton } from '@elements/elements/icon-button';
import { spread } from '@elements/elements/internal';
import { ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'nve-icon-button',
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasize', 'destructive', 'flat']
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

export const Emphasize = { ...Default, args: { iconName: 'menu', interaction: 'emphasize' } };
export const Destructive = { ...Default, args: {  iconName: 'menu', interaction: 'destructive' } };
export const Flat = { ...Default, args: {  iconName: 'menu', interaction: 'flat' } };
export const Disabled = { ...Default, args: {  iconName: 'menu', disabled: true } };

export const Interactions = {
  render: () => html`
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="emphasize" icon-name="menu"></nve-icon-button>
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
    <nve-icon-button interaction="flat" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="flat-emphasize" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="flat-destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="flat" icon-name="menu" disabled></nve-icon-button>
  `
}

export const PressedToggle = {
  render: () => html`
  <div nve-layout="row gap:sm pad-bottom:md">
    <nve-icon-button icon-name="filter-stroke"></nve-icon-button>
    <nve-icon-button pressed icon-name="filter"></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button icon-name="eye-hidden" interaction="flat" aria-label="show"></nve-icon-button>
    <nve-icon-button pressed icon-name="eye" interaction="flat" aria-label="hide"></nve-icon-button>
  </div>
  `
}

export const SelectedFlat = {
  render: () => html`
    <nve-icon-button selected icon-name="split-vertical" aria-label="split vertical" interaction="flat"></nve-icon-button>
    <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal" interaction="flat"></nve-icon-button>
    <nve-icon-button icon-name="split-none" aria-label="preview" interaction="flat"></nve-icon-button>
  `
}

export const CustomIcon = {
  render: () => html`
    <nve-icon-button interaction="emphasize">ML</nve-icon-button>
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
    <nve-icon-button interaction="flat" icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon-button icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="emphasize" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="flat" icon-name="menu"></nve-icon-button>
      <nve-icon-button disabled icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="inverse" icon-name="menu"></nve-icon-button>
    </div>
    <div nve-theme="root dark">
      <nve-icon-button icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="emphasize" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="flat" icon-name="menu"></nve-icon-button>
      <nve-icon-button disabled icon-name="menu"></nve-icon-button>
      <nve-icon-button interaction="inverse" icon-name="menu"></nve-icon-button>
    </div>
  `
}