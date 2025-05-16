import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/tabs/define.js';

export default {
  title: 'Elements/Card',
  component: 'nve-card'
};

export const Default = {
  render: () => html`
  <nve-card>
    <nve-card-header>
      <div slot="title">Title</div>
      <div slot="subtitle">Sub Title</div>
    </nve-card-header>
    <nve-card-content>
      <p>card content</p>
    </nve-card-content>
    <nve-card-footer>
      <nve-button style="margin-left: auto">Action</nve-button>
    </nve-card-footer>
  </nve-card>
  `
};

export const CardWithContentLayout = {
  render: () => html`
  <nve-card>
    <nve-card-content>
      <div nve-layout="row align:space-around">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    </nve-card-content>
  </nve-card>
  `
}

export const MediaCard = {
  render: () => html`
  <div nve-layout="grid gap:md span-items:6 align:stretch" style="height: 380px">
    <nve-card style="height: 100%; width: 100%;">
      <img src="static/images/test-image-3.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
      <nve-card-content>
        <p>card content</p>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 100%; width: 100%;">
      <img src="static/images/test-image-2.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
      <nve-card-content>
        <p>card content</p>
      </nve-card-content>
    </nve-card>
  </div>
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

export const DescriptionList = {
  render: () => html`
  <nve-card style="width: 650px">
    <nve-card-header>
      <h2 slot="title">Nautical Terms</h2>
    </nve-card-header>
    <nve-card-content>
      <dl nve-layout="grid gap:lg">
        <dt nve-layout="span:4" nve-text="body muted medium">Knot</dt>
        <dd nve-layout="span:8" nve-text="body">Knot is a unit of speed equaling 1 nautical mile per hour.</dd>

        <dt nve-layout="span:4" nve-text="body muted medium">Port</dt>
        <dd nve-layout="span:8" nve-text="body">Port is the nautical term that refers to the left side of a ship, as perceived by a person facing towards the bow (the front of the vessel).</dd>

        <dt nve-layout="span:4" nve-text="body muted medium">Starboard</dt>
        <dd nve-layout="span:8" nve-text="body">Starboard is the nautical term that refers to the right side of a vessel, as perceived by a person facing towards the bow (the front of the vessel).</dd>
      </dl>
    </nve-card-content>
  </nve-card>
  `
}

export const Tabs = {
  render: () => html`
  <nve-card style="width:400px; height:200px">
    <nve-card-header>
      <div slot="title">Title</div>
      <nve-tabs>
        <nve-tabs-item selected>tab 1</nve-tabs-item>
        <nve-tabs-item>tab 2</nve-tabs-item>
        <nve-tabs-item>tab 3</nve-tabs-item>
      </nve-tabs>
    </nve-card-header>

    <nve-card-content> Card Content </nve-card-content>
  </nve-card>
  `
}

export const ContainerFill = {
  render: () => html`
  <nve-card container="full">
    <nve-card-content>
      Container Fill
    </nve-card-content>
  </nve-card>
  `
}

export const ContainerFlat = {
  render: () => html`
  <nve-card container="flat">
    <nve-card-content>
      Container Flat
    </nve-card-content>
  </nve-card>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="pad:md align:center">
  <nve-card style="width: 400px; height: 300px;">
    <nve-card-header>
      <div slot="title">Title</div>
      <div slot="subtitle">Sub Title</div>
    </nve-card-header>

    <nve-card-content>
      Card Content
    </nve-card-content>

    <nve-card-footer>
      <div nve-layout="grid span-items:6 gap:xs">
        <nve-button>Cancel</nve-button>  
        <nve-button>Action</nve-button>
      </div>
    </nve-card-footer>
  </nve-card>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="pad:md align:center">
  <nve-card style="width: 400px; height: 300px;">
    <nve-card-header>
      <div slot="title">Title</div>
      <div slot="subtitle">Sub Title</div>
    </nve-card-header>

    <nve-card-content>
      Card Content
    </nve-card-content>

    <nve-card-footer>
      <div nve-layout="grid span-items:6 gap:xs">
        <nve-button>Cancel</nve-button>  
        <nve-button>Action</nve-button>
      </div>
    </nve-card-footer>
  </nve-card>
</div>
  `
}

export const Audit = {
  render: () => html`
  <!-- invalid padding usage -->
  <nve-card nve-layout="pad:md"></nve-card>

  <!-- invalid parent element -->
  <nve-card-header>
    card header
  </nve-card-header>
  <nve-card-content>
    card content
  </nve-card-content>
  <nve-card-footer>
    card footer
  </nve-card-footer>
  `
};
