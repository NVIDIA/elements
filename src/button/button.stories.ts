import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { Button } from '@elements/elements/button';
// import { withDesign } from 'storybook-addon-designs';

import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  generateFigmaEmbed,
  getValuesFromEnum,
  spread
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
  component: 'mlv-button',
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
    }
  }
};

type ArgTypes = Button & {
  iconName?: IconNames;
  iconSlotPlacement: IconSlotPlacements;
}

export const Default = {
  render: (args: ArgTypes) => html`<mlv-button ${spread(args)}>${args.textContent}</mlv-button>`,
  args: { textContent: 'Primary', disabled: false, variant: 'primary' }
};

export const Secondary = { ...Default, args: { textContent: 'Secondary', variant: 'secondary' } };
export const Tertiary = { ...Default, args: { textContent: 'Tertiary Button', variant: 'tertiary' } };
export const Destructive = { ...Default, args: { textContent: 'Destructive', variant: 'destructive' } };
export const Disabled = { ...Default, args: { textContent: 'Disabled Button', disabled: true } };

export const ButtonWithIcon = {
  render: (args: ArgTypes) => html`
  <mlv-button data-testid="button" ${spread(args)}>
    ${when(args.iconSlotPlacement === IconSlotPlacements.Leading,() => html`<mlv-icon name="${args.iconName}"></mlv-icon>`)}

      ${args.textContent}

    ${when(args.iconSlotPlacement === IconSlotPlacements.Trailing,() => html`<mlv-icon name="${args.iconName}"></mlv-icon>`)}
  </mlv-button>`,
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
