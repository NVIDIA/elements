// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit';
import { BaseButton } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Internal/Controllers'
}

class UIButton extends BaseButton {
  static styles = [css`
    :host {
      --background: hsl(0, 0%, 90%);
      --color: hsl(0, 0%, 0%);
      --cursor: pointer;
      display: inline-flex;
      position: relative;
    }

    [internal-host] {
      background: var(--background);
      color: var(--color);
      cursor: var(--cursor);
      padding: 8px 12px;
      min-width: 75px;
      text-align: center;
    }

    /* element states */
    :host(:hover) {
      --background: hsl(0, 0%, 95%);
    }

    :host(:state(active)) {
      --background: hsl(0, 0%, 85%);
    }

    :host(:state(pressed)) {
      --background: hsl(0, 0%, 85%);
    }

    :host(:state(expanded)) {
      --background: hsl(0, 0%, 85%);
    }

    :host(:state(disabled)) {
      --background: hsl(0, 0%, 80%);
      --color: hsl(0, 0%, 60%);
      --cursor: not-allowed;
    }

    :host(:state(readonly)) {
      --cursor: initial;
      --color: blue;
    }

    /* anchor styles */
    [internal-host]:focus-within {
      outline: Highlight solid 2px;
      outline: 5px auto -webkit-focus-ring-color;
    }

    ::slotted(a) {
      color: var(--color) !important;
      text-decoration: none !important;
      outline: 0 !important;
    }

    ::slotted(a)::after {
      position: absolute;
      content: '';
      inset: 0;
      display: block;
    }
  `]
}

customElements.get('ui-button') || customElements.define('ui-button', UIButton);

/**
 * Example of custom element button using the base button and controllers.
 * When a custom element extends the base button it will inherit all the
 * necessary button behaviors and states.
 * @summary Custom button element using BaseButton with pressed, expanded, disabled, and link states.
 * @tags test-case
 */
export const TypeButtonDemo = {
  render: () => html`
<ui-button>button</ui-button>
<ui-button pressed>pressed</ui-button>
<ui-button expanded>expanded</ui-button>
<ui-button selected>selected</ui-button>
<ui-button disabled>disabled</ui-button>
<ui-button><a href="#">link</a></ui-button>

<form id="type-button-demo-form" style="display: inline-flex;">
  <ui-button type="submit">submit</ui-button>
</form>
<script type="module">
  const form = document.querySelector('#type-button-demo-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('submit!');
  });
</script>`
};
