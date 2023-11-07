import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/tabs/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/grid/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/menu/define.js';
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
  <div nve-theme="root">
    <nve-card role="listitem" container="full">
      <nve-card-content nve-layout="grid align:vertical-center align:space-between gap:md">
        <div nve-layout="span:4 row gap:md align:vertical-center">
          <img src="https://placehold.co/600x400" style="max-width: 100px; border-radius: var(--nve-ref-border-radius-sm)" />
          <div nve-layout="column gap:sm">
            <h2 nve-text="label medium">Activity Dashboard</h2>
            <p nve-text="body sm muted">Last saved: Oct 19, 21 by Camru</p>
          </div>
        </div>
        <p nve-text="body sm" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP</p>
        <div nve-layout="span:3 row gap:sm align:right">
          <div nve-layout="row gap:xs">
            <nve-icon-button icon-name="eye"></nve-icon-button>
            <nve-icon-button icon-name="copy"></nve-icon-button>
            <nve-icon-button icon-name="delete"></nve-icon-button>
          </div>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-button>Add Panel</nve-button>
        </div>
      </nve-card-content>
    </nve-card>
  </div>
  `
}

export const Header = {
  render: () => html`
  <div nve-theme="root" nve-layout="column full align:stretch">
    <nve-card container="full">
      <nve-card-content nve-layout="column gap:md align:stretch pad-left:xl pad-right:xl">
        <div nve-layout="row gap:sm align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>
          <nve-icon-button icon-name="more-actions" style="margin-left: auto"></nve-icon-button>
          <nve-icon-button icon-name="more-actions"></nve-icon-button>
        </div>
        <p nve-text="body">content</p>
      </nve-card-content>
    </nve-card>
  </div>
  `
}

export const HeaderTabs = {
  render: () => html`
  <div nve-theme="root" nve-layout="column full align:stretch">
    <nve-card container="full">
      <div nve-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
        <div nve-layout="row gap:sm align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>
          <nve-icon-button icon-name="more-actions" style="margin-left: auto"></nve-icon-button>
          <nve-icon-button icon-name="more-actions"></nve-icon-button>
        </div>
        <nve-tabs>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
        </nve-tabs>
      </div>
    </nve-card>
  </div>
  `
}

export const HeaderComplex = {
  render: () => html`
  <div nve-theme="root" nve-layout="column full align:stretch">
    <nve-card container="full">
      <section nve-layout="column gap:lg align:stretch pad-top:md pad-right:xl pad-bottom:md pad-left:xl">
        <div nve-layout="row gap:md align:center">
          <h1 nve-text="heading lg semibold">Page Title</h1>

          <div nve-layout="row gap:sm" style="margin-left: auto">
            <nve-icon-button icon-name="information-circle-stroke" aria-label="information"></nve-icon-button>
            <nve-icon-button icon-name="edit" aria-label="edit"></nve-icon-button>
            <nve-icon-button icon-name="more-actions" aria-label="additional actions"></nve-icon-button>
          </div>
        </div>

        <div nve-layout="row gap:xl align:vertical-center">
          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted medium">Session ID</span>
            <a nve-text="body sm semibold link" href="#">13245768</a>
          </section>

          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted medium">Driver</span>
            <span nve-text="body sm semibold">Jane Doe</span>
          </section>

          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted medium">Co-Pilot</span>
            <span nve-text="body sm semibold">John Doe</span>
          </section>

          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted medium">Route</span>
            <span nve-text="body sm semibold">Santa Clara</span>
          </section>

          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted medium">Status</span>
            <span nve-text="body sm semibold"><nve-badge status="success">complete</nve-badge></span>
          </section>
        </div>
      </section>
    </nve-card>
  </div>
  `
}

export const LayoutHeaderFullWidthCards = {
  render: () => {
    return html`
    <div nve-theme="root" nve-layout="column full align:stretch">
      <nve-card container="full">
        <div nve-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div nve-layout="row gap:sm align:vertical-center">
            <h1 nve-text="heading lg semibold">Page Title</h1>
            <nve-icon-button icon-name="more-actions" style="margin-left: auto"></nve-icon-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </div>
          <nve-tabs>
            <nve-tabs-item selected>Tab 1</nve-tabs-item>
            <nve-tabs-item>Tab 2</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
          </nve-tabs>
        </div>
      </nve-card>

      <main nve-layout="column gap:lg pad-top:lg align:stretch">
        <nve-card container="full" style="width: 100%; height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
        <nve-card container="full" style="width: 100%; height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
      </main>
    </div>
    `
  }
}

export const LayoutHeaderGridCards = {
  render: () => {
    return html`
    <div nve-theme="root" nve-layout="column full align:stretch">
      <nve-card container="full">
        <div nve-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div nve-layout="row gap:sm align:vertical-center">
            <h1 nve-text="heading lg semibold">Page Title</h1>
            <nve-icon-button icon-name="more-actions" style="margin-left: auto"></nve-icon-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </div>
          <nve-tabs>
            <nve-tabs-item selected>Tab 1</nve-tabs-item>
            <nve-tabs-item>Tab 2</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
          </nve-tabs>
        </div>
      </nve-card>

      <main nve-layout="grid gap:lg span-items:6 pad:lg">
        <nve-card style="height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
        <nve-card style="height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
        <nve-card style="height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
        <nve-card style="height: 250px;">
          <nve-card-header>
            <div slot="title">Card Title</div>
          </nve-card-header>
          <nve-card-content>Card Content</nve-card-content>
        </nve-card>
      </main>
    </div>
    `
  }
}

export const LayoutHeaderPanelCards = {
  render: () => {
    return html`
    <div nve-theme="root" nve-layout="column full align:stretch">
      <nve-card container="full">
        <div nve-layout="column gap:md align:stretch pad-top:md pad-left:xl pad-right:xl pad-bottom">
          <div nve-layout="row gap:sm align:vertical-center">
            <h1 nve-text="heading lg semibold">Page Title</h1>
            <nve-icon-button icon-name="more-actions" style="margin-left: auto"></nve-icon-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </div>
          <nve-tabs>
            <nve-tabs-item selected>Tab 1</nve-tabs-item>
            <nve-tabs-item>Tab 2</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
          </nve-tabs>
        </div>
      </nve-card>

      <div nve-layout="row">
        <section nve-layout="column full align:stretch gap:lg pad:lg">
          <nve-card style="height: 250px;">
            <nve-card-header>
              <div slot="title">Card Title</div>
            </nve-card-header>
            <nve-card-content>Card Content</nve-card-content>
          </nve-card>
          <nve-card style="height: 250px;">
            <nve-card-header>
              <div slot="title">Card Title</div>
            </nve-card-header>
            <nve-card-content>Card Content</nve-card-content>
          </nve-card>
        </section>

        <nve-panel expanded style="min-width: 360px; z-index: 99; height: 100vh; position: sticky; top: 0; right: 0;">
          <nve-panel-header>
            <h2 slot="title">Panel Heading</h2>
          </nve-panel-header>
          <nve-panel-content>
            Panel Content
          </nve-panel-content>
        </nve-panel>
      </div>
    </div>
    `
  }
}

export const ButtonRowFilledIcon = {
  render: () => html`
  <div nve-layout="row gap:xs">
    <nve-icon-button icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

export const ButtonRowFlatIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-icon-button interaction="flat" icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button interaction="flat" icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button interaction="flat" icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button interaction="flat" icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

export const ButtonRowSmallFlatIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-icon-button interaction="flat" size="sm" icon-name="double-chevron" direction="up"></nve-icon-button>
    <nve-icon-button interaction="flat" size="sm" icon-name="chevron" direction="up"></nve-icon-button>
    <nve-icon-button interaction="flat" size="sm" icon-name="chevron" direction="down"></nve-icon-button>
    <nve-icon-button interaction="flat" size="sm" icon-name="double-chevron" direction="down"></nve-icon-button>
  </div>
  `
};

export const ButtonRowFlatText = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button interaction="flat">Button CTA</nve-button>
    <nve-button interaction="flat">Button CTA</nve-button>
  </div>
  `
};

export const ButtonRowFlatTextWithIcon = {
  render: () => html`
  <div nve-layout="row gap:xxxs">
    <nve-button interaction="flat">
      <nve-icon name="gear" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Sync MB
    </nve-button>
    <nve-button interaction="flat">
      <nve-icon name="undo" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Revert Timestamps
    </nve-button>
    <nve-button interaction="flat">
      <nve-icon name="add" style="--color: var(--nve-sys-text-muted-color)"></nve-icon>
      Add Event
    </nve-button>
  </div>
  `
};

export const ButtonRowFilledTextWithIcon = {
  render: () => html`
  <div nve-layout="row gap:xs">
    <nve-button>Button CTA</nve-button>
    <nve-button>Button CTA</nve-button>
    <nve-button interaction="emphasize">Button CTA</nve-button>
    <nve-icon-button icon-name="more-actions"></nve-icon-button>
  </div>
  `
};

export const Trend = {
  render: () => html`
  <div nve-layout="column gap:sm">
    <label nve-text="label medium sm muted">Label</label>
    <div nve-layout="row gap:sm align:vertical-center">
      <h3 nve-text="heading semibold lg">198,298</h3>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
    <label nve-text="label medium sm muted">Since last week</label>
  </div>
  `
};

export const TrendTopBadge = {
  render: () => html`
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <label nve-text="label medium sm muted">Since last week</label>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
    <div nve-layout="column gap:sm">
      <h3 nve-text="heading semibold lg">198,298</h3>
      <label nve-text="label medium sm muted">Label</label>
    </div>
  </div>
  `
};

export const TrendBottomBadge = {
  render: () => html`
  <div nve-layout="column gap:xs">
    <div nve-layout="column gap:sm">
      <label nve-text="label medium sm muted">Label</label>
      <h3 nve-text="heading semibold lg">198,298</h3>
    </div>
    <div nve-layout="row gap:sm align:vertical-center">
      <label nve-text="label medium sm muted">Since last week</label>
      <nve-badge status="trend-up">+15%</nve-badge>
    </div>
  </div>
  `
};

export const ShortcutFilled = {
  render: () => html`
    <div nve-text="code">CMD + C</div>
  `
};

export const ShortcutFlat = {
  render: () => html`
    <div nve-text="code" style="background: none">CMD + C</div>
  `
};

export const ShortcutDropdown = {
  render: () => html`
  <nve-button id="code-menu">dropdown</nve-button>

  <nve-dropdown anchor="code-menu" trigger="code-menu" hidden>
    <nve-menu>
      <nve-menu-item>
        <nve-icon name="edit"></nve-icon> Edit
      </nve-menu-item>

      <nve-menu-item>
        <nve-icon name="copy"></nve-icon> Copy
        
        <div nve-text="code">CMD + C</div>
      </nve-menu-item>

      <nve-menu-item>
        <nve-icon name="delete"></nve-icon> Delete
      </nve-menu-item>
    </nve-menu>
  </nve-dropdown>


  <script>
    const dropdown = document.querySelector('nve-dropdown');
    dropdown.addEventListener('open', () => dropdown.hidden = false);
    dropdown.addEventListener('close', () => dropdown.hidden = true);
  </script>
  `
  };
