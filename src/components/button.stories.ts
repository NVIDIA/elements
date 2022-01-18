import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'

import { Button }  from './button';
import { IconNames } from './svg-icon';
const _components = { Button };

const figmaEmbed = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0?node-id=171%3A3792',
  }
};

export default {
  title: 'MagLev Elements/Atoms/Button',
  decorators: [withDesign]
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
  parameters: figmaEmbed,
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
  parameters: figmaEmbed,
  args: { label: 'Slotted Icon', disabled: false, content: '' }
};
