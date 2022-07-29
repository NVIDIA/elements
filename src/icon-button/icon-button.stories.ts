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
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

type ArgTypes = IconButton;

export const Default = {
  render: (args: ArgTypes) => html`<nve-icon-button ${spread(args)}></nve-icon-button>`,
  args: { disabled: false, name: 'analytics', interaction: '' }
};

export const Emphasize = { ...Default, args: { name: 'analytics', interaction: 'emphasize' } };
export const Destructive = { ...Default, args: {  name: 'analytics', interaction: 'destructive' } };
export const Ghost = { ...Default, args: {  name: 'analytics', interaction: 'ghost' } };
export const Disabled = { ...Default, args: {  name: 'analytics', disabled: true } };

export const Interactions = {
  render: () => html`
    <nve-icon-button name="analytics"></nve-icon-button>
    <nve-icon-button interaction="emphasize" name="analytics"></nve-icon-button>
    <nve-icon-button interaction="destructive" name="analytics"></nve-icon-button>
    <nve-icon-button interaction="ghost" name="analytics"></nve-icon-button>
    <nve-icon-button disabled name="analytics"></nve-icon-button>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="light">
      <nve-icon-button name="analytics"></nve-icon-button>
      <nve-icon-button interaction="emphasize" name="analytics"></nve-icon-button>
      <nve-icon-button interaction="destructive" name="analytics"></nve-icon-button>
      <nve-icon-button interaction="ghost" name="analytics"></nve-icon-button>
      <nve-icon-button disabled name="analytics"></nve-icon-button>
    </div>
    <div nve-theme="dark">
      <nve-icon-button name="analytics"></nve-icon-button>
      <nve-icon-button interaction="emphasize" name="analytics"></nve-icon-button>
      <nve-icon-button interaction="destructive" name="analytics"></nve-icon-button>
      <nve-icon-button interaction="ghost" name="analytics"></nve-icon-button>
      <nve-icon-button disabled name="analytics"></nve-icon-button>
    </div>
  `
}