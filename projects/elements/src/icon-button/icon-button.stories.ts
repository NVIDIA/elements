import { html } from 'lit';
import { IconButton } from '@elements/elements/icon-button';
import { ComponentStatuses, generateDefaultStoryParameters, spread } from '@elements/elements/internal';
import { ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/icon-button/define.js';

const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Icon Button Component
`;

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'mlv-icon-button',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover mlv-button',
    'mouseout mlv-button',
    'mousedown mlv-button',
    'click mlv-button'
  ]),
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasize', 'destructive', 'ghost']
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
  args: { disabled: false, iconName: 'analytics', interaction: '' }
};

export const Emphasize = { ...Default, args: { iconName: 'analytics', interaction: 'emphasize' } };
export const Destructive = { ...Default, args: {  iconName: 'analytics', interaction: 'destructive' } };
export const Ghost = { ...Default, args: {  iconName: 'analytics', interaction: 'ghost' } };
export const Disabled = { ...Default, args: {  iconName: 'analytics', disabled: true } };

export const Interactions = {
  render: () => html`
    <mlv-icon-button icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="emphasize" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="destructive" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button disabled icon-name="analytics"></mlv-icon-button>
  `
}

export const Size = {
  render: () => html`
    <mlv-icon-button size="sm" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button size="lg" icon-name="analytics"></mlv-icon-button>
  `
}

export const GhostInteractions = {
  render: () => html`
    <mlv-icon-button interaction="ghost" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="ghost-emphasize" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="ghost-destructive" icon-name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="ghost" icon-name="analytics" disabled></mlv-icon-button>
  `
}

export const Link = {
  render: () => html`
    <mlv-icon-button icon-name="analytics">
      <a href="#" aria-label="link to page"></a>
    </mlv-icon-button>
    <mlv-icon-button interaction="ghost" icon-name="analytics">
      <a href="#" aria-label="link to page"></a>
    </mlv-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light">
      <mlv-icon-button icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="emphasize" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="ghost" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button disabled icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="inverse" icon-name="analytics"></mlv-icon-button>
    </div>
    <div mlv-theme="root dark">
      <mlv-icon-button icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="emphasize" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="ghost" icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button disabled icon-name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="inverse" icon-name="analytics"></mlv-icon-button>
    </div>
  `
}