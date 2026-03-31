import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Card',
  component: 'nve-card'
};

/**
 * @summary Basic card component with header, content, and footer sections. Use this as a starting point for simple content containers.
 */
export const Default = {
  render: () => html`
  <nve-card>
    <nve-card-header>
      <h2 nve-text="heading sm medium">Heading</h2>
    </nve-card-header>
    <nve-card-content>
      <p nve-text="body" style="min-height: 64px">card content</p>
    </nve-card-content>
    <nve-card-footer>
      <p nve-text="body">card footer</p>
    </nve-card-footer>
  </nve-card>
  `
};

/**
 * @summary Card with action buttons in the footer, including primary and secondary actions for interactive card layouts.
 */
export const Actions = {
  render: () => html`
  <nve-card>
    <nve-card-header>
      <div nve-layout="column gap:xs">
        <h2 nve-text="heading sm bold">Heading</h2>
        <h3 nve-text="body sm muted">Sub Heading</h3>
      </div>
    </nve-card-header>
    <nve-card-content>
      <p nve-text="body" style="min-height: 64px">card content</p>
    </nve-card-content>
    <nve-card-footer>
      <div nve-layout="row gap:xs">
        <nve-button container="flat" style="margin-left: auto">cancel</nve-button>  
        <nve-button>action</nve-button>
      </div>
    </nve-card-footer>
  </nve-card>
  `
}

/**
 * @summary Cards with media content (images) displayed in a grid layout, ideal for photo galleries, product catalogs, or visual content showcases.
 */
export const MediaCard = {
  render: () => html`
  <div nve-layout="grid gap:md span-items:6 align:stretch" style="max-width: 900px">
    <nve-card style="height: 100%; width: 100%;">
      <img src="static/images/test-image-1.svg" alt="example visualization for media card demo" loading="lazy" style="width: 100%; object-fit: cover;" />
      <nve-card-content>
        <p nve-text="body" style="min-height: 24px">card content</p>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 100%; width: 100%;">
      <img src="static/images/test-image-1.svg" alt="example visualization for media card demo" loading="lazy" style="width: 100%; object-fit: cover;" />
      <nve-card-content>
        <p nve-text="body" style="min-height: 24px">card content</p>
      </nve-card-content>
    </nve-card>
  </div>
  `
}

/**
 * @summary Card with a divider separating different content sections, useful for organizing related but distinct information within a single card.
 */
export const WithDivider = {
  render: () => html`
    <nve-card style="width: 400px; height: 300px;">
      <nve-card-header>
        <h2 nve-text="heading sm bold">Heading</h2>
      </nve-card-header>
      <nve-card-content>
        <p nve-text="body">card content</p>
      </nve-card-content>
      <nve-divider></nve-divider>
      <nve-card-content>
        <p nve-text="body">card content</p>
      </nve-card-content>
    </nve-card>
  `
}

/**
 * @summary Card containing a description list layout, perfect for displaying key-value pairs, definitions, or structured data in a readable format.
 */
export const DescriptionList = {
  render: () => html`
  <nve-card style="width: 650px">
    <nve-card-header>
      <h2 nve-text="heading sm bold">Nautical Terms</h2>
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

/**
 * @summary Card with integrated tabs in the header for multi-panel content within a single card interface.
 */
export const WithTabs = {
  render: () => html`
  <nve-card style="width:400px; height:200px">
    <nve-card-header>
      <h2 nve-text="heading sm bold">Heading</h2>
      <nve-tabs>
        <nve-tabs-item selected>tab 1</nve-tabs-item>
        <nve-tabs-item>tab 2</nve-tabs-item>
        <nve-tabs-item>tab 3</nve-tabs-item>
      </nve-tabs>
    </nve-card-header>
    <nve-card-content>
      <p nve-text="body">card content</p>
    </nve-card-content>
  </nve-card>
  `
}

/**
 * @summary Card with full container styling that extends to the edges, suitable for full-width layouts or when you want the card to blend with its container.
 */
export const ContainerFull = {
  render: () => html`
  <nve-card container="full">
    <nve-card-content>
      <p nve-text="body">container full</p>
    </nve-card-content>
  </nve-card>
  `
}

/**
 * @summary Card with flat container styling that removes the default card elevation, ideal for subtle content containers or when you want a more minimal appearance.
 */
export const ContainerFlat = {
  render: () => html`
  <nve-card container="flat">
    <nve-card-content>
      <p nve-text="body">container flat</p>
    </nve-card-content>
  </nve-card>
  `
}

/**
 * @summary Examples of invalid card usage patterns for testing and documentation purposes, showing what not to do when implementing cards.
 * @tags test-case
 */
export const Audit = {
  /* eslint-disable @nvidia-elements/lint/no-restricted-attributes */
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
  /* eslint-enable */
};

/**
 * @summary Card with overflow content, where the card body scrolls when content exceeds the card height.
 */
export const OverflowContent = {
  render: () => html`
  <nve-card style="height: 250px; width: 400px;">
    <nve-card-header>
      <h2 nve-text="heading sm medium">Heading</h2>
    </nve-card-header>
    <nve-card-content>
      <p nve-text="body" style="margin-bottom: 300px">card content</p>
      <p nve-text="body">card content</p>
    </nve-card-content>
    <nve-card-footer>
      <p nve-text="body">card footer</p>
    </nve-card-footer>
  </nve-card>
  `
};
