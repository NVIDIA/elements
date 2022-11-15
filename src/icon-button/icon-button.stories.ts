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
  component: 'nve-icon-button',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover nve-button',
    'mouseout nve-button',
    'mousedown nve-button',
    'click nve-button'
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
  render: (args: ArgTypes) => html`<nve-icon-button ${spread(args)}></nve-icon-button>`,
  args: { disabled: false, iconName: 'analytics', interaction: '' }
};

export const Emphasize = { ...Default, args: { iconName: 'analytics', interaction: 'emphasize' } };
export const Destructive = { ...Default, args: {  iconName: 'analytics', interaction: 'destructive' } };
export const Ghost = { ...Default, args: {  iconName: 'analytics', interaction: 'ghost' } };
export const Disabled = { ...Default, args: {  iconName: 'analytics', disabled: true } };

export const Interactions = {
  render: () => html`
    <nve-icon-button icon-name="analytics"></nve-icon-button>
    <nve-icon-button interaction="emphasize" icon-name="analytics"></nve-icon-button>
    <nve-icon-button interaction="destructive" icon-name="analytics"></nve-icon-button>
    <nve-icon-button disabled icon-name="analytics"></nve-icon-button>
  `
}

export const GhostInteractions = {
  render: () => html`
    <nve-icon-button interaction="ghost" icon-name="analytics"></nve-icon-button>
    <nve-icon-button interaction="ghost-emphasize" icon-name="analytics"></nve-icon-button>
    <nve-icon-button interaction="ghost-destructive" icon-name="analytics"></nve-icon-button>
    <nve-icon-button interaction="ghost" icon-name="analytics" disabled></nve-icon-button>
  `
}

export const Link = {
  render: () => html`
    <nve-icon-button icon-name="analytics">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
    <nve-icon-button interaction="ghost" icon-name="analytics">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon-button icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="emphasize" icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="ghost" icon-name="analytics"></nve-icon-button>
      <nve-icon-button disabled icon-name="analytics"></nve-icon-button>
    </div>
    <div nve-theme="root dark">
      <nve-icon-button icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="emphasize" icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="destructive" icon-name="analytics"></nve-icon-button>
      <nve-icon-button interaction="ghost" icon-name="analytics"></nve-icon-button>
      <nve-icon-button disabled icon-name="analytics"></nve-icon-button>
    </div>
  `
}