import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import { keyNavigationList } from '@nvidia-elements/core/internal';

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

export function KeyNavigationListControllerDemo() {
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
        <section @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>`;
    }
  }
  customElements.get('demo-key-navigation-list') || customElements.define('demo-key-navigation-list', DemoKeyNavigationList);
  return html`<demo-key-navigation-list></demo-key-navigation-list>`;
}

export function KeyNavigationListControllerVerticalDemo() {
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
        <section class="vertical" @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>
      `;
    }
  }
  customElements.get('demo-key-navigation-list-vertical') || customElements.define('demo-key-navigation-list-vertical', DemoKeyNavigationListVertical);
  return html`<demo-key-navigation-list-vertical></demo-key-navigation-list-vertical>`;
}

export function KeyNavigationListLoopControllerDemo() {
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
        <section class="vertical" @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(i => html`<div>
            <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
          </div>`)}
        </section>`;
    }
  }
  customElements.get('demo-key-navigation-list-loop') || customElements.define('demo-key-navigation-list-loop', DemoKeyNavigationListLoop);
  return html`<demo-key-navigation-list-loop></demo-key-navigation-list-loop>`;
}
