import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs';

import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  generateFigmaEmbed,
  getValuesFromEnum
} from '@elements/elements/internal';
import { IconNames, ICON_NAMES } from '@elements/elements/icon';
import { ButtonVariants, IconPlacements } from '@elements/elements/button';
import '@elements/elements/button/define.js';

const figmaEmbedNodeId = '163%3A25';
const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Button Component
`;

export default {
  title: 'MagLev Elements/Atoms/Button',
  component: 'mlv-button',
  decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover mlv-button',
    'mouseout mlv-button',
    'mousedown mlv-button',
    'click mlv-button'
  ]),
  argTypes: {
    icon: {
      control: 'select',
      options: ICON_NAMES
    },
    variant: {
      control: 'text',
      options: getValuesFromEnum(ButtonVariants)
    },
    iconplacement: {
      control: 'inline-radio',
      options: getValuesFromEnum(IconPlacements)
    }
  }
};

interface ArgTypes {
  label?: string;
  variant?: ButtonVariants;
  content?: string;
  disabled?: boolean;
  icon?: IconNames;
  iconplacement?: IconPlacements;
}

export const Default = {
  render: (args: ArgTypes) => html` <mlv-button
    data-testid="button"
    variant=${args.variant}
    ?disabled=${args.disabled}
    icon=${args.icon}
    iconplacement=${args.iconplacement}
  >
    ${args.content}
  </mlv-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { content: 'Primary', disabled: false, variant: 'primary' }
};

export const Secondary = { ...Default, args: { content: 'Secondary', variant: 'secondary' } };
export const Tertiary = { ...Default, args: { content: 'Tertiary Button', variant: 'tertiary' } };
export const Destructive = { ...Default, args: { content: 'Destructive', variant: 'destructive' } };
export const Disabled = { ...Default, args: { content: 'Disabled Button', disabled: true } };
export const ButtonWithIcon = { ...Default, args: { content: 'Copy', icon: 'copy', iconplacement: 'trailing' } };

export const IconButton = { ...Default, args: { icon: 'copy', iconplacement: IconPlacements.IconOnly } };
