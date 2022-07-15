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
  title: 'MagLev Elements/Atoms/Card',
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
  showHeaderActions?: boolean;
  title?: string;
  subtitle?: string;
}

export const Default = {
  render: (args: ArgTypes) => html`
    <style>
      nve-card {
        width: ${args.width}px;
        height: ${args.height}px;
      }

      nve-card img {
        height: 250px;
      }

      nve-card footer {
        text-align: center;
      }
    </style>

    <nve-card title=${args.title} subtitle=${args.subtitle}>
      ${when(
        args.showHeaderActions,
        () => html`
          <div slot="header-actions">
            <nve-button
              variant="tertiary"
            ></nve-button>
          </div>
        `
      )}
      ${args.content}
      ${when(
        args.showFooter,
        () => html`
          <footer slot="footer">
            Proceed with Action

            <nve-button icon="navigate-to">Proceed</nve-button>
          </footer>
        `
      )}
    </nve-card>
  `,
  // parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { width: 300, height: 150, content: 'Card Content' }
};

export const CardWithTitle = {
  ...Default,
  args: { title: 'Card Title', content: 'Card Content', width: 400, height: 200 }
};

export const CardWithTitleAndSubTitle = {
  ...Default,
  args: { title: 'Card Title', content: 'Card Content', subtitle: 'Supporting Text', width: 400, height: 300 }
};

export const CardWithSlottedHeaderActions = {
  ...Default,
  args: {
    showHeaderActions: true,
    content: 'Card Content',
    title: 'Card Title',
    subtitle: 'Supporting Text',
    width: 400,
    height: 300
  }
};

export const CardWithHeaderAndFooter = {
  ...Default,
  args: {
    content: 'Card Content',
    title: 'Card Title',
    subtitle: 'Supporting Text',
    showFooter: true,
    width: 400,
    height: 300
  }
};
