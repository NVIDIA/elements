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
  variant: Icon['variant'];
  status: Icon['status'];
  name: IconNames;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<nve-icon
      .name=${args.name}
      .variant=${args.variant}
      .status=${args.status}
    ></nve-icon>`,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'user' }
};

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`
    ${ICON_NAMES.map((iconName) => html`<nve-icon name=${iconName} .variant=${args.variant}></nve-icon>\n`
    )}
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { name: 'user' }
};

export const variants = {
  render: () => html`
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" variant="inherit"></nve-icon>
  `
}

export const statuses = {
  render: () => html`
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" status="accent"></nve-icon>
    <nve-icon name="user" status="success"></nve-icon>
    <nve-icon name="user" status="warning"></nve-icon>
    <nve-icon name="user" status="danger"></nve-icon>
  `
}

export const size = {
  render: () => html`
    <nve-icon name="user" size="sm"></nve-icon>
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" size="lg"></nve-icon>
  `
}

export const direction = {
  render: () => html`
    <nve-icon name="expand-panel"></nve-icon>
    <nve-icon name="collapse-panel"></nve-icon>
    <nve-icon name="arrow" direction="up"></nve-icon>
    <nve-icon name="arrow" direction="down"></nve-icon>
    <nve-icon name="arrow" direction="left"></nve-icon>
    <nve-icon name="arrow" direction="right"></nve-icon>
    <nve-icon name="caret" direction="up"></nve-icon>
    <nve-icon name="caret" direction="down"></nve-icon>
    <nve-icon name="caret" direction="left"></nve-icon>
    <nve-icon name="caret" direction="right"></nve-icon>
    <nve-icon name="chevron" direction="up"></nve-icon>
    <nve-icon name="chevron" direction="down"></nve-icon>
    <nve-icon name="chevron" direction="left"></nve-icon>
    <nve-icon name="chevron" direction="right"></nve-icon>
  `
}

export const themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon name="user"></nve-icon>
      <nve-icon name="user" status="accent"></nve-icon>
      <nve-icon name="user" status="success"></nve-icon>
      <nve-icon name="user" status="warning"></nve-icon>
      <nve-icon name="user" status="danger"></nve-icon>
    </div>
    <div nve-theme="root dark">
      <nve-icon name="user"></nve-icon>
      <nve-icon name="user" status="accent"></nve-icon>
      <nve-icon name="user" status="success"></nve-icon>
      <nve-icon name="user" status="warning"></nve-icon>
      <nve-icon name="user" status="danger"></nve-icon>
    </div>
  `
}
