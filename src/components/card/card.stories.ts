import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs'

import { ComponentStatuses, generateFigmaEmbed, generateDefaultStoryParameters } from '../../util/storybook-utils';
import { Card }  from './card';
const _components = { Card };

const figmaEmbedNodeId = '505%3A2280';
const reviewDocBookmark = 'id.s62qmiib7wfu';
const status: ComponentStatuses = 'dev';
const description =  `
  ## The MagLev Card Component
`;

export default {
  title: 'MagLev Elements/Atoms/Card',
  component: 'nve-card',
  decorators: [withDesign],
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
  argTypes: {
    width: {
      control: { type: 'range', min: 200, max: 500}
    },
    height: {
      control: { type: 'range', min: 50, max: 500}
    }
  }
};

interface ArgTypes {
  width?: number;
  height?: number;
  content?: string;
  imageSrc?: string;
  showFooter?: boolean;
  title?: string;
  subTitle?: string;
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

    <nve-card title=${args.title} subTitle=${args.subTitle}>
      ${when(args.imageSrc, () => html`
        <img slot="image" src="${args.imageSrc}">
      `)}

      ${args.content}

      ${when(args.showFooter, () => html`
        <footer slot="footer">
          Proceed with Action

          <nve-button label="Proceed" icon="navigate-to"></nve-button>
        </footer>
      `)}
    </nve-card>
  `,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { width: 300, height: 150 }
};


export const CardWithTitle = {
  ...Default,
  args: { title: 'Card Title', width: 400, height: 200 }
};

export const CardWithTitleAndSubTitle = {
  ...Default,
  args: { title: 'Card Title', subTitle: 'Supporting Text', width: 400, height: 200 }
};

export const CardWithImage = {
  ...Default,
  args: { imageSrc: './src/assets/card-hero-image.jpg', width: 400, height: 200 }
};

export const CardWithImageAndFooter = {
  ...Default,
  args: { showFooter: true, imageSrc: './src/assets/card-hero-image.jpg', width: 400 }
};

export const CardWithHeaderImageAndFooter = {
  ...Default,
  args: { title: 'Card Title', subTitle: 'Supporting Text',  showFooter: true, imageSrc: './src/assets/card-hero-image.jpg', width: 400 }
};