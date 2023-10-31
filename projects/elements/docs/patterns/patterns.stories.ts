import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/tabs/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/grid/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'patterns'
};

export const Default = {
  render: () => html`
    Pattern
  `
};

export const Row = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-card role="listitem" container="full">
      <mlv-card-content mlv-layout="grid align:vertical-center align:space-between gap:md">
        <div mlv-layout="span:4 row gap:md align:vertical-center">
          <img src="https://placehold.co/600x400" style="max-width: 100px; border-radius: var(--mlv-ref-border-radius-sm)" />
          <div mlv-layout="column gap:sm">
            <h2 mlv-text="label medium">Activity Dashboard</h2>
            <p mlv-text="body sm muted">Last saved: Oct 19, 21 by Camru</p>
          </div>
        </div>
        <p mlv-text="body sm" mlv-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP</p>
        <div mlv-layout="span:3 row gap:sm align:right">
          <div mlv-layout="row gap:xs">
            <mlv-icon-button icon-name="eye"></mlv-icon-button>
            <mlv-icon-button icon-name="copy"></mlv-icon-button>
            <mlv-icon-button icon-name="delete"></mlv-icon-button>
          </div>
          <mlv-divider orientation="vertical"></mlv-divider>
          <mlv-button>Add Panel</mlv-button>
        </div>
      </mlv-card-content>
    </mlv-card>
  </div>
  `
}

export const Header = {
  render: () => html`
  <div mlv-theme="root" mlv-layout="column full align:stretch">
    <mlv-card container="full">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-left:xl pad-right:xl">
        <div mlv-layout="row gap:sm align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>
          <mlv-icon-button icon-name="more-actions" style="margin-left: auto"></mlv-icon-button>
          <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
        </div>
        <p mlv-text="body">content</p>
      </mlv-card-content>
    </mlv-card>
  </div>
  `
}

export const HeaderTabs = {
  render: () => html`
  <div mlv-theme="root" mlv-layout="column full align:stretch">
    <mlv-card container="full">
      <div mlv-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
        <div mlv-layout="row gap:sm align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>
          <mlv-icon-button icon-name="more-actions" style="margin-left: auto"></mlv-icon-button>
          <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
        </div>
        <mlv-tabs>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
        </mlv-tabs>
      </div>
    </mlv-card>
  </div>
  `
}

export const HeaderComplex = {
  render: () => html`
  <div mlv-theme="root" mlv-layout="column full align:stretch">
    <mlv-card container="full">
      <section mlv-layout="column gap:lg align:stretch pad-top:md pad-right:xl pad-bottom:md pad-left:xl">
        <div mlv-layout="row gap:md align:center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>

          <div mlv-layout="row gap:sm" style="margin-left: auto">
            <mlv-icon-button icon-name="information-circle-stroke" aria-label="information"></mlv-icon-button>
            <mlv-icon-button icon-name="edit" aria-label="edit"></mlv-icon-button>
            <mlv-icon-button icon-name="more-actions" aria-label="additional actions"></mlv-icon-button>
          </div>
        </div>

        <div mlv-layout="row gap:xl align:vertical-center">
          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted medium">Session ID</span>
            <a mlv-text="body sm semibold link" href="#">13245768</a>
          </section>

          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted medium">Driver</span>
            <span mlv-text="body sm semibold">Jane Doe</span>
          </section>

          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted medium">Co-Pilot</span>
            <span mlv-text="body sm semibold">John Doe</span>
          </section>

          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted medium">Route</span>
            <span mlv-text="body sm semibold">Santa Clara</span>
          </section>

          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted medium">Status</span>
            <span mlv-text="body sm semibold"><mlv-badge status="success">complete</mlv-badge></span>
          </section>
        </div>
      </section>
    </mlv-card>
  </div>
  `
}

export const LayoutHeaderFullWidthCards = {
  render: () => {
    return html`
    <div mlv-theme="root" mlv-layout="column full align:stretch">
      <mlv-card container="full">
        <div mlv-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div mlv-layout="row gap:sm align:vertical-center">
            <h1 mlv-text="heading lg semibold">Page Title</h1>
            <mlv-icon-button icon-name="more-actions" style="margin-left: auto"></mlv-icon-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </div>
          <mlv-tabs>
            <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
            <mlv-tabs-item>Tab 2</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
          </mlv-tabs>
        </div>
      </mlv-card>

      <main mlv-layout="column gap:lg pad-top:lg align:stretch">
        <mlv-card container="full" style="width: 100%; height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
        <mlv-card container="full" style="width: 100%; height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
      </main>
    </div>
    `
  }
}

export const LayoutHeaderGridCards = {
  render: () => {
    return html`
    <div mlv-theme="root" mlv-layout="column full align:stretch">
      <mlv-card container="full">
        <div mlv-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div mlv-layout="row gap:sm align:vertical-center">
            <h1 mlv-text="heading lg semibold">Page Title</h1>
            <mlv-icon-button icon-name="more-actions" style="margin-left: auto"></mlv-icon-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </div>
          <mlv-tabs>
            <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
            <mlv-tabs-item>Tab 2</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
          </mlv-tabs>
        </div>
      </mlv-card>

      <main mlv-layout="grid gap:lg span-items:6 pad:lg">
        <mlv-card style="height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
        <mlv-card style="height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
        <mlv-card style="height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
        <mlv-card style="height: 250px;">
          <mlv-card-header>
            <div slot="title">Card Title</div>
          </mlv-card-header>
          <mlv-card-content>Card Content</mlv-card-content>
        </mlv-card>
      </main>
    </div>
    `
  }
}

export const LayoutHeaderPanelCards = {
  render: () => {
    return html`
    <div mlv-theme="root" mlv-layout="column full align:stretch">
      <mlv-card container="full">
        <div mlv-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div mlv-layout="row gap:sm align:vertical-center">
            <h1 mlv-text="heading lg semibold">Page Title</h1>
            <mlv-icon-button icon-name="more-actions" style="margin-left: auto"></mlv-icon-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </div>
          <mlv-tabs>
            <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
            <mlv-tabs-item>Tab 2</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
          </mlv-tabs>
        </div>
      </mlv-card>

      <div mlv-layout="row">
        <section mlv-layout="column full align:stretch gap:lg pad:lg">
          <mlv-card style="height: 250px;">
            <mlv-card-header>
              <div slot="title">Card Title</div>
            </mlv-card-header>
            <mlv-card-content>Card Content</mlv-card-content>
          </mlv-card>
          <mlv-card style="height: 250px;">
            <mlv-card-header>
              <div slot="title">Card Title</div>
            </mlv-card-header>
            <mlv-card-content>Card Content</mlv-card-content>
          </mlv-card>
        </section>

        <mlv-panel expanded style="min-width: 360px; z-index: 99; height: 100vh; position: sticky; top: 0; right: 0;">
          <mlv-panel-header>
            <h2 slot="title">Panel Heading</h2>
          </mlv-panel-header>
          <mlv-panel-content>
            Panel Content
          </mlv-panel-content>
        </mlv-panel>
      </div>
    </div>
    `
  }
}

export const Trend = {
  render: () => html`
  <div mlv-layout="column gap:sm">
    <label mlv-text="label medium sm muted">Label</label>
    <div mlv-layout="row gap:sm align:vertical-center">
      <h3 mlv-text="heading semibold lg">198,298</h3>
      <mlv-badge status="trend-up">+15%</mlv-badge>
    </div>
    <label mlv-text="label medium sm muted">Since last week</label>
  </div>
  `
};

export const TrendTopBadge = {
  render: () => html`
  <div mlv-layout="column gap:xs">
    <div mlv-layout="row gap:sm align:vertical-center">
      <label mlv-text="label medium sm muted">Since last week</label>
      <mlv-badge status="trend-up">+15%</mlv-badge>
    </div>
    <div mlv-layout="column gap:sm">
      <h3 mlv-text="heading semibold lg">198,298</h3>
      <label mlv-text="label medium sm muted">Label</label>
    </div>
  </div>
  `
};

export const TrendBottomBadge = {
  render: () => html`
  <div mlv-layout="column gap:xs">
    <div mlv-layout="column gap:sm">
      <label mlv-text="label medium sm muted">Label</label>
      <h3 mlv-text="heading semibold lg">198,298</h3>
    </div>
    <div mlv-layout="row gap:sm align:vertical-center">
      <label mlv-text="label medium sm muted">Since last week</label>
      <mlv-badge status="trend-up">+15%</mlv-badge>
    </div>
  </div>
  `
};