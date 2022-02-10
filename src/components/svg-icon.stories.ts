/* eslint-disable guard-for-in */
import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';

import { awaitTimeout, generateFigmaEmbed } from '../util/storybook-utils';
import { IconNames, IconVariants, ICON_VARIANTS, SvgIcon } from './svg-icon';
import { ICON_NAMES } from '../generated/icon-names';
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
  render: (args: ArgTypes) => html`<mlv-svg-icon data-testid="icon" name="${args.name}" variant="${args.variant}" style="font-size: 4em"></mlv-svg-icon>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics', variant: 'default' }
};

export const LightIcon = { ...Default, args: { name: 'analytics', variant: 'lighter' } };

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`

    ${ICON_NAMES.map(iconName => html`
      <span title="${iconName}">
        <mlv-svg-icon data-testid="icon" name="${iconName}" variant="${args.variant}" style="font-size: 4em"></mlv-svg-icon>
        <!-- ${iconName} -->
      </span>
    `)}
  `,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics', variant: 'default' }
};

export const CycleIcons = {
  ...Default,
  args: { name: 'analytics', variant: 'lighter' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId('icon');

    await icon.setAttribute('variant', args.variant);

    await awaitTimeout(1000);

    await expect(icon.hasAttribute('name')).toBe(true)

    for (const iconName in ICON_NAMES) {
      await icon.setAttribute('name', ICON_NAMES[iconName]);
      await awaitTimeout(1000);
      await expect(icon.getAttribute('name')).toBe(ICON_NAMES[iconName])
    }
  }
};