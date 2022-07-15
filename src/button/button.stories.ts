import { html } from 'lit';
import { when } from 'lit/directives/when.js';
// import { withDesign } from 'storybook-addon-designs';

import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  generateFigmaEmbed,
  getValuesFromEnum
} from '@elements/elements/internal';
import { IconNames, ICON_NAMES } from '@elements/elements/icon';
import { ButtonVariants, IconSlotPlacements } from '@elements/elements/button';
import '@elements/elements/button/define.js';

const figmaEmbedNodeId = '163%3A25';
const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Button Component
`;

export default {
  title: 'MagLev Elements/Atoms/Button',
  component: 'nve-button',
  // decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover nve-button',
    'mouseout nve-button',
    'mousedown nve-button',
    'click nve-button'
  ]),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: getValuesFromEnum(ButtonVariants)
    }
  }
};

interface ArgTypes {
  label?: string;
  variant?: ButtonVariants;
  textContent?: string;
  disabled?: boolean;
  iconName?: IconNames;
  iconSlotPlacement: IconSlotPlacements;
}

export const Default = {
  render: (args: ArgTypes) => html` <nve-button
    data-testid="button"
    variant=${args.variant}
    ?disabled=${args.disabled}
  >
    ${args.textContent}
  </nve-button>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { textContent: 'Primary', disabled: false, variant: 'primary' }
};

export const Secondary = { ...Default, args: { textContent: 'Secondary', variant: 'secondary' } };
export const Tertiary = { ...Default, args: { textContent: 'Tertiary Button', variant: 'tertiary' } };
export const Destructive = { ...Default, args: { textContent: 'Destructive', variant: 'destructive' } };
export const Disabled = { ...Default, args: { textContent: 'Disabled Button', disabled: true } };

export const ButtonWithIcon = {
  render: (args: ArgTypes) => html`
  <nve-button
    data-testid="button"
    variant=${args.variant}
    ?disabled=${args.disabled}
  >
    ${when(args.iconSlotPlacement === IconSlotPlacements.Leading,() => html`<nve-icon name="${args.iconName}"></nve-icon>`)}

      ${args.textContent}

    ${when(args.iconSlotPlacement === IconSlotPlacements.Trailing,() => html`<nve-icon name="${args.iconName}"></nve-icon>`)}
  </nve-button>`,
  args: { textContent: 'Button Icon', disabled: false, variant: 'primary', iconName: 'navigate-to', iconSlotPlacement: 'trailing' },
  argTypes: {
    iconName: {
      control: 'select',
      options: ICON_NAMES
    },
    iconSlotPlacement: {
      control: 'inline-radio',
      options: getValuesFromEnum(IconSlotPlacements)
    },
  }
};