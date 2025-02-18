import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { keyNavigationGrid } from '@nvidia-elements/core/internal';

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

export function keyNavigationGridControllerDemo() {
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
        <section @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
          ${Array.from(Array(10).keys()).map(() => Array.from(Array(10).keys())).map((r, ri) => html`<div class="row">
            ${r.map(c => html`<div class="cell">
              <button ?selected=${this.selected === `${ri}-${c}`} @click=${e => (this.selected = e.target.innerText)}>${ri}-${c}</button>
            </div>`)}
          </div>`)}
        </section>
      `;
    }
  }

  customElements.get('demo-key-navigation-grid') || customElements.define('demo-key-navigation-grid', DemoKeyNavigationGridController);
  return html`<demo-key-navigation-grid></demo-key-navigation-grid>`;
}
