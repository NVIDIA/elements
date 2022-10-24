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
  component: 'mlv-icon',
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
    html`<mlv-icon
      name="${args.name}"
      variant="${args.variant}"
      status="${args.status}"
    ></mlv-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'analytics' }
};

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
    <mlv-icon name="analytics"></mlv-icon>
    <mlv-icon name="analytics" variant="inherit"></mlv-icon>
  `
}

export const statuses = {
  render: () => html`
    <mlv-icon name="analytics"></mlv-icon>
    <mlv-icon name="analytics" status="accent"></mlv-icon>
    <mlv-icon name="analytics" status="success"></mlv-icon>
    <mlv-icon name="analytics" status="warning"></mlv-icon>
    <mlv-icon name="analytics" status="danger"></mlv-icon>
  `
}

export const size = {
  render: () => html`
    <mlv-icon style="--width: 20px; --height: 20px;" name="analytics"></mlv-icon>
    <mlv-icon name="analytics"></mlv-icon>
    <mlv-icon style="--width: 30px; --height: 30px;" name="analytics"></mlv-icon>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="light">
      <mlv-icon name="analytics"></mlv-icon>
      <mlv-icon name="analytics" status="accent"></mlv-icon>
      <mlv-icon name="analytics" status="success"></mlv-icon>
      <mlv-icon name="analytics" status="warning"></mlv-icon>
      <mlv-icon name="analytics" status="danger"></mlv-icon>
    </div>
    <div mlv-theme="dark">
      <mlv-icon name="analytics"></mlv-icon>
      <mlv-icon name="analytics" status="accent"></mlv-icon>
      <mlv-icon name="analytics" status="success"></mlv-icon>
      <mlv-icon name="analytics" status="warning"></mlv-icon>
      <mlv-icon name="analytics" status="danger"></mlv-icon>
    </div>
  `
}
