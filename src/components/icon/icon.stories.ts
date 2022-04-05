/* eslint-disable guard-for-in */
import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs'
import { within } from '@storybook/testing-library';

import { awaitTimeout, ComponentStatuses, generateDefaultStoryParameters, generateFigmaEmbed, getValuesFromEnum } from '../../util/storybook-utils';
import { IconNames, IconVariants, Icon } from './icon';
import { ICON_NAMES } from '../../generated-icons/icon-names';
const _components = { Icon };

const figmaEmbedNodeId = '164%3A61';
const reviewDocBookmark = 'id.zckm5su0hyrd';
const status: ComponentStatuses = 'dev';
const description =  `
  ## The MagLev Icon Component
`;

export default {
  title: 'MagLev Elements/Atoms/Icon',
  component: 'nve-icon',
  decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
  argTypes: { // ******* TODO: Track this github issue https://github.com/storybookjs/storybook/issues/17063 (bug in 6.4 that resets radio/select args to !undefined)
    variant: {
      control: 'inline-radio',
      options: getValuesFromEnum(IconVariants),
      default: IconVariants.Default
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
  color?: string;
}

export const Default = {
  render: (args: ArgTypes) => html`<nve-icon data-testid="icon" name="${args.name}" variant="${args.variant}" color="${args.color}" style="font-size: 4em"></nve-icon>`,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics', variant: IconVariants.Default }
};

export const LightIcon = { ...Default, args: { name: 'analytics', variant: IconVariants.Lighter } };

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`

    ${ICON_NAMES.map(iconName => html`
      <span title="${iconName}">
        <nve-icon data-testid="icon" name="${iconName}" variant="${args.variant}" style="font-size: 4em"></nve-icon>
      </span>
    `)}
  `,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics', variant: IconVariants.Default }
};

export const CycleIcons = {
  ...Default,
  args: { name: 'analytics', variant: IconVariants.Lighter },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId('icon');

    await icon.setAttribute('variant', args.variant);

    await awaitTimeout(1000);

    // await expect(icon.hasAttribute('name')).toBe(true)

    for (const iconName in ICON_NAMES) {
      await icon.setAttribute('name', ICON_NAMES[iconName]);
      await awaitTimeout(1000);
      // await expect(icon.getAttribute('name')).toBe(ICON_NAMES[iconName])
    }
  }
};