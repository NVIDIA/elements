import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs';

import { ComponentStatuses, generateFigmaEmbed, generateDefaultStoryParameters } from '@elements/elements/internal';
import { IconSlotPlacements } from '@elements/elements/button';
import '@elements/elements/card/define.js';

const figmaEmbedNodeId = '505%3A2280';
const reviewDocBookmark = 'id.s62qmiib7wfu';
const status: ComponentStatuses = 'alpha';
const description = `
  ## The MagLev Card Component
`;

export default {
  title: 'Elements/Card/Examples',
  component: 'mlv-card',
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
      mlv-card {
        width: ${args.width}px;
        height: ${args.height}px;
      }
    </style>

    <div mlv-theme>
      <mlv-card>
        ${when(
          args.showHeader,
          () => html`
          <mlv-card-header>
            <div slot="title">Title</div>
            <div slot="subtitle">Sub Title</div>


            ${when(
              args.showAction,
              () => html`
                <mlv-icon-button slot="header-action" name="additional-actions" interaction="ghost"></mlv-icon-button>
              `)}
          </mlv-card-header>
          `
        )}

        <mlv-card-content>
          ${args.content}
        </mlv-card-content>

        ${when(
          args.showFooter,
          () => html`
          <mlv-card-footer>
            Proceed with Action
            <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
          </mlv-card-footer>
          `
        )}
      </mlv-card>
    </div>
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { width: 300, height: 150, content: 'Card Content' }
};

export const CardWithContentLayout = {
  render: () => html`
    <mlv-card style="width: 400px; height: 300px;">
      <mlv-card-content mlv-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </mlv-card-content>
    </mlv-card>
  `
}

export const CardWithMultipleContentsAndDivider = {
  render: () => html`
    <mlv-card style="width: 400px; height: 300px;">
      <mlv-card-content mlv-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </mlv-card-content>

      <hr style="width: 100%">

      <mlv-card-content mlv-layout="row align:center gap:md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </mlv-card-content>
    </mlv-card>
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
    <div mlv-theme="light">
      <mlv-card style="width: 400px; height: 300px;">
        <mlv-card-header>
          <div slot="title">Title</div>
          <div slot="subtitle">Sub Title</div>
        </mlv-card-header>

        <mlv-card-content>
          Card Content
        </mlv-card-content>

        <mlv-card-footer>
          Proceed with Action
          <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
        </mlv-card-footer>
      </mlv-card>
    </div>

    <div mlv-theme="dark">
      <mlv-card style="width: 400px; height: 300px;">
        <mlv-card-header>
          <div slot="title">Title</div>
          <div slot="subtitle">Sub Title</div>
        </mlv-card-header>

        <mlv-card-content>
          Card Content
        </mlv-card-content>

        <mlv-card-footer>
          Proceed with Action
          <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
        </mlv-card-footer>
      </mlv-card>
    </div>
  `
}