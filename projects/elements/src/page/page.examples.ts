import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/resize-handle/define.js';

export default {
  title: 'Elements/Page',
  component: 'nve-page',
};

/**
 * @summary Basic nve-page layout with a header and main content.
 */
export const Default = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>panel</nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Page layout slot reference showing all available panel positions including header, subheader, left, right, bottom, and aside regions. Use as a starting point for understanding how to compose complex application layouts.
 */
export const Slots = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <h2 nve-text="heading" slot="prefix">header</h2>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>subheader</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left-aside">
    <nve-page-panel-content>left-aside</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <main>
    <p nve-text="body">main content</p>
  </main>
  <nve-page-panel slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="right-aside">
    <nve-page-panel-content>right-aside</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="subfooter">
    <nve-page-panel-content>subfooter</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="footer">
    <nve-page-panel-content>footer</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary All slot areas and debug backgrounds for nve-page.
 * @tags test-case
 */
export const Content = {
  render: () => html`
<style>
  nve-page[debug] {
    nve-page-panel-content {
      font-size: var(--nve-ref-font-size-100);
    }

    main {
      min-height: 100vh;
      padding: var(--nve-ref-space-md);
    }

    [slot='left'],
    [slot='right'],
    [slot='bottom'] {
      --background: var(--nve-ref-color-green-grass-400);
    }

    [slot='left-aside'],
    [slot='right-aside'] {
      --background: var(--nve-ref-color-purple-lavender-400);
    }

    [slot='header'],
    [slot='footer'] {
      --background: var(--nve-ref-color-red-tomato-400);
    }

    [slot='subheader'],
    [slot='subfooter'] {
      --background: var(--nve-ref-color-blue-cobalt-400);
    }
  }
</style>
<nve-page debug>
  <nve-page-header slot="header">
    <h2 nve-text="heading" slot="prefix">header</h2>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>subheader</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left-aside">
    <nve-page-panel-content>left-aside</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <main>
    <p nve-text="body">main content</p>
  </main>
  <nve-page-panel slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="right-aside">
    <nve-page-panel-content>right-aside</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="subfooter">
    <nve-page-panel-content>subfooter</nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="footer">
    <nve-page-panel-content>footer</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Warning banner in the header slot above the page header.
 * @tags test-case
 */
export const SlotBanner = {
  render: () => html`
<nve-page>
  <nve-alert-group slot="header" status="warning" prominence="emphasis" container="full">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-group>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Toolbar in the subheader slot below the header for secondary navigation or actions.
 * @tags test-case
 */
export const SlotSubheader = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="subheader">
    <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
    <h2 nve-text="heading sm">Subheader</h2>
  </nve-toolbar>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Large subheader panel with back navigation, title, metadata, and action buttons. Use for detail pages that need prominent context like entity names, status badges, and key-value metadata above the main content.
 */
export const SlotSubheaderLarge = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:md align:stretch">
        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
            <h2 nve-text="heading lg semibold">Subheader Large</h2>
          </section>
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Left slot with a page panel for side navigation or content.
 * @tags test-case
 */
export const SlotLeft = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Right slot with a page panel for side content.
 * @tags test-case
 */
export const SlotRight = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Bottom slot with a page panel for footer or supplemental content.
 * @tags test-case
 */
export const SlotBottom = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-page-panel slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Left-aside slot with a vertical toolbar for navigation.
 * @tags test-case
 */
export const SlotLeftAside = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="left-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="play" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="add"></nve-icon-button>
      <nve-icon-button icon-name="delete"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Right-aside slot with a vertical toolbar for actions or navigation.
 * @tags test-case
 */
export const SlotRightAside = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="right-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="branch"></nve-icon-button>
      <nve-icon-button icon-name="sparkles"></nve-icon-button>
      <nve-icon-button icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Subfooter slot with a toolbar for status or metadata.
 * @tags test-case
 */
export const SlotSubfooter = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-toolbar slot="right-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="branch"></nve-icon-button>
      <nve-icon-button icon-name="sparkles"></nve-icon-button>
      <nve-icon-button icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-toolbar slot="subfooter">
    <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
    <span nve-text="body sm muted">last updated 12 mins ago</span>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Footer slot with a toolbar for links or actions.
 * @tags test-case
 */
export const SlotFooter = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-toolbar slot="right-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="branch"></nve-icon-button>
      <nve-icon-button icon-name="sparkles"></nve-icon-button>
      <nve-icon-button icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-toolbar slot="footer">
    <a href="#" nve-text="link sm">docmentation</a>
    <a href="#" nve-text="link sm">logging</a>
    <a href="#" nve-text="link sm">contact</a>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Use Page Panel with Invoker Command API to dynamically open and close page panels.
 */
export const InvokerCommand = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-icon-button slot="suffix" commandfor="invoker-example" command="--toggle" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
  </nve-page-header>

  <nve-page-panel id="invoker-example" slot="left" size="sm" hidden>
    <nve-icon-button commandfor="invoker-example" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>
      <p nve-text="body">panel content</p>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Expandable page panels that collapse to a slim strip and toggle open with chevron buttons. Use when panels contain supplementary content that users access intermittently, preserving main content space while keeping panels accessible.
 */
export const PagePanelExpandable = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel id="panel-left" slot="left" size="sm">
    <nve-icon-button commandfor="panel-left" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="left" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <div nve-layout="row gap:xs">
      <nve-button commandfor="panel-left" command="--toggle">Toggle Left Panel</nve-button>
      <nve-button commandfor="panel-right" command="--toggle">Toggle Right Panel</nve-button>
      <nve-button commandfor="panel-bottom" command="--toggle">Toggle Bottom Panel</nve-button>
    </div>
  </main>

  <nve-page-panel id="panel-right" slot="right" size="sm">
    <nve-icon-button commandfor="panel-right" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="right" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel id="panel-bottom" slot="bottom" size="sm">
    <nve-icon-button commandfor="panel-bottom" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="down" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Closable page panels that fully remove from the layout when dismissed. Use when panels open on demand for temporary tasks like viewing item details or applying filters, and the user needs full main content space when done.
 */
export const PagePanelClosable = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel id="panel-left" slot="left" size="sm">
    <nve-icon-button commandfor="panel-left" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <div nve-layout="row gap:xs">
      <nve-button commandfor="panel-left" command="--toggle">Toggle Left Panel</nve-button>
      <nve-button commandfor="panel-right" command="--toggle">Toggle Right Panel</nve-button>
      <nve-button commandfor="panel-bottom" command="--toggle">Toggle Bottom Panel</nve-button>
    </div>
  </main>

  <nve-page-panel id="panel-right" slot="right" size="sm">
    <nve-icon-button commandfor="panel-right" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel id="panel-bottom" slot="bottom" size="sm">
    <nve-icon-button commandfor="panel-bottom" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Use Drawer to create navigation that is outside the context of the current view.
 */
export const InteractionDrawer = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-icon-button popovertarget="drawer" slot="prefix" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-drawer id="drawer" slot="left-aside" position="left" size="sm" closable style="--top: 48px">
    <nve-drawer-header>
      <h3 nve-text="heading medium sm">Drawer Header</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <p nve-text="body">drawer content</p>
    </nve-drawer-content>
    <nve-drawer-footer>
      <p nve-text="body">drawer footer</p>
    </nve-drawer-footer>
  </nve-drawer>
</nve-page>
  `
};

/**
 * @summary Use Page Panel with Toolbar to create complex navigation groups that are within the context of the current view.
 */
export const InteractionPanelNavigation = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="left-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button commandfor="nav-panel" command="--open" value="repo" icon-name="branch"></nve-icon-button>
      <nve-icon-button commandfor="nav-panel" command="--open" value="ai" icon-name="sparkles"></nve-icon-button>
      <nve-icon-button commandfor="nav-panel" command="--open" value="settings" icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-page-panel id="nav-panel" slot="left" size="sm" hidden>
    <nve-icon-button commandfor="nav-panel" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="left" aria-label="close"></nve-icon-button>
    <nve-page-panel-header>
      <h3 nve-text="heading medium sm">git</h3>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <nve-menu id="repo" hidden>
        <nve-menu-item>Clone</nve-menu-item>
        <nve-menu-item>Branch</nve-menu-item>
        <nve-menu-item>Release</nve-menu-item>
      </nve-menu>
      <nve-menu id="ai" hidden>
        <nve-menu-item>Prompts</nve-menu-item>
        <nve-menu-item>Models</nve-menu-item>
        <nve-menu-item>Training</nve-menu-item>
      </nve-menu>
      <nve-menu id="settings" hidden>
        <nve-menu-item>Profile</nve-menu-item>
        <nve-menu-item>Account</nve-menu-item>
        <nve-menu-item>Logs</nve-menu-item>
      </nve-menu>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
<script type="module">
  const toolbar = document.querySelector('nve-toolbar');
  const panelHeader = document.querySelector('nve-page-panel h3');
  const menus = Array.from(document.querySelectorAll('nve-page-panel nve-menu'));

  toolbar.addEventListener('click', e => {
    if (e.target.localName === 'nve-icon-button') {
      panelHeader.textContent = e.target.value;
      menus.forEach(i => (i.hidden = true));
      menus.find(i => i.id === e.target.value).hidden = false;
    }
  });
</script>
  `
};

