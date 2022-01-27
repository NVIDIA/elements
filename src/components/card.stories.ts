import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs'
import { generateFigmaEmbed } from '../util/storybook-utils';

import { Card }  from './card';
const _components = { Card };

const figmaEmbedNodeId = '505%3A2280';
const description =  `
  ## The MagLev Card Component
`;

export default {
  title: 'MagLev Elements/Atoms/Card',
  component: 'nve-card',
  decorators: [withDesign],
  parameters: {
    docs: {
      description: {
        component: description
      }
    }
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 200, max: 500}
    },
    height: {
      control: { type: 'range', min: 50, max: 400}
    }
  }
};

interface ArgTypes {
  width?: number;
  height?: number;
  content?: string;
  footerTxt?: string;
  imageSrc?: string;
  showButton?: boolean;
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
    <nve-card>
      ${when(args.imageSrc, () => html`
        <img slot="image" src="${args.imageSrc}">
      `)}

      ${args.content}

      ${when(args.footerTxt, () => html`
        <footer slot="footer">
          ${args.footerTxt}


          ${when(args.showButton, () => html`
            <nve-button label="Proceed" icon="arrow"></nve-button>
          `)}
        </footer>
      `)}
    </nve-card>
  `,
  parameters: generateFigmaEmbed(figmaEmbedNodeId),
  args: { content: 'Slotted Card Content', width: 200, height: 50 }
};

export const CardWithImage = {
  ...Default,
  args: {imageSrc: './src/assets/card-hero-image.jpg', width: 400, height: 200 }
};
export const CardWithImageAndFooter = {
  ...Default,
  args: { footerTxt: 'Slotted Image Above', imageSrc: './src/assets/card-hero-image.jpg', width: 400, height: 325 }
};
export const CardWithImageAndAction = {
  ...Default,
  args: { footerTxt: 'Proceed with Action', imageSrc: './src/assets/card-hero-image.jpg', width: 400, height: 325, showButton: true }
};