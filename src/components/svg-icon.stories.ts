import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'

import { IconNames, IconVariants, ICON_NAMES, ICON_VARIANTS, SvgIcon } from './svg-icon';
const _components = { SvgIcon };

const figmaEmbed = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0'
  }
};

export default {
  title: 'MagLev Elements/Atoms/Icon',
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ICON_VARIANTS
    },
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
  },
};

interface ArgTypes {
  variant?: IconVariants;
  name?: IconNames;
}

export const Default = {
  render: (args: ArgTypes) => html`<mlv-svg-icon .name="${args.name}" .variant="${args.variant}" style="font-size: 4em"></mlv-svg-icon>`,
  parameters: figmaEmbed,
  args: { name: 'arrow', variant: 'default' }
};

export const LightIcon = { ...Default, args: { name: 'arrow', variant: 'lighter' } };