/**
 * @summary Page panel with tabbed header for switching between categorized content views within a sidebar. Use when a panel contains related sections like outline, search, and settings that share the same screen region.
 */
export const PagePanelTabs = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-header>
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Tab 1</nve-tabs-item>
        <nve-tabs-item>Tab 2</nve-tabs-item>
        <nve-tabs-item>Tab 3</nve-tabs-item>
      </nve-tabs>
    </nve-page-panel-header>
    <nve-page-panel-content>
      Panel Content
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Page panel with title and subtitle headings in the header for labeling panel content. Use to provide clear context about what the panel contains, such as a details pane or properties inspector.
 */
export const PagePanelHeadings = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-header>
      <div nve-layout="column gap:xs">
        <h3 nve-text="heading medium sm">Header</h3>
        <h4 nve-text="body muted">Sub Header</h4>
      </div>
    </nve-page-panel-header>
    <nve-page-panel-content>
      Panel Content
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Use document scroll for static content sites that do not require a fixed navigation.
 */
export const DocumentScroll = {
  render: () => html`
<nve-page document-scroll>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body" style="min-height: 110vh">page content</p>
  </main>

  <nve-toolbar slot="footer">
    <a href="#" nve-text="link sm">docmentation</a>
    <a href="#" nve-text="link sm">logging</a>
    <a href="#" nve-text="link sm">contact</a>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Stress test of all available slot layouts for nve-page.
 * @tags test-case
 */
export const KitchenSink = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:md align:stretch">
        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
            <h1 nve-text="heading lg">Session 254a2039f294</h1>
          </section>
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Session ID</span>
            <a nve-text="body sm bold link" href="#">254a2039f294</a>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Build</span>
            <span nve-text="body sm bold">254a2v1801</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Location</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>

  <nve-toolbar slot="left-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="play" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="add"></nve-icon-button>
      <nve-icon-button icon-name="delete"></nve-icon-button>
    </nve-button-group>
    <nve-divider></nve-divider>
    <nve-button-group>
      <nve-icon-button icon-name="bounding-box"></nve-icon-button>
      <nve-icon-button icon-name="branch"></nve-icon-button>
      <nve-icon-button icon-name="exclamation-triangle"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>
      <nve-tree behavior-expand>
        <nve-tree-node><a href="#">Browse</a></nve-tree-node>
        <nve-tree-node><a href="#">Debug</a></nve-tree-node>
        <nve-tree-node>
          Events
          <nve-tree-node><a href="#">Alert</a></nve-tree-node>
          <nve-tree-node><a href="#">Badge</a></nve-tree-node>
          <nve-tree-node><a href="#">Dialog</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node expanded>
          Sensors
          <nve-tree-node><a href="#">front_tele_30fov</a></nve-tree-node>
          <nve-tree-node><a href="#">front_wide_120fov</a></nve-tree-node>
          <nve-tree-node><a href="#">left_fisheye_200fov</a></nve-tree-node>
          <nve-tree-node><a href="#">right_fisheye_200fov</a></nve-tree-node>
          <nve-tree-node><a href="#">rear_left_70fov</a></nve-tree-node>
          <nve-tree-node><a href="#">rear_right_70fov</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Segments
          <nve-tree-node><a href="#">JavaScript</a></nve-tree-node>
          <nve-tree-node><a href="#">HTML</a></nve-tree-node>
          <nve-tree-node><a href="#">CSS</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
    <div style="min-height: 100vh; width: 1px;"></div>
  </main>

  <nve-page-panel slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>

  <nve-toolbar slot="right-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="sparkles"></nve-icon-button>
      <nve-icon-button icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-toolbar slot="subfooter">
    <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
    <span nve-text="body sm muted">last updated 12 mins ago</span>
  </nve-toolbar>

  <nve-toolbar slot="footer">
    <a href="#" nve-text="link sm">docmentation</a>
    <a href="#" nve-text="link sm">logging</a>
    <a href="#" nve-text="link sm">contact</a>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Card grid page layout for browsable collections like infrastructure dashboards, asset catalogs, or media galleries. Use with view-mode toggles for switching between grid and table presentations.
 * @tags pattern
 */
export const PageLayoutCardGrid = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <nve-search container="flat">
      <input type="search" aria-label="search drives" />
    </nve-search>

    <nve-button-group container="rounded" behavior-select="single" orientation="horizontal">
      <nve-icon-button icon-name="view-as-grid" pressed></nve-icon-button>
      <nve-icon-button icon-name="table"></nve-icon-button>
      <nve-icon-button icon-name="map"></nve-icon-button>
    </nve-button-group>

    <section nve-layout="grid span-items:3 gap:md">
      ${new Array(24).fill('').map(() => html`
      <nve-card style="height: 100%; width: 100%;">
        <img src="static/images/test-image-2.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
        <nve-card-content>
          <p nve-text="body">•︎•︎•︎ •︎•︎•︎ •︎•︎•︎</p>
        </nve-card-content>
        <nve-card-footer>
          <div nve-layout="grid span-items:6 gap:xs">
            <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
            <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
          </div>
        </nve-card-footer>
      </nve-card>
      `)}
    </section>
  </main>
</nve-page>
  `
};

