import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { userEvent, within } from '@storybook/testing-library';

import { awaitTimeout, generateFigmaEmbed } from '../util/storybook-utils';
import { ICON_NAMES } from '../generated/icon-names';
import { IconNames } from './svg-icon';
import { Button, ButtonVariants, BUTTON_VARIANTS }  from './button';
const _components = { Button };

const figmaEmbedNodeId = '163%3A25';
const description =  `
  ## The MagLev Button Component
`;

export default {
  title: 'MagLev Elements/Atoms/Button',
  component: 'nve-button',
  decorators: [withDesign],
  parameters: {
    docs: {
      description: {
        component: description
      }
    },
    actions: {
      handles: ['mouseover nve-button', 'mouseout nve-button', 'mousedown nve-button', 'click nve-button'],
    },
  },
  argTypes: { // ******* TODO: Track this github issue https://github.com/storybookjs/storybook/issues/17063 (bug in 6.4 that resets radio/select args to !undefined)
    icon: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
    variant: {
      control: 'inline-radio',
      options: BUTTON_VARIANTS
    }
  }
};

interface ArgTypes {
  label?: string;
  variant?: ButtonVariants;
  content?: string;
  disabled?: boolean;
  icon?: IconNames;
  prefixIcon?: boolean;
}

export const Default = {
  render: (args: ArgTypes) => html`<nve-button data-testid="button" label=${args.label} variant=${args.variant} ?disabled=${args.disabled} icon=${args.icon} ?prefixIcon=${args.prefixIcon}>${args.content}</nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'Primary', disabled: false, content: '', variant: 'primary' }
};

export const Secondary = { ...Default, args: { label: 'Secondary', variant: 'secondary' } };
export const Destructive = { ...Default, args: { label: 'Destructive', variant: 'destructive' } };
export const Disabled = { ...Default, args: { label: 'Disabled Button', disabled: true } };
export const SlottedText = { ...Default, args: { content: 'Slotted Text' } };
export const ButtonWithIcon = { ...Default, args: { label: 'Copy', icon: 'copy', prefixIcon: false } };

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


export const ButtonWithIconSlotted = {
  render: (args: ArgTypes) => html`
  <nve-button label=${args.label} ?disabled=${args.disabled}>
    <nve-svg-icon variant="current" name="arrow"></nve-svg-icon>
  </nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'Slotted Icon', disabled: false, content: '' }
};
