import { html } from 'lit';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'nve-icon-button'
};

export const Default = {
  render: () => html`
    <nve-icon-button icon-name="menu"></nve-icon-button>
  `
};

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

export const Pressed = {
  render: () => html`
    <nve-icon-button pressed icon-name="filter-stroke"></nve-icon-button>
    <nve-icon-button icon-name="filter"></nve-icon-button>
  `
}

export const PressedFlat = {
  render: () => html`
    <nve-icon-button pressed container="flat" icon-name="eye-hidden" aria-label="show"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="eye"  aria-label="hide"></nve-icon-button>
  `
}

export const PressedInline = {
  render: () => html`
    <nve-icon-button pressed container="inline" icon-name="eye-hidden" aria-label="show"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="eye" aria-label="hide"></nve-icon-button>
  `
}

export const Selected = {
  render: () => html`
  <nve-icon-button selected icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
  <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
  <nve-icon-button icon-name="split-none" aria-label="preview"></nve-icon-button>
  `
}

export const SelectedFlat = {
  render: () => html`
    <nve-icon-button selected container="flat" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-none" aria-label="preview"></nve-icon-button>
  `
}

export const SelectedInline = {
  render: () => html`
    <nve-icon-button selected container="inline" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-none" aria-label="preview"></nve-icon-button>
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
    <!-- do -->
    <nve-icon-button icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>

    <!-- don't -->
    <a href="#" aria-label="link to page">
      <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
    </a>
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