/**
 * @summary Multi-video grid layout with synchronized playback controls for monitoring and review workflows. Ideal for surveillance dashboards, AV sensor feeds, or simulation playback where concurrent streams need simultaneous viewing.
 * @tags pattern
 */
export const PageLayoutMultiVideo = {
  render: () => html`
<style>
  nve-page {
    --padding: 0;
  }

  .videos {
    display: grid;
    align-content: center;
    grid-template: auto auto auto / 1fr 1fr 1fr;
    gap: var(--nve-ref-space-xxs);
    margin: auto;
    height: 95%;
    width: 95%;
    max-width: 1660px;
    aspect-ratio: 16 / 9;
  }
</style>
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:md align:stretch">
        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
            <h2 nve-text="heading lg">Subheader Large</h2>
          </section>
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>
      content...
    </nve-page-panel-content>
  </nve-page-panel>

  <section class="videos">
    <video playsinline muted width="100%">
      <source src="video/multi-cam-1.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-2.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-3.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-4.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-5.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-6.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-7.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-8.mp4" type="video/mp4">
    </video>
    <video playsinline muted width="100%">
      <source src="video/multi-cam-9.mp4" type="video/mp4">
    </video>
  </section>

  <nve-page-panel slot="bottom" style="max-height: 100px">
    <nve-page-panel-content>
      <div nve-layout="column align:center" style="max-width: 1024px; margin: 0 auto;">
        <nve-range>
          <input type="range" min="0" max="100" value="0" aria-label="video playback" />
        </nve-range>
        <nve-button-group container="flat">
          <nve-icon-button icon-name="start" aria-label="start"></nve-icon-button>
          <nve-icon-button icon-name="play" aria-label="play/pause"></nve-icon-button>
          <nve-icon-button icon-name="start" direction="down" aria-label="end"></nve-icon-button>
        </nve-button-group>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
<script type="module">
  // DEMO CODE ONLY
  const videos = Array.from(document.querySelectorAll('video'));
  const playButton = document.querySelector('nve-icon-button[aria-label="play/pause"]');
  const startButton = document.querySelector('nve-icon-button[aria-label="start"]');
  const endButton = document.querySelector('nve-icon-button[aria-label="end"]');
  const range = document.querySelector('nve-range input');

  class VideoGroup extends EventTarget {
    playing = false;
    videos = [];

    get duration() {
      return this.videos[0].duration;
    }

    get currentTime() {
      return this.videos[0].currentTime;
    }

    constructor(videos = []) {
      super();
      this.videos = videos;

      async function animate() {
        if (this.playing && this.videos.every(video => video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA)) {
          await this.#nextFrame();
          if (this.duration === this.currentTime) {
            this.pause();
          }
        }
        requestAnimationFrame(animate.bind(this));
      }

      animate.call(this);
    }

    async #videoMetadataReady() {
      if (this.videos[0].readyState === 0) {
        return await new Promise(r => this.videos[0].addEventListener('loadedmetadata', () => r(null), { once: true }));
      } else {
        return new Promise(r => r());
      }
    }

    async play() {
      await this.#videoMetadataReady();

      if (this.videos[0].duration === this.videos[0].currentTime) {
        await this.setCurrentTime(0);
      }

      this.playing = true;
    }

    pause() {
      this.playing = false;
    }

    stop() {
      this.pause();
      this.setCurrentTime(0);
    }

    async #nextFrame() {
      this.videos.forEach(video => video.currentTime = video.currentTime + this.videos[0].duration / 60);
      await this.#timeUpdated();
    }

    async setCurrentTime(currentTime) {
      this.videos.forEach(video => video.currentTime = currentTime);
      await this.#timeUpdated();
    }
  
    async #timeUpdated() {
      await Promise.all(this.videos.map(video => {
        return new Promise(r => video.addEventListener('timeupdate', () => r(null), { once: true }))
      }));

      this.dispatchEvent(new CustomEvent('timeupdate', { detail: { currentTime: this.currentTime, percentage: (this.currentTime / this.duration) * 100  } }))
    }
  }

  const videoGroup = new VideoGroup(videos);

  videoGroup.addEventListener('timeupdate', e => {
    range.value = e.detail.percentage;
  });

  range.addEventListener('input', e => {
    videoGroup.setCurrentTime(videoGroup.duration * (range.value / 100));
  });

  startButton.addEventListener('click', () => {
    videoGroup.stop();
  });

  endButton.addEventListener('click', () => {
    videoGroup.setCurrentTime(videoGroup.duration);
  });

  playButton.addEventListener('click', () => {
    if (videoGroup.playing) {
      playButton.iconName = 'play';
      videoGroup.pause();
    } else {
      playButton.iconName = 'pause';
      videoGroup.play();
    }
  });
</script>
  `
};

