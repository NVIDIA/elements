import { html } from 'lit';
import { IconButton } from '@elements/elements/icon-button';
// import { withDesign } from 'storybook-addon-designs';

import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  generateFigmaEmbed,
  getValuesFromEnum,
  spread
} from '@elements/elements/internal';
import { ICON_NAMES } from '@elements/elements/icon';
import { ButtonVariants } from '@elements/elements/button';
import '@elements/elements/icon-button/define.js';

const figmaEmbedNodeId = '163%3A25';
const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Icon Button Component
`;

export default {
  title: 'Elements/Icon Button/Examples',
  component: 'mlv-icon-button',
  // decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover mlv-button',
    'mouseout mlv-button',
    'mousedown mlv-button',
    'click mlv-button'
  ]),
  argTypes: {
   variant: {
      control: 'inline-radio',
      options: getValuesFromEnum(ButtonVariants)
    },
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

type ArgTypes = IconButton & {
}

export const Default = {
  render: (args: ArgTypes) => html`<mlv-icon-button ${spread(args)}></mlv-icon-button>`,
  args: { disabled: false, name: 'analytics', variant: 'primary' }
};

export const Secondary = { ...Default, args: { name: 'analytics', variant: 'secondary' } };
export const Tertiary = { ...Default, args: {  name: 'analytics', variant: 'tertiary' } };
export const Destructive = { ...Default, args: {  name: 'analytics', variant: 'destructive' } };
export const Disabled = { ...Default, args: {  name: 'analytics', disabled: true } };

export const Interactions = {
  render: () => html`
    <mlv-icon-button variant="primary" name="analytics">primary</mlv-icon-button>
    <mlv-icon-button variant="secondary" name="analytics">secondary</mlv-icon-button>
    <mlv-icon-button variant="destructive" name="analytics">destructive</mlv-icon-button>
    <mlv-icon-button variant="tertiary" name="analytics">tertiary</mlv-icon-button>
    <mlv-icon-button disabled name="analytics"></mlv-icon-button>
  `
}