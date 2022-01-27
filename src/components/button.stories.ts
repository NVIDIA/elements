import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { generateFigmaEmbed } from '../util/storybook-utils';

import { Button }  from './button';
import { IconNames, ICON_NAMES } from './svg-icon';
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
    }
  },
  argTypes: {
    icon: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
  },
};

interface ArgTypes {
  label?: string;
  content?: string;
  disabled?: boolean;
  icon?: IconNames;
  prefixIcon?: boolean;
}

export const Default = {
  render: (args: ArgTypes) => html`<nve-button .label=${args.label} .disabled=${args.disabled} .icon=${args.icon} ?prefixIcon=${args.prefixIcon}>${args.content}</nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'My Story', disabled: false, content: '' }
};

export const Disabled = { ...Default, args: { label: 'Disabled Button', disabled: true } };
export const SlottedText = { ...Default, args: { content: 'Slotted Text' } };
export const ButtonWithIcon = { ...Default, args: { label: 'Copy', icon: 'copy', prefixIcon: false } };


export const ButtonWithIconSlotted = {
  render: (args: ArgTypes) => html`
  <nve-button .label=${args.label} .disabled=${args.disabled}>
    <nve-svg-icon variant="current" name="arrow"></nve-svg-icon>
  </nve-button>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { label: 'Slotted Icon', disabled: false, content: '' }
};