/**
 * @summary IDE-style editor layout with file outline, main editor, and console panels. Use for code playgrounds, configuration editors, or development tools that need a split-pane workspace with toolbar controls.
 * @tags pattern
 */
export const PageLayoutEditor = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Playground</h2>
    <nve-button container="flat">Browse</nve-button>
    <nve-button container="flat">Editor</nve-button>
    <nve-button container="flat">Elements</nve-button>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="subheader">
    <nve-icon-button slot="prefix" icon-name="split-vertical"></nve-icon-button>
    <nve-divider slot="prefix" orientation="vertical"></nve-divider>
    <h2 slot="prefix" nve-text="heading sm" style="text-wrap: nowrap">Project</h2>
    <nve-button slot="suffix" interaction="emphasis">Save Project</nve-button>
    <nve-icon-button slot="suffix" icon-name="download"></nve-icon-button>
    <nve-divider slot="suffix" orientation="vertical"></nve-divider>
    <nve-button-group slot="suffix" container="rounded">
      <nve-icon-button icon-name="code"></nve-icon-button>
      <nve-icon-button selected icon-name="split-vertical"></nve-icon-button>
      <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
      <nve-icon-button icon-name="split-none"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-header>
      Outline
    </nve-page-panel-header>  
    <nve-page-panel-content>
      <nve-tree behavior-expand>
        <nve-tree-node><a href="#">html</a></nve-tree-node>
        <nve-tree-node expanded>
          head
          <nve-tree-node><a href="#">link</a></nve-tree-node>
          <nve-tree-node><a href="#">link</a></nve-tree-node>
          <nve-tree-node><a href="#">link</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node expanded>
          body
          <nve-tree-node><a href="#">nve-badge</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-page-panel id="console-panel" slot="bottom" size="sm">
    <nve-icon-button commandfor="console-panel" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
    <nve-page-panel-content>console output</nve-page-panel-content>
  </nve-page-panel>

  <nve-toolbar slot="footer">
    <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
    <span nve-text="body sm muted">last updated 12 mins ago</span>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Multi-step wizard layout with progress stepper for guided workflows. Use for onboarding flows, enrollment forms, or configuration processes where users complete sequential steps with clear progress tracking.
 * @tags pattern
 */
