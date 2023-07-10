import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/tabs/define.js';
import { Panel } from '../../panel/panel';

export default {
  title: 'Page Patterns/Examples'
};
interface ArgTypes {
  panelSide?: string;
  grid?: boolean;
}

const togglePanel = (isClosable?: boolean) => {
  const panel = document.querySelector(`mlv-panel#closable-${isClosable}`) as Panel;
  panel.expanded = !panel.expanded;
}

const renderPanel = (isClosable?: boolean) => html`
  <mlv-panel expanded ?closable=${isClosable} behavior-expand id="closable-${isClosable}">
    <mlv-panel-header>
      <div slot="title">${isClosable ? 'Details Panel' : 'Navigation Panel'}</div>
    </mlv-panel-header>


      ${ when(isClosable, () => html`
        <mlv-panel-content mlv-layout="column gap:xl">
          <mlv-tabs behavior-select>
            <mlv-tabs-item selected>Tab A</mlv-tabs-item>
            <mlv-tabs-item>Tab B</mlv-tabs-item>
            <mlv-tabs-item>Tab C</mlv-tabs-item>
          </mlv-tabs>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Release</label>
            <p mlv-text="eyebrow sm">RainbowBridge/08-18-2021AM/A2A</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Date</label>
            <p mlv-text="eyebrow sm">2021-08-18</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">State</label>
            <mlv-button mlv-control>Indexed</mlv-button>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Driver</label>
            <p mlv-text="eyebrow sm">Kenjiro Ono</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Copilot</label>
            <p mlv-text="eyebrow sm">Kenichi Yoshii</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">GVS</label>
            <a href="#" mlv-text="link body sm"
              >http://testbot/testbot/view/content...</a
            >
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Session ID</label>
            <a href="#" mlv-text="link body sm">Experiment 12345</a>
          </div>
        </mlv-panel-content>
      `, () => html`
        <mlv-panel-content mlv-layout="column align:stretch">
          <mlv-tabs vertical behavior-select>
            <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
            <mlv-tabs-item>Tab 2</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
            <mlv-tabs-item disabled>Disabled</mlv-tabs-item>
            <mlv-tabs-item>Tab 5</mlv-tabs-item>
          </mlv-tabs>
        </mlv-panel-content>
      `)}
  </mlv-panel>
`;

const renderCard = (height?: number, cardSpan?: number, cardBorderRadius?: string) => html`
  <mlv-card style="--border-radius: ${ifDefined(cardBorderRadius)}" mlv-layout="span:${ifDefined(cardSpan)}">
    <mlv-card-header>
      <div slot="title">Card Title</div>
      <mlv-icon-button slot="header-action" icon-name="additional-actions" interaction="flat"></mlv-icon-button>
    </mlv-card-header>
    <mlv-card-content style="height: ${height}px"> Card Content </mlv-card-content>
  </mlv-card>
`;


const StackedCardsWithPanel = {
  render: (args: ArgTypes) => html`
    <style>
      header {
        background-color: var(--mlv-sys-layer-container-background);
      }

      mlv-panel-content {
        width: 328px;
      }
    </style>

    <main mlv-theme="root" mlv-layout="column gap:lg align:stretch">
        <header mlv-layout="column gap:md pad-top:md pad-right:md pad-left:md align:stretch">
          <section mlv-layout="row align:space-between align:vertical-center">
            <div mlv-layout="row gap:sm align:vertical-center">
              <mlv-icon-button icon-name="navigate-back" aria-label="navigate-back"></mlv-icon-button>
              <h1 mlv-text="heading lg bold">Page Heading</h1>
            </div>

            <div mlv-layout="row gap:sm align:vertical-center">
              <section mlv-layout="column gap:md">
                <span mlv-text="body sm muted">Created by</span>
                <span mlv-text="body sm semibold">First Last</span>
              </section>

              <section mlv-layout="column gap:sm">
                <span mlv-text="body sm muted">Created on</span>
                <span mlv-text="body sm semibold">00/00/00</span>
              </section>

              <section mlv-layout="column gap:sm">
                <span mlv-text="body sm muted">Updated</span>
                <span mlv-text="body sm semibold">00/00/00</span>
              </section>

              <section mlv-layout="column gap:sm">
                <span mlv-text="body sm muted">Tests Ran</span>
                <span mlv-text="body sm semibold">## Times</span>
              </section>

              <section mlv-layout="column gap:sm">
                <span mlv-text="body sm muted">Status</span>
                <span mlv-text="body sm semibold">Complete</span>

              </section>

              <div mlv-layout="row gap:sm pad:sm">
                <mlv-divider orientation="vertical"></mlv-divider>
                <mlv-button>Default</mlv-button>
                <mlv-icon-button icon-name="information" aria-label="information" @click=${() => togglePanel(args.panelSide === 'right')}></mlv-icon-button>
                <mlv-icon-button icon-name="additional-actions" aria-label="additional actions"></mlv-icon-button>
              </div>
            </div>
          </section>

          <mlv-tabs behavior-select>
            <mlv-tabs-item selected>First Tab</mlv-tabs-item>
            <mlv-tabs-item>Second Tab</mlv-tabs-item>
            <mlv-tabs-item>Third Tab</mlv-tabs-item>
            <mlv-tabs-item>Fourth Tab</mlv-tabs-item>
            <mlv-tabs-item disabled>Disabled Tab</mlv-tabs-item>
          </mlv-tabs>
        </header>

        <div mlv-layout="row gap:lg align:stretch">
          ${ when(args.panelSide === 'left', () => html`
            <aside mlv-layout="align:vertical-stretch">
              ${renderPanel(false)}
            </aside>
          `)}

          ${ when(!args.grid, () => html`
            <section mlv-layout="column gap:lg align:stretch grow">
              ${renderCard(200, undefined, !args.panelSide ? 'none' : undefined)}

              ${renderCard(200, undefined, !args.panelSide ? 'none' : undefined)}

              ${renderCard(200, undefined, !args.panelSide ? 'none' : undefined)}
            </section>
          `)}

          ${ when(args.grid, () => html`
            <section mlv-layout="grid gap:lg span-items:6">
              ${renderCard(250, 12)}

              ${renderCard(200, 6)}

              ${renderCard(200, 6)}

              ${renderCard(200, 6)}

              ${renderCard(200, 6)}
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