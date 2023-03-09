import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { withDesign } from 'storybook-addon-designs';
import { ComponentStatuses, generateDefaultStoryParameters } from '@elements/elements/internal';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

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
    <div mlv-theme="root">
      <mlv-card style=${'width:' + args.width + 'px; height:' + args.height + 'px'}>
        ${when(
          args.showHeader,
          () => html`
          <mlv-card-header>
            <div slot="title">Title</div>
            <div slot="subtitle">Sub Title</div>


            ${when(
              args.showAction,
              () => html`
                <mlv-icon-button slot="header-action" icon-name="additional-actions" interaction="ghost"></mlv-icon-button>
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
  args: { width: 300, height: 150, content: 'Card Content' }
};

export const CardWithContentLayout = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-card style="width: 400px; height: 300px;">
      <mlv-card-content mlv-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </mlv-card-content>
    </mlv-card>
  </div>
  `
}

export const MediaCard = {
  render: () => html`
  <div mlv-theme="root" mlv-layout="grid gap:md span-items:6 align:stretch" style="height: 480px">
    <mlv-card style="height: 100%; width: 100%;">
      <img src="images/test-image-3.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
      <mlv-card-content>
        <p>card content</p>
      </mlv-card-content>
      <mlv-card-footer>
        Proceed with Action
        <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
      </mlv-card-footer>
    </mlv-card>
    <mlv-card style="height: 100%; width: 100%;">
      <img src="images/test-image-2.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
      <mlv-card-content>
        <p>card content</p>
      </mlv-card-content>
      <mlv-card-footer>
        Proceed with Action
        <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
      </mlv-card-footer>
    </mlv-card>
  </div>
  `
}

export const CardWithMultipleContentsAndDivider = {
  render: () => html`
    <div mlv-theme="root">
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
    </div>
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

export const DescriptionList = {
  render: () => html`
<div mlv-theme="root">
  <mlv-card style="width: 650px">
    <mlv-card-header>
      <h2 slot="title">Nautical Terms</h2>
    </mlv-card-header>
    <mlv-card-content>
      <dl mlv-layout="grid gap:lg">
        <dt mlv-layout="span:4" mlv-text="muted">Knot</dt>
        <dd mlv-layout="span:8">Knot is a unit of speed equaling 1 nautical mile per hour.</dd>

        <dt mlv-layout="span:4" mlv-text="muted">Port</dt>
        <dd mlv-layout="span:8">Port is the nautical term that refers to the left side of a ship, as perceived by a person facing towards the bow (the front of the vessel).</dd>

        <dt mlv-layout="span:4" mlv-text="muted">Starboard</dt>
        <dd mlv-layout="span:8">Starboard is the nautical term that refers to the right side of a vessel, as perceived by a person facing towards the bow (the front of the vessel).</dd>
      </dl>
    </mlv-card-content>
  </mlv-card>
</div>
  `
}

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="pad:md align:center">
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

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="pad:md align:center">
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
