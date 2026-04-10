// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
      <p nve-text="body">Selected: ${this.selected}</p>
      <p nve-text="body">Active: ${this.active}</p>
      <section @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
        ${Array.from(Array(10).keys()).map(i => html`<div>
          <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
        </div>`)}
      </section>`;
  }
}
customElements.get('demo-key-navigation-list') || customElements.define('demo-key-navigation-list', DemoKeyNavigationList);

/**
 * @summary Horizontal list keyboard navigation controller with arrow key support.
 * @tags test-case
 */
export const ListDemo = {
  render: () => html`<demo-key-navigation-list></demo-key-navigation-list>`
};

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
      <p nve-text="body">Selected: ${this.selected}</p>
      <p nve-text="body">Active: ${this.active}</p>
      <section class="vertical" @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
        ${Array.from(Array(10).keys()).map(i => html`<div>
          <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
        </div>`)}
      </section>
    `;
  }
}
customElements.get('demo-key-navigation-list-vertical') || customElements.define('demo-key-navigation-list-vertical', DemoKeyNavigationListVertical);

/**
 * @summary Vertical list keyboard navigation controller with up and down arrow key support.
 * @tags test-case
 */
export const VerticalDemo = {
  render: () => html`<demo-key-navigation-list-vertical></demo-key-navigation-list-vertical>`
};

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
      <p nve-text="body">Selected: ${this.selected}</p>
      <p nve-text="body">Active: ${this.active}</p>
      <section class="vertical" @nve-key-change=${e => (this.active = e.detail.activeItem.textContent)}>
        ${Array.from(Array(10).keys()).map(i => html`<div>
          <button ?selected=${this.selected === `${i}`} @click=${e => (this.selected = e.target.innerText)}>${i}</button>
        </div>`)}
      </section>`;
  }
}
customElements.get('demo-key-navigation-list-loop') || customElements.define('demo-key-navigation-list-loop', DemoKeyNavigationListLoop);

/**
 * @summary Vertical list keyboard navigation with looping enabled to wrap from last item to first.
 * @tags test-case
 */
export const LoopDemo = {
  render: () => html`<demo-key-navigation-list-loop></demo-key-navigation-list-loop>`
};