export const PageLayoutSteps = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 980px; min-height: 980px; margin: auto">
    <div nve-layout="row align:center pad-bottom:lg">
      <nve-steps>
        <nve-steps-item selected>Vehicle Info</nve-steps-item>
        <nve-steps-item>Sensor Suite</nve-steps-item>
        <nve-steps-item>Software Stack</nve-steps-item>
        <nve-steps-item>Safety Thresholds</nve-steps-item>
        <nve-steps-item>Flash Firmware</nve-steps-item>
      </nve-steps>
    </div>

    <h1 nve-text="heading lg">Vehicle Information</h1>
    
    <nve-card style="min-height: 300px; width: 100%;"></nve-card>

    <nve-card style="min-height: 300px; width: 100%; margin-bottom: 24px;"></nve-card>
  </main>

  <nve-page-panel slot="footer">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between gap:md" style="max-width:860px;margin:auto">
        <nve-button id="btn-back" container="flat" disabled size="sm">Back</nve-button>
        <div nve-layout="row gap:sm align:vertical-center">
          <span id="step-indicator" nve-text="body sm muted">Step 1 of 5</span>
          <nve-button id="btn-next" interaction="emphasis" size="sm">Next</nve-button>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Resizable left panel with drag handle for adjustable sidebar width. Use when users need to control the balance between navigation or outline panels and main content area.
 */
