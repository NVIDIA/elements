import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/tabs/define.js';

export default {
  title: 'Patterns/Page Patterns/Examples'
};
interface ArgTypes {
  panelSide?: string;
  grid?: boolean;
}

const renderPanel = (isClosable?: boolean) => html`
  <nve-panel expanded ?closable=${isClosable}>
    <nve-panel-header>
      <div slot="title">Panel Title</div>
    </nve-panel-header>

    <nve-panel-content nve-layout="column gap:xl">
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Tab A</nve-tabs-item>
        <nve-tabs-item>Tab B</nve-tabs-item>
        <nve-tabs-item>Tab C</nve-tabs-item>
      </nve-tabs>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">Release</label>
        <p nve-text="eyebrow sm">RainbowBridge/08-18-2021AM/A2A</p>
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">Date</label>
        <p nve-text="eyebrow sm">2021-08-18</p>
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">State</label>
        <nve-button nve-control>Indexed</nve-button>
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">Driver</label>
        <p nve-text="eyebrow sm">Kenjiro Ono</p>
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">Copilot</label>
        <p nve-text="eyebrow sm">Kenichi Yoshii</p>
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">GVS</label>
        <a href="#" nve-text="link body sm"
          >http://testbot/testbot/view/content...</a
        >
      </div>

      <div nve-layout="column gap:xs">
        <label nve-text="body sm default muted">Session ID</label>
        <a href="#" nve-text="link body sm">Experiment 12345</a>
      </div>
    </nve-panel-content>
  </nve-panel>
`;

const renderCard = (height?: number, span?: number) => html`
  <nve-card style="height: ${height}px;" nve-layout="span:${ifDefined(span)}">
    <nve-card-header>
      <div slot="title">Card Title</div>
      <nve-icon-button slot="header-action" icon-name="additional-actions" interaction="ghost"></nve-icon-button>
    </nve-card-header>
    <nve-card-content> Card Content </nve-card-content>
  </nve-card>
`;

const StackedCardsWithPanel = {
  render: (args: ArgTypes) => html`
    <main nve-theme="root" nve-layout="column gap:lg align:stretch">
        <header nve-layout="column gap:md pad:md align:stretch">
          <section nve-layout="row align:space-between align:vertical-center">
            <div nve-layout="row gap:sm align:vertical-center">
              <nve-icon-button icon-name="navigate-back" aria-label="navigate-back"></nve-icon-button>
              <h1 nve-text="heading lg bold">Page Heading</h1>
            </div>

            <aside nve-layout="row gap:sm align:vertical-center">
              <section nve-layout="column gap:md">
                <span nve-text="body sm muted">Created by</span>
                <span nve-text="body sm semibold">First Last</span>
              </section>

              <section nve-layout="column gap:sm">
                <span nve-text="body sm muted">Created on</span>
                <span nve-text="body sm semibold">00/00/00</span>
              </section>

              <section nve-layout="column gap:sm">
                <span nve-text="body sm muted">Updated</span>
                <span nve-text="body sm semibold">00/00/00</span>
              </section>

              <section nve-layout="column gap:sm">
                <span nve-text="body sm muted">Tests Ran</span>
                <span nve-text="body sm semibold">## Times</span>
              </section>

              <section nve-layout="column gap:sm">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm semibold">Complete</span>

              </section>

              <div nve-layout="row gap:sm pad:sm" style="border-left: 1px solid gray">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="information" interaction="emphasize" aria-label="information"></nve-icon-button>
                <nve-icon-button icon-name="additional-actions" aria-label="additional actions"></nve-icon-button>
              </div>
            </aside>
          </section>

          <nve-tabs behavior-select>
            <nve-tabs-item selected>First Tab</nve-tabs-item>
            <nve-tabs-item>Second Tab</nve-tabs-item>
            <nve-tabs-item>Third Tab</nve-tabs-item>
            <nve-tabs-item>Fourth Tab</nve-tabs-item>
            <nve-tabs-item disabled>Disabled Tab</nve-tabs-item>
          </nve-tabs>
        </header>

        <div nve-layout="row gap:md align:stretch">
          ${ when(args.panelSide === 'left', () => html`
            <aside style="max-width: 300px;" nve-layout="align:vertical-stretch">
              ${renderPanel()}
            </aside>
          `)}

          ${ when(!args.grid, () => html`
            <section nve-layout="column gap:md align:stretch grow">
              ${renderCard(220)}

              ${renderCard(220)}

              ${renderCard(220)}
            </section>
          `)}

          ${ when(args.grid, () => html`
            <section nve-layout="grid gap:md span-items:6">
              ${renderCard(300, 12)}

              ${renderCard(220)}

              ${renderCard(220)}

              ${renderCard(220)}

              ${renderCard(220)}
            </section>
          `)}

          ${ when(args.panelSide === 'right', () => renderPanel(true))}
        </div>
    </main>
  `
}


export const StackedCardsWithCollapsablePanel = {
  ...StackedCardsWithPanel,
  args: {
    panelSide: 'left'
  }
}

export const StackedCardsWithClosablePanel = {
  ...StackedCardsWithPanel,
  args: {
    panelSide: 'right'
  }
}

export const StackedCardsFullWidth = {
  ...StackedCardsWithPanel,
  args: {
    panelSide: null
  }
}

export const StackedCardGrid = {
  ...StackedCardsWithPanel,
  args: {
    panelSide: null,
    grid: true
  }
}