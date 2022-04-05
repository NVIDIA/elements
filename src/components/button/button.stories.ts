import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { userEvent, within } from '@storybook/testing-library';

import { awaitTimeout, ComponentStatuses, generateDefaultStoryParameters, generateFigmaEmbed, getValuesFromEnum } from '../../util/storybook-utils';
import { ICON_NAMES } from '../../generated-icons/icon-names';
import { IconNames } from '../icon/icon';
import { Button, ButtonVariants, IconPlacements }  from './button';
const _components = { Button };

const figmaEmbedNodeId = '163%3A25';
const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'dev';
const description =  `
  ## The MagLev Button Component
`;

export default {
  title: 'MagLev Elements/Atoms/Button',
  component: 'mlv-button',
  decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, ['mouseover mlv-button', 'mouseout mlv-button', 'mousedown mlv-button', 'click mlv-button']),
  argTypes: { // ******* TODO: Track this github issue https://github.com/storybookjs/storybook/issues/17063 (bug in 6.4 that resets radio/select args to !undefined)
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
  label?: string
  variant?: ButtonVariants;
  content?: string;
  disabled?: boolean;
  icon?: IconNames;
  iconplacement?: IconPlacements;
}

export const Default = {
  render: (args: ArgTypes) => html`
  <mlv-button data-testid="button" variant=${args.variant} ?disabled=${args.disabled} icon=${args.icon} iconplacement=${args.iconplacement}>
    ${args.content}
  </mlv-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { content: 'Primary', disabled: false,  variant: 'primary' }
};

export const Secondary = { ...Default, args: { content: 'Secondary', variant: 'secondary' } };
export const Tertiary = { ...Default, args: { content: 'Tertiary Button', variant: 'tertiary' } };
export const Destructive = { ...Default, args: { content: 'Destructive', variant: 'destructive' } };
export const Disabled = { ...Default, args: { content: 'Disabled Button', disabled: true } };
export const ButtonWithIcon = { ...Default, args: { content: 'Copy', icon: 'copy', iconplacement: 'trailing' } };

export const IconButton = { ...Default, args: {icon: 'copy', iconplacement: IconPlacements.IconOnly } };

// export const simulateHoverStates = { ...Default,
//   play: async ({ args, canvasElement }) => {
//     const canvas = within(canvasElement);
//     const button = canvas.getByTestId('button').shadowRoot.querySelector('button');
//     const isEnabled = !args.disabled;

//     await awaitTimeout(1500);

//     await userEvent.hover(button);
//     await expect(button.classList.contains('hover')).toBe(isEnabled)
//     await awaitTimeout(500);
//     await userEvent.unhover(button);

//     await expect(button.classList.contains('hover')).toBe(false)

//     await userEvent.hover(button);
//     await expect(button.classList.contains('hover')).toBe(isEnabled)
//     await awaitTimeout(500);
//     await userEvent.unhover(button);

//     await userEvent.click(button);
//     await userEvent.unhover(button);
//   }
// };   /*** No longer works with CSS hover psuedo class rather than explicit event listeners and CSS .hover class -- Left for play method reference ***/