import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

import { awaitTimeout, generateFigmaEmbed } from '../util/storybook-utils';

import { Button }  from './button';
import { IconNames, ICON_NAMES } from './svg-icon';
const _components = { Button };

const figmaEmbedNodeId = '163%3A25';
const description =  `
  ## The MagLev Button Component
`;

export default {
  title: 'MagLev Elements/Atoms/Button',
  component: 'mlv-button',
  decorators: [withDesign],
  parameters: {
    docs: {
      description: {
        component: description
      }
    },
    actions: {
      handles: ['mouseover mlv-button', 'mouseout mlv-button', 'click mlv-button'],
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
  render: (args: ArgTypes) => html`<mlv-button data-testid="button" .label=${args.label} .disabled=${args.disabled} .icon=${args.icon} ?prefixIcon=${args.prefixIcon}>${args.content}</mlv-button>`,
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
  <mlv-button .label=${args.label} .disabled=${args.disabled}>
    <mlv-svg-icon variant="current" name="arrow"></mlv-svg-icon>
  </mlv-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'Slotted Icon', disabled: false, content: '' }
};