export const Resize = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel style="width: 200px" slot="left">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <nve-resize-handle slot="left" min="100" max="400" value="200" step="20" orientation="vertical"></nve-resize-handle>
</nve-page>

<script type="module">
  const handle = document.querySelector('nve-resize-handle');
  const panel = document.querySelector('nve-page-panel');
  handle.addEventListener('input', e => panel.style.width = e.target.value + 'px');
</script>
  `
};

/**
 * @summary Multi-panel resizable layout with independent drag handles on left, right, and bottom panels. Use for complex workspaces like IDEs or dashboards where users need to customize the size of each content region independently.
 */
export const ResizeMulti = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel style="width: 320px" slot="left">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <nve-resize-handle slot="left" orientation="vertical" min="100" max="480" value="320" step="20"></nve-resize-handle>

  <nve-resize-handle slot="bottom" min="100" max="480" value="320" step="20"></nve-resize-handle>
  <nve-page-panel style="height: 320px" slot="bottom">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>

  <nve-resize-handle slot="right" dir="rtl" orientation="vertical" min="100" max="480" value="320" step="20"></nve-resize-handle>
  <nve-page-panel style="width: 320px" slot="right">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>
</nve-page>

<script type="module">
  const leftHandle = document.querySelector('nve-resize-handle[slot=left]');
  const leftPanel = document.querySelector('nve-page-panel[slot=left]');
  leftHandle.addEventListener('input', e => leftPanel.style.width = e.target.value + 'px');

  const rightHandle = document.querySelector('nve-resize-handle[slot=right]');
  const rightPanel = document.querySelector('nve-page-panel[slot=right]');
  rightHandle.addEventListener('input', e => rightPanel.style.width = e.target.value + 'px');

  const bottomHandle = document.querySelector('nve-resize-handle[slot=bottom]');
  const bottomPanel = document.querySelector('nve-page-panel[slot=bottom]');
  bottomHandle.addEventListener('input', e => bottomPanel.style.height = e.target.value + 'px');
</script>
  `
};

