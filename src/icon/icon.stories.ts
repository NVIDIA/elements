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
  component: 'nve-icon',
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
    html`<nve-icon
      name="${args.name}"
      variant="${args.variant}"
      color="${args.color}"
    ></nve-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

export const LightIcon = { ...Default, args: { name: 'analytics', variant: IconVariants.Lighter } };

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`
    ${ICON_NAMES.map((iconName) => html`<nve-icon title="${iconName}" .name="${iconName}" .variant="${args.variant}"></nve-icon>\n`
    )}
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

export const variants = {
  render: () => html`
    <nve-icon name="analytics" style="font-size: 2em"></nve-icon>
    <nve-icon name="analytics" variant="inherit" style="font-size: 2em"></nve-icon>
    <nve-icon name="analytics" variant="lighter" style="font-size: 2em"></nve-icon>
  `
}

export const statuses = {
  render: () => html`
    <nve-icon name="analytics"></nve-icon>
    <nve-icon name="analytics" status="info"></nve-icon>
    <nve-icon name="analytics" status="success"></nve-icon>
    <nve-icon name="analytics" status="warning"></nve-icon>
    <nve-icon name="analytics" status="danger"></nve-icon>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="light">
      <nve-icon name="analytics"></nve-icon>
      <nve-icon name="analytics" status="info"></nve-icon>
      <nve-icon name="analytics" status="success"></nve-icon>
      <nve-icon name="analytics" status="warning"></nve-icon>
      <nve-icon name="analytics" status="danger"></nve-icon>
    </div>
    <div nve-theme="dark">
      <nve-icon name="analytics"></nve-icon>
      <nve-icon name="analytics" status="info"></nve-icon>
      <nve-icon name="analytics" status="success"></nve-icon>
      <nve-icon name="analytics" status="warning"></nve-icon>
      <nve-icon name="analytics" status="danger"></nve-icon>
    </div>
  `
}
