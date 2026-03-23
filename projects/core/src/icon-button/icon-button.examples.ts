import { html } from 'lit';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Icon Button',
  component: 'nve-icon-button'
};

/**
 * @summary Basic icon button for compact actions and toolbar controls with minimal visual footprint.
 */
export const Default = {
  render: () => html`
    <nve-icon-button icon-name="menu"></nve-icon-button>
  `
};

/**
 * @summary Icon buttons with different interaction styles including default, emphasis, destructive, and disabled states.
 */
export const Interactions = {
  render: () => html`
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button disabled icon-name="menu"></nve-icon-button>
  `
}

/**
 * @summary Icon buttons in different sizes (small, medium, large) for varying contexts and visual hierarchy.
 * @tags test-case
 */
export const Size = {
  render: () => html`
    <nve-icon-button size="sm" icon-name="menu"></nve-icon-button>
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button size="lg" icon-name="menu"></nve-icon-button>
  `
}

/**
 * @summary Flat container icon buttons with interaction styles for minimal visual weight in dense toolbars.
 * @tags test-case
 */
export const FlatInteractions = {
  render: () => html`
    <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="menu" disabled></nve-icon-button>
  `
}

/**
 * @summary Icon buttons with pressed state for toggle functionality like filters or visibility controls.
 */
export const Pressed = {
  render: () => html`
    <nve-icon-button pressed icon-name="filter-stroke"></nve-icon-button>
    <nve-icon-button icon-name="filter"></nve-icon-button>
  `
}

/**
 * @summary Flat icon buttons with pressed state for low-emphasis toggles and compact toggle controls.
 * @tags test-case
 */
export const PressedFlat = {
  render: () => html`
    <nve-icon-button pressed container="flat" icon-name="eye-hidden" aria-label="show"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="eye"  aria-label="hide"></nve-icon-button>
  `
}

/**
 * @summary Inline icon buttons with pressed state for minimal toggle controls within text or content flows.
 * @tags test-case
 */
export const PressedInline = {
  render: () => html`
    <nve-icon-button pressed container="inline" icon-name="eye-hidden" aria-label="show"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="eye" aria-label="hide"></nve-icon-button>
  `
}

/**
 * @summary Icon buttons with selected state for mutually exclusive options like view modes or layout choices.
 */
export const Selected = {
  render: () => html`
  <nve-icon-button selected icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
  <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
  <nve-icon-button icon-name="split-none" aria-label="preview"></nve-icon-button>
  `
}

/**
 * @summary Flat icon buttons with selected state for low-emphasis mode selection in compact toolbars.
 * @tags test-case
 */
export const SelectedFlat = {
  render: () => html`
    <nve-icon-button selected container="flat" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-none" aria-label="preview"></nve-icon-button>
  `
}

/**
 * @summary Inline icon buttons with selected state for minimal mode selection within content flows.
 * @tags test-case
 */
export const SelectedInline = {
  render: () => html`
    <nve-icon-button selected container="inline" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-none" aria-label="preview"></nve-icon-button>
  `
}

/**
 * @summary Icon buttons with custom content like text initials, emojis, or symbols for personalized actions.
 * @tags test-case
 */
export const CustomIcon = {
  render: () => html`
    <nve-icon-button interaction="emphasis">ML</nve-icon-button>
    <nve-icon-button>🎉</nve-icon-button>
    <nve-icon-button>
      🔗 <a href="#" aria-label="custom icon button"></a>
    </nve-icon-button>
  `
}

/**
 * @summary Proper implementation of icon buttons with links, showing correct and incorrect anchor placement patterns.
 */
export const Link = {
  render: () => html`
<nve-icon-button icon-name="menu">
  <a href="#" aria-label="link to page"></a>
</nve-icon-button>`
}

/**
 * @summary Icon buttons styled for light and dark themes with all interaction states for theme consistency.
 * @tags test-case
 */
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