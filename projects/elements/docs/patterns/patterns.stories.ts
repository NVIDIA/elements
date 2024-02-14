import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/grid/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/tabs/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'patterns'
};

export const Row = {
  render: () => html`
  <div>
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

export const LayoutHeaderFullWidthCards = {
  render: () => {
    return html`
    <div mlv-layout="column full align:stretch">
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
    <div mlv-layout="column full align:stretch">
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
    <div mlv-layout="column full align:stretch">
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

export const ButtonRowFilledIcon = {
  render: () => html`
  <div mlv-layout="row gap:xs">
    <mlv-icon-button icon-name="double-chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button icon-name="chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button icon-name="chevron" direction="down"></mlv-icon-button>
    <mlv-icon-button icon-name="double-chevron" direction="down"></mlv-icon-button>
  </div>
  `
};

export const ButtonRowFlatIcon = {
  render: () => html`
  <div mlv-layout="row gap:xxxs">
    <mlv-icon-button interaction="flat" icon-name="double-chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button interaction="flat" icon-name="chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button interaction="flat" icon-name="chevron" direction="down"></mlv-icon-button>
    <mlv-icon-button interaction="flat" icon-name="double-chevron" direction="down"></mlv-icon-button>
  </div>
  `
};

export const ButtonRowSmallFlatIcon = {
  render: () => html`
  <div mlv-layout="row gap:xxxs">
    <mlv-icon-button interaction="flat" size="sm" icon-name="double-chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button interaction="flat" size="sm" icon-name="chevron" direction="up"></mlv-icon-button>
    <mlv-icon-button interaction="flat" size="sm" icon-name="chevron" direction="down"></mlv-icon-button>
    <mlv-icon-button interaction="flat" size="sm" icon-name="double-chevron" direction="down"></mlv-icon-button>
  </div>
  `
};

export const ButtonRowFlatText = {
  render: () => html`
  <div mlv-layout="row gap:xxxs">
    <mlv-button interaction="flat">Button CTA</mlv-button>
    <mlv-button interaction="flat">Button CTA</mlv-button>
  </div>
  `
};

export const ButtonRowFlatTextWithIcon = {
  render: () => html`
  <div mlv-layout="row gap:xxxs">
    <mlv-button interaction="flat">
      <mlv-icon name="gear" style="--color: var(--mlv-sys-text-muted-color)"></mlv-icon>
      Sync MB
    </mlv-button>
    <mlv-button interaction="flat">
      <mlv-icon name="undo" style="--color: var(--mlv-sys-text-muted-color)"></mlv-icon>
      Revert Timestamps
    </mlv-button>
    <mlv-button interaction="flat">
      <mlv-icon name="add" style="--color: var(--mlv-sys-text-muted-color)"></mlv-icon>
      Add Event
    </mlv-button>
  </div>
  `
};

export const ButtonRowFilledTextWithIcon = {
  render: () => html`
  <div mlv-layout="row gap:xs">
    <mlv-button>Button CTA</mlv-button>
    <mlv-button>Button CTA</mlv-button>
    <mlv-button interaction="emphasize">Button CTA</mlv-button>
    <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
  </div>
  `
};

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

export const ShortcutFilled = {
  render: () => html`
    <kbd mlv-text="code">CMD + C</kbd>
  `
};

export const ShortcutFlat = {
  render: () => html`
    <kbd mlv-text="code flat">CMD + C</kbd>
  `
};

export const ShortcutDropdown = {
  render: () => html`
  <mlv-button id="code-menu">dropdown</mlv-button>

  <mlv-dropdown anchor="code-menu" trigger="code-menu" hidden>
    <mlv-menu>
      <mlv-menu-item>
        <mlv-icon name="edit"></mlv-icon> Edit
      </mlv-menu-item>

      <mlv-menu-item>
        <div mlv-layout="row align:space-between full">
          <span mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon name="copy"></mlv-icon> Copy
          </span>

          <kbd mlv-text="code">CMD + C</kbd>
        </div>
      </mlv-menu-item>

      <mlv-menu-item>
        <mlv-icon name="delete"></mlv-icon> Delete
      </mlv-menu-item>
    </mlv-menu>
  </mlv-dropdown>


  <script>
    const dropdown = document.querySelector('mlv-dropdown');
    dropdown.addEventListener('open', () => dropdown.hidden = false);
    dropdown.addEventListener('close', () => dropdown.hidden = true);
  </script>
  `
  };
