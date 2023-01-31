/* eslint-disable guard-for-in */
import { html } from 'lit';
import { ComponentStatuses, generateDefaultStoryParameters } from '@elements/elements/internal';
import { Icon, IconNames, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

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
  variant: Icon['variant'];
  status: Icon['status'];
  name: IconNames;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<mlv-icon
      .name=${args.name}
      .variant=${args.variant}
      .status=${args.status}
    ></mlv-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'user' }
};

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`
    ${ICON_NAMES.map((iconName) => html`<mlv-icon name=${iconName} .variant=${args.variant}></mlv-icon>\n`
    )}
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'user' }
};

export const variants = {
  render: () => html`
    <mlv-icon name="user"></mlv-icon>
    <mlv-icon name="user" variant="inherit"></mlv-icon>
  `
}

export const statuses = {
  render: () => html`
    <mlv-icon name="user"></mlv-icon>
    <mlv-icon name="user" status="accent"></mlv-icon>
    <mlv-icon name="user" status="success"></mlv-icon>
    <mlv-icon name="user" status="warning"></mlv-icon>
    <mlv-icon name="user" status="danger"></mlv-icon>
  `
}

export const size = {
  render: () => html`
    <mlv-icon name="user" size="sm"></mlv-icon>
    <mlv-icon name="user"></mlv-icon>
    <mlv-icon name="user" size="lg"></mlv-icon>
  `
}

export const direction = {
  render: () => html`
    <mlv-icon name="expand-panel"></mlv-icon>
    <mlv-icon name="collapse-panel"></mlv-icon>
    <mlv-icon name="arrow" direction="up"></mlv-icon>
    <mlv-icon name="arrow" direction="down"></mlv-icon>
    <mlv-icon name="arrow" direction="left"></mlv-icon>
    <mlv-icon name="arrow" direction="right"></mlv-icon>
    <mlv-icon name="caret" direction="up"></mlv-icon>
    <mlv-icon name="caret" direction="down"></mlv-icon>
    <mlv-icon name="caret" direction="left"></mlv-icon>
    <mlv-icon name="caret" direction="right"></mlv-icon>
    <mlv-icon name="chevron" direction="up"></mlv-icon>
    <mlv-icon name="chevron" direction="down"></mlv-icon>
    <mlv-icon name="chevron" direction="left"></mlv-icon>
    <mlv-icon name="chevron" direction="right"></mlv-icon>
  `
}

export const themes = {
  render: () => html`
    <div mlv-theme="root light">
      <mlv-icon name="user"></mlv-icon>
      <mlv-icon name="user" status="accent"></mlv-icon>
      <mlv-icon name="user" status="success"></mlv-icon>
      <mlv-icon name="user" status="warning"></mlv-icon>
      <mlv-icon name="user" status="danger"></mlv-icon>
    </div>
    <div mlv-theme="root dark">
      <mlv-icon name="user"></mlv-icon>
      <mlv-icon name="user" status="accent"></mlv-icon>
      <mlv-icon name="user" status="success"></mlv-icon>
      <mlv-icon name="user" status="warning"></mlv-icon>
      <mlv-icon name="user" status="danger"></mlv-icon>
    </div>
  `
}
