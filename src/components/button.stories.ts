import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

import { awaitTimeout, generateFigmaEmbed } from '../util/storybook-utils';
import { ICON_NAMES } from '../generated/icon-names';
import { IconNames } from './svg-icon';
import { Button }  from './button';
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
      handles: ['mouseover nve-button', 'mouseout nve-button', 'click nve-button'],
    },
  },
  argTypes: {
    icon: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

interface ArgTypes {
  label?: string;
  content?: string;
  disabled?: boolean;
  icon?: IconNames;
  prefixIcon?: boolean;
}

export const Default = {
  render: (args: ArgTypes) => html`<nve-button data-testid="button" label=${args.label} ?disabled=${args.disabled} icon=${args.icon} ?prefixIcon=${args.prefixIcon}>${args.content}</nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'My Story ', disabled: false, content: '' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('button').shadowRoot.querySelector('button');
    const isEnabled = !args.disabled;

    await awaitTimeout(1500);

    await userEvent.hover(button);
    await expect(button.classList.contains('hover')).toBe(isEnabled)
    await awaitTimeout(500);
    await userEvent.unhover(button);

    await expect(button.classList.contains('hover')).toBe(false)

    await userEvent.hover(button);
    await expect(button.classList.contains('hover')).toBe(isEnabled)
    await awaitTimeout(500);
    await userEvent.unhover(button);

    await userEvent.click(button);
    await userEvent.unhover(button);
  }
};

export const Disabled = { ...Default, args: { label: 'Disabled Button', disabled: true } };
export const SlottedText = { ...Default, args: { content: 'Slotted Text' } };
export const ButtonWithIcon = { ...Default, args: { label: 'Copy', icon: 'copy', prefixIcon: false } };


export const ButtonWithIconSlotted = {
  render: (args: ArgTypes) => html`
  <nve-button label=${args.label} ?disabled=${args.disabled}>
    <nve-svg-icon variant="current" name="arrow"></nve-svg-icon>
  </nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'Slotted Icon', disabled: false, content: '' }
};
