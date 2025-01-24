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
  title: 'Elements/Page/Examples',
  component: 'nve-page',
};

export const Content = {
  render: () => html`
<style>
  nve-page[debug] {
    div {
      padding: 12px;
      width: 100%;
      height: 100%;
      font-size: var(--nve-ref-font-size-100);
    }

    main {
      font-size: var(--nve-ref-font-size-100);
    }

    [slot='left'],
    [slot='right'],
    [slot='bottom'] {
      background: var(--nve-ref-color-green-grass-400);
    }

    [slot='left-aside'],
    [slot='right-aside'] {
      background: var(--nve-ref-color-purple-lavender-400);
    }

    [slot='header'],
    [slot='footer'] {
      background: var(--nve-ref-color-red-tomato-400);
    }

    [slot='subheader'],
    [slot='subfooter'] {
      background: var(--nve-ref-color-blue-cobalt-400);
    }
  }
</style>
<nve-page debug>
  <div slot="header">header</div>
  <div slot="subheader">subheader</div>
  <div slot="left-aside">left-aside</div>
  <div slot="left" style="min-width: 180px;">left</div>
  <main style="height: 100%">main</main>
  <div slot="bottom" style="min-height: 140px;">bottom</div>
  <div slot="right" style="min-width: 180px;">right</div>
  <div slot="right-aside">right-aside</div>
  <div slot="subfooter">subfooter</div>
  <div slot="footer">footer</div>
</nve-page>
  `
};

export const Default = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotBanner = {
  render: () => html`
<nve-page>
  <nve-alert-group slot="header" status="warning" prominence="emphasis" container="full">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-group>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotSubheader = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotSubheaderLarge = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotLeft = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

export const SlotRight = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>

  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>right</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

export const SlotBottom = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>

  <nve-page-panel slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

export const SlotLeftAside = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotRightAside = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
  `
};

export const SlotSubfooter = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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

export const SlotFooter = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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

export const PagePanelExpandable = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel expandable slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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

export const PagePanelClosable = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel closable slot="left" size="sm">
    <nve-page-panel-content>left</nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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

export const PagePanelTabs = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="left" size="sm" expandable>
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

export const PagePanelHeadings = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="right" size="sm" closable>
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
 * @description Use document scroll for static content sites that do not require a fixed navigation.
 */
export const DocumentScroll = {
  render: () => html`
<nve-page document-scroll>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body" style="min-height: 110vh">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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
 * @description Use Page Panel to create navigation that is within the context of the current view.
 */
export const InteractionPanel = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-icon-button slot="prefix" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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
 * @description Use Page Panel with Toolbar to create complex navigation groups that are within the context of the current view.
 */
export const InteractionPanelNavigation = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="left-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button value="repo" icon-name="branch"></nve-icon-button>
      <nve-icon-button value="ai" icon-name="sparkles"></nve-icon-button>
      <nve-icon-button value="settings" icon-name="gear"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-page-panel slot="left" size="sm" expandable hidden>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>
</nve-page>
<script type="module">
  const toolbar = document.querySelector('nve-toolbar');
  const panel = document.querySelector('nve-page-panel');
  const panelHeader = document.querySelector('nve-page-panel h3');
  const menus = Array.from(document.querySelectorAll('nve-page-panel nve-menu'));

  panel.addEventListener('close', () => (panel.hidden = true));

  toolbar.addEventListener('click', e => {
    if (e.target.localName === 'nve-icon-button') {
      panel.hidden = false;
      panelHeader.textContent = e.target.value;
      menus.forEach(i => (i.hidden = true));
      menus.find(i => i.id === e.target.value).hidden = false;
    }
  });
</script>
  `
};

/**
 * @description Use Drawer to create navigation that is outside the context of the current view.
 */
export const InteractionDrawer = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-icon-button popovertarget="drawer" slot="prefix" container="flat" icon-name="menu" aria-label="menu"></nve-icon-button>
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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
 * @description Example demo demonstrating a stress test of all available slot layouts.
 */
export const KitchenSink = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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

  <nve-page-panel slot="left" closable size="sm">
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <div style="min-height: 100vh; width: 1px;"></div>
  </main>

  <nve-page-panel closable slot="bottom" size="sm">
    <nve-page-panel-content>bottom</nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel closable slot="right" size="sm">
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
    <a href="#" nve-text="link">docmentation</a>
    <a href="#" nve-text="link">logging</a>
    <a href="#" nve-text="link">contact</a>
  </nve-toolbar>
