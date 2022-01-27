import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { generateFigmaEmbed } from '../util/storybook-utils';

import { IconNames, IconVariants, ICON_NAMES, ICON_VARIANTS, SvgIcon } from './svg-icon';
const _components = { SvgIcon };

const figmaEmbedNodeId = '164%3A61';
const description =  `
  ## The MagLev Icon Component
`;

export default {
  title: 'MagLev Elements/Atoms/Icon',
  component: 'mlv-svg-icon',
  decorators: [withDesign],
  parameters: {
    docs: {
      description: {
        component: description
      }
    }
  },
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
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'arrow', variant: 'default' }
};

export const LightIcon = { ...Default, args: { name: 'arrow', variant: 'lighter' } };