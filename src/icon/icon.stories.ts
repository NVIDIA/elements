/* eslint-disable guard-for-in */
import { html } from 'lit';
import {
  ComponentStatuses,
  generateDefaultStoryParameters,
  getValuesFromEnum
} from '@elements/elements/internal';
import {  Icon, IconNames, ICON_NAMES } from '@elements/elements/icon';
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
      options: ['inherit', 'default']
    },
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
    status: {
      control: 'inline-radio',
      options: ['default', 'success', 'warning', 'danger', 'accent']
    },
  }
};

interface ArgTypes {
  variant?: Icon['variant'];
  status?: Icon['status'];
  name?: IconNames;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<nve-icon
      name="${args.name}"
      variant="${args.variant}"
      status="${args.status}"
    ></nve-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

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
    <nve-icon name="analytics"></nve-icon>
    <nve-icon name="analytics" variant="inherit"></nve-icon>
  `
}

export const statuses = {
  render: () => html`
    <nve-icon name="analytics"></nve-icon>
    <nve-icon name="analytics" status="accent"></nve-icon>
    <nve-icon name="analytics" status="success"></nve-icon>
    <nve-icon name="analytics" status="warning"></nve-icon>
    <nve-icon name="analytics" status="danger"></nve-icon>
  `
}

export const size = {
  render: () => html`
    <nve-icon style="--width: 20px; --height: 20px;" name="analytics"></nve-icon>
    <nve-icon name="analytics"></nve-icon>
    <nve-icon style="--width: 30px; --height: 30px;" name="analytics"></nve-icon>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="light">
      <nve-icon name="analytics"></nve-icon>
      <nve-icon name="analytics" status="accent"></nve-icon>
      <nve-icon name="analytics" status="success"></nve-icon>
      <nve-icon name="analytics" status="warning"></nve-icon>
      <nve-icon name="analytics" status="danger"></nve-icon>
    </div>
    <div nve-theme="dark">
      <nve-icon name="analytics"></nve-icon>
      <nve-icon name="analytics" status="accent"></nve-icon>
      <nve-icon name="analytics" status="success"></nve-icon>
      <nve-icon name="analytics" status="warning"></nve-icon>
      <nve-icon name="analytics" status="danger"></nve-icon>
    </div>
  `
}
