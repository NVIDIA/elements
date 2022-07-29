/* eslint-disable guard-for-in */
import { html } from 'lit';
import { withDesign } from 'storybook-addon-designs';

import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  generateFigmaEmbed,
  getValuesFromEnum
} from '@elements/elements/internal';
import {  IconNames, IconVariants, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

const figmaEmbedNodeId = '164%3A61';
const reviewDocBookmark = 'id.zckm5su0hyrd';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Icon Component
`;

export default {
  title: 'Elements/Icon/Examples',
  component: 'mlv-icon',
  // decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: getValuesFromEnum(IconVariants)
    },
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    }
  }
};

interface ArgTypes {
  variant?: IconVariants;
  name?: IconNames;
  color?: string;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<mlv-icon
      name="${args.name}"
      variant="${args.variant}"
      color="${args.color}"
    ></mlv-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

export const LightIcon = { ...Default, args: { name: 'analytics', variant: IconVariants.Lighter } };

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`
    ${ICON_NAMES.map((iconName) => html`<mlv-icon title="${iconName}" .name="${iconName}" .variant="${args.variant}"></mlv-icon>\n`
    )}
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

export const variants = {
  render: () => html`
    <mlv-icon name="analytics" style="font-size: 2em"></mlv-icon>
    <mlv-icon name="analytics" variant="inherit" style="font-size: 2em"></mlv-icon>
    <mlv-icon name="analytics" variant="lighter" style="font-size: 2em"></mlv-icon>
  `
}

export const statuses = {
  render: () => html`
    <mlv-icon name="analytics"></mlv-icon>
    <mlv-icon name="analytics" status="info"></mlv-icon>
    <mlv-icon name="analytics" status="success"></mlv-icon>
    <mlv-icon name="analytics" status="warning"></mlv-icon>
    <mlv-icon name="analytics" status="danger"></mlv-icon>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="light">
      <mlv-icon name="analytics"></mlv-icon>
      <mlv-icon name="analytics" status="info"></mlv-icon>
      <mlv-icon name="analytics" status="success"></mlv-icon>
      <mlv-icon name="analytics" status="warning"></mlv-icon>
      <mlv-icon name="analytics" status="danger"></mlv-icon>
    </div>
    <div mlv-theme="dark">
      <mlv-icon name="analytics"></mlv-icon>
      <mlv-icon name="analytics" status="info"></mlv-icon>
      <mlv-icon name="analytics" status="success"></mlv-icon>
      <mlv-icon name="analytics" status="warning"></mlv-icon>
      <mlv-icon name="analytics" status="danger"></mlv-icon>
    </div>
  `
}