/**
 * @summary Resize handle with snap-to-boundary behavior on double-click for quickly toggling a panel between collapsed and expanded states. Use for detail panels that users frequently show and hide.
 */
export const ResizeSnap = {
  render: () => html`
<nve-page style="--padding: var(--nve-ref-space-lg)">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <p nve-text="body">Double click the resize handle to snap to the min or max.</p>

  <nve-page-panel style="width: 320px" slot="left">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
  <nve-resize-handle slot="left" orientation="vertical" min="100" max="480" value="320" step="20"></nve-resize-handle>
</nve-page>
<script type="module">
  const leftHandle = document.querySelector('nve-resize-handle[slot=left]');
  const leftPanel = document.querySelector('nve-page-panel[slot=left]');
  leftHandle.addEventListener('input', e => leftPanel.style.width = e.target.value + 'px');
</script>
  `
};

/**
 * @summary Example of using explicit event listeners to control the state of a page panel.
 * @deprecated Use Page Panel with Invoker Command API to dynamically open and close page panels.
 * @tags test-case
 */
export const InteractionPanel = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-icon-button slot="prefix" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="left" size="sm" closable hidden>
    <nve-page-panel-header>
      <h3 nve-text="heading medium sm">Panel Header</h3>
    </nve-page-panel-header>  
    <nve-page-panel-content>
    <p nve-text="body">Panel Content</p>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
</nve-page>
<script type="module">
  const button = document.querySelector('[aria-label="menu"]');
  const panel = document.querySelector('nve-page-panel');

  button.addEventListener('click', () => panel.hidden = !panel.hidden);
  panel.addEventListener('close', () => panel.hidden = true);
</script>
  `
};

/**
 * @summary Expandable page panels in left, right, and bottom slots.
 * @deprecated Use Page Panel with Invoker Command API to dynamically open and close page panels with slotted icon buttons.
 */
export const PagePanelExpandableState = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel expandable slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-page-panel expandable slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel expandable slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Closable page panels in left, right, and bottom slots.
 * @deprecated Use Page Panel with Invoker Command API to dynamically open and close page panels with slotted icon buttons.
 */
export const PagePanelClosableState = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel closable slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>

  <nve-page-panel closable slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel closable slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};