</nve-page>
  `
};

// patterns

export const PageLayoutCardGrid = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:stretch-horizontal">
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
        <img src="images/test-image-2.webp" alt="example visualization for media card demo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
        <nve-card-content>
          <p>•︎•︎•︎ •︎•︎•︎ •︎•︎•︎</p>
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

export const PageLayoutVideo = {
  render: () => html`
<nve-page style="--padding: 0">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
            <h2 nve-text="heading lg">Subheader</h2>
          </section>
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>
      content...
    </nve-page-panel-content>
  </nve-page-panel>

  <video playsinline muted loop width="100%" style="max-height: 100%; margin: auto;">
    <source src="video/background-nv.mp4" type="video/mp4">
  </video>

  <nve-page-panel slot="bottom" style="max-height: 100px">
    <nve-page-panel-content>
      <div nve-layout="column align:center" style="max-width: 1024px; margin: 0 auto;">
        <nve-range>
          <input type="range" min="0" max="100" value="0" />
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
  const video = document.querySelector('video')
  const playButton = document.querySelector('nve-icon-button[aria-label="play/pause"]');
  const startButton = document.querySelector('nve-icon-button[aria-label="start"]');
  const endButton = document.querySelector('nve-icon-button[aria-label="end"]');
  const range = document.querySelector('nve-range input');
  
  video.addEventListener('timeupdate', e => (range.value = (video.currentTime / video.duration) * 100));
  range.addEventListener('input', e => (video.currentTime = video.duration * (range.value / 100)));
  startButton.addEventListener('click', () => (video.currentTime = 0));
  endButton.addEventListener('click', () => (video.currentTime = video.duration));

  playButton.addEventListener('click', () => {
    if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2) {
      playButton.iconName = 'play';
      video.pause();
    } else {
      playButton.iconName = 'pause';
      video.play();
    }
  });
</script>
  `
};

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
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
          <input type="range" min="0" max="100" value="0" />
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

export const PageLayoutEditor = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Playground</h2>
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
    <p nve-text="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </main>

  <nve-page-panel closable slot="bottom" size="sm">
    <nve-page-panel-content>console output</nve-page-panel-content>
  </nve-page-panel>

  <nve-toolbar slot="footer">
    <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
    <span nve-text="body sm muted">last updated 12 mins ago</span>
  </nve-toolbar>
</nve-page>
  `
};

export const PageLayoutSteps = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Employee</h2>
    <nve-button selected container="flat">Benefits</nve-button>
    <nve-button container="flat">Account</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 980px; min-height: 980px; margin: auto">
    <div nve-layout="row align:center pad-bottom:lg">
      <nve-steps>
        <nve-steps-item selected>Your Information</nve-steps-item>
        <nve-steps-item>Your Benefits</nve-steps-item>
        <nve-steps-item>Adjustments</nve-steps-item>
        <nve-steps-item>Final Overview</nve-steps-item>
        <nve-steps-item>Confirm</nve-steps-item>
      </nve-steps>
    </div>

    <h1 nve-text="heading lg">Your Information</h1>
    
    <nve-card style="min-height: 300px; width: 100%;"></nve-card>

    <nve-card style="min-height: 300px; width: 100%; margin-bottom: 24px;"></nve-card>
  </main>

  <nve-page-panel slot="footer">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between" style="max-width: 980px; margin: auto">
        <nve-button container="flat" disabled size="sm">Previous</nve-button>
        <nve-button interaction="emphasis" size="sm">Continue</nve-button>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

export const Resize = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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

export const ResizeMulti = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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

export const ResizeSnap = {
  render: () => html`
<nve-page style="--padding: var(--nve-ref-space-lg)">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <p nve-text="body">Double click the resize handle to snap to the min or max.</p>

  <nve-resize-handle slot="right" dir="rtl" min="2" max="900" value="320" orientation="vertical"></nve-resize-handle>
  <nve-page-panel style="width: 320px" slot="right">
    <nve-page-panel-content></nve-page-panel-content>
  </nve-page-panel>
</nve-page>

<script type="module">
  const handle = document.querySelector('nve-resize-handle');
  const panel = document.querySelector('nve-page-panel');
  handle.addEventListener('input', e => {
    panel.style.width = e.target.value + 'px';
  });
</script>
  `
};
