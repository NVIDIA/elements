import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs'

import { Card }  from './card';
const _components = { Card };

const figmaEmbed = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0?node-id=509%3A2935',
  }
};

export default {
  title: 'MagLev Elements/Atoms/Card',
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
      mlv-card {
        width: ${args.width}px;
        height: ${args.height}px;
      }

      mlv-card img {
        height: 250px;
      }

      mlv-card footer {
        text-align: center;
      }
    </style>
    <mlv-card>
      ${when(args.imageSrc, () => html`
        <img slot="image" src="${args.imageSrc}">
      `)}

      ${args.content}

      ${when(args.footerTxt, () => html`
        <footer slot="footer">
          ${args.footerTxt}


          ${when(args.showButton, () => html`
            <mlv-button label="Proceed" icon="arrow"></mlv-button>
          `)}
        </footer>
      `)}
    </mlv-card>
  `,
  parameters: figmaEmbed,
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