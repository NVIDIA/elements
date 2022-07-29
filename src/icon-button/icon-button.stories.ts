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
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

type ArgTypes = IconButton;

export const Default = {
  render: (args: ArgTypes) => html`<mlv-icon-button ${spread(args)}></mlv-icon-button>`,
  args: { disabled: false, name: 'analytics', interaction: '' }
};

export const Emphasize = { ...Default, args: { name: 'analytics', interaction: 'emphasize' } };
export const Destructive = { ...Default, args: {  name: 'analytics', interaction: 'destructive' } };
export const Ghost = { ...Default, args: {  name: 'analytics', interaction: 'ghost' } };
export const Disabled = { ...Default, args: {  name: 'analytics', disabled: true } };

export const Interactions = {
  render: () => html`
    <mlv-icon-button name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="emphasize" name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="destructive" name="analytics"></mlv-icon-button>
    <mlv-icon-button interaction="ghost" name="analytics"></mlv-icon-button>
    <mlv-icon-button disabled name="analytics"></mlv-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="light">
      <mlv-icon-button name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="emphasize" name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="ghost" name="analytics"></mlv-icon-button>
      <mlv-icon-button disabled name="analytics"></mlv-icon-button>
    </div>
    <div mlv-theme="dark">
      <mlv-icon-button name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="emphasize" name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="destructive" name="analytics"></mlv-icon-button>
      <mlv-icon-button interaction="ghost" name="analytics"></mlv-icon-button>
      <mlv-icon-button disabled name="analytics"></mlv-icon-button>
    </div>
  `
}