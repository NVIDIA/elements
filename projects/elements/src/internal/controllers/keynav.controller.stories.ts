import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { keyNavigationGrid, keyNavigationList, KeynavListConfig } from '@elements/elements/internal';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Internal/Controllers'
}

const styles = css`
  section {
    display: grid;
    gap: 4px;
    grid-template-columns: repeat(10, 50px);
  }

  .vertical {
    grid-template-rows: repeat(10, 1fr);
    grid-template-columns: 50px;
  }

  .row {
    display: contents;
  }

  button {
    width: 100%;
    height: 30px;
    min-width: 30px;
    display: block;
  }

  button[selected] {
    background: green;
    color: white;
  }
`;

export function keyNavigationGridController() {
  @keyNavigationGrid<DemoKeyNavigationGridController>()
  class DemoKeyNavigationGridController extends LitElement {
    get keynavGridConfig() {
      return {
        rows: this.shadowRoot.querySelectorAll<HTMLElement>('.row'),
        cells: this.shadowRoot.querySelectorAll<HTMLElement>('.cell')
      }
    }

    @state() private selected = '0,0';
    @state() private active = '';

    static styles = [styles];

    render() {
      return html`
        <p>Selected: ${this.selected}</p>
        <p>Active: ${this.active}</p>
        <section @nve-key-change=${(e: any) => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(() => Array.from(Array(10).keys())).map((r, ri) => html`<div class="row">
            ${r.map(c => html`<div class="cell">
              <button ?selected=${this.selected === `${ri}-${c}`} @click=${(e: any) => (this.selected = e.target.innerText)}>${ri}-${c}</button>
            </div>`)}
          </div>`)}
        </section>
      `;
    }
  }

  customElements.get('demo-key-navigation-grid') || customElements.define('demo-key-navigation-grid', DemoKeyNavigationGridController);
  return html`<demo-key-navigation-grid></demo-key-navigation-grid>`;
}

export function keyNavigationListController() {
  @keyNavigationList<DemoKeyNavigationList>()
  class DemoKeyNavigationList extends LitElement {
    get keynavListConfig() {
      return {
        items: this.shadowRoot.querySelectorAll<HTMLElement>('button')
      }
    }

    @state() private selected = '0';
    @state() private active = '';

    static styles = [styles];

    render() {
      return html`
        <p>Selected: ${this.selected}</p>
        <p>Active: ${this.active}</p>
        <section @nve-key-change=${(e: any) => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${(e: any) => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>`;
    }
  }
  customElements.get('demo-key-navigation-list') || customElements.define('demo-key-navigation-list', DemoKeyNavigationList);
  return html`<demo-key-navigation-list></demo-key-navigation-list>`;
}

export function keyNavigationListControllerVertical() {
  @keyNavigationList<DemoKeyNavigationListVertical>()
  class DemoKeyNavigationListVertical extends LitElement {
    get keynavListConfig(): KeynavListConfig {
      return {
        layout: 'vertical',
        items: this.shadowRoot.querySelectorAll<HTMLElement>('button')
      }
    }

    @state() private selected = '0';
    @state() private active = '';

    static styles = [styles];

    render() {
      return html`
        <p>Selected: ${this.selected}</p>
        <p>Active: ${this.active}</p>
        <section class="vertical" @nve-key-change=${(e: any) => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${(e: any) => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>
      `;
    }
  }
  customElements.get('demo-key-navigation-list-vertical') || customElements.define('demo-key-navigation-list-vertical', DemoKeyNavigationListVertical);
  return html`<demo-key-navigation-list-vertical></demo-key-navigation-list-vertical>`;
}

export function keyNavigationListLoopController() {
  @keyNavigationList<DemoKeyNavigationListLoop>()
  class DemoKeyNavigationListLoop extends LitElement {
    get keynavListConfig(): KeynavListConfig {
      return {
        loop: true,
        layout: 'vertical',
        items: this.shadowRoot.querySelectorAll<HTMLElement>('button')
      }
    }

    @state() private selected = '0';
    @state() private active = '';

    static styles = [styles];

    render() {
      return html`
        <p>Selected: ${this.selected}</p>
        <p>Active: ${this.active}</p>
        <section class="vertical" @nve-key-change=${(e: any) => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${(e: any) => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>`;
    }
  }
  customElements.get('demo-key-navigation-list-loop') || customElements.define('demo-key-navigation-list-loop', DemoKeyNavigationListLoop);
  return html`<demo-key-navigation-list-loop></demo-key-navigation-list-loop>`;
}