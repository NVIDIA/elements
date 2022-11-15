import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs';

import { ComponentStatuses, generateFigmaEmbed, generateDefaultStoryParameters } from '@elements/elements/internal';
import '@elements/elements/card/define.js';

const figmaEmbedNodeId = '505%3A2280';
const reviewDocBookmark = 'id.s62qmiib7wfu';
const status: ComponentStatuses = 'alpha';
const description = `
  ## The MagLev Card Component
`;

export default {
  title: 'Elements/Card/Examples',
  component: 'nve-card',
  decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
  argTypes: {
    width: {
      control: { type: 'range', min: 200, max: 500 }
    },
    height: {
      control: { type: 'range', min: 50, max: 500 }
    }
  }
};

interface ArgTypes {
  width?: number;
  height?: number;
  content?: string;
  showFooter?: boolean;
  showHeader?: boolean;
  showAction?: boolean;
}

export const Default = {
  render: (args: ArgTypes) => html`
    <style>
      nve-card {
        width: ${args.width}px;
        height: ${args.height}px;
      }
    </style>

    <div nve-theme="">
      <nve-card>
        ${when(
          args.showHeader,
          () => html`
          <nve-card-header>
            <div slot="title">Title</div>
            <div slot="subtitle">Sub Title</div>


            ${when(
              args.showAction,
              () => html`
                <nve-icon-button slot="header-action" name="additional-actions" interaction="ghost"></nve-icon-button>
              `)}
          </nve-card-header>
          `
        )}

        <nve-card-content>
          ${args.content}
        </nve-card-content>

        ${when(
          args.showFooter,
          () => html`
          <nve-card-footer>
            Proceed with Action
            <nve-button interaction="emphasize">Proceed <nve-icon name="navigate-to"></nve-icon></nve-button>
          </nve-card-footer>
          `
        )}
      </nve-card>
    </div>
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { width: 300, height: 150, content: 'Card Content' }
};

export const CardWithContentLayout = {
  render: () => html`
    <nve-card style="width: 400px; height: 300px;">
      <nve-card-content nve-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </nve-card-content>
    </nve-card>
  `
}

export const CardWithMultipleContentsAndDivider = {
  render: () => html`
    <nve-card style="width: 400px; height: 300px;">
      <nve-card-content nve-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </nve-card-content>

      <hr style="width: 100%">

      <nve-card-content nve-layout="row align:center gap:md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </nve-card-content>
    </nve-card>
  `
}

export const CardWithHeader = {
  ...Default,
  args: { content: 'Card Content', showHeader: true, width: 400, height: 200 }
};

export const CardWithHeaderAndAction = {
  ...Default,
  args: { content: 'Card Content', showHeader: true, showAction: true, width: 400, height: 200 }
};

export const CardWithHeaderAndFooter = {
  ...Default,
  args: {
    content: 'Card Content',
    title: 'Card Title',
    subtitle: 'Supporting Text',
    showHeader: true,
    showFooter: true,
    width: 400,
    height: 300
  }
};


export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-card style="width: 400px; height: 300px;">
        <nve-card-header>
          <div slot="title">Title</div>
          <div slot="subtitle">Sub Title</div>
        </nve-card-header>

        <nve-card-content>
          Card Content
        </nve-card-content>

        <nve-card-footer>
          Proceed with Action
          <nve-button interaction="emphasize">Proceed <nve-icon name="navigate-to"></nve-icon></nve-button>
        </nve-card-footer>
      </nve-card>
    </div>

    <div nve-theme="root dark">
      <nve-card style="width: 400px; height: 300px;">
        <nve-card-header>
          <div slot="title">Title</div>
          <div slot="subtitle">Sub Title</div>
        </nve-card-header>

        <nve-card-content>
          Card Content
        </nve-card-content>

        <nve-card-footer>
          Proceed with Action
          <nve-button interaction="emphasize">Proceed <nve-icon name="navigate-to"></nve-icon></nve-button>
        </nve-card-footer>
      </nve-card>
    </div>
  `
}