// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement } from 'lit';
import { GestureController } from '@nvidia-elements/core/internal';

export default {
  title: 'Internal/Controllers'
};

class GestureDemoElement extends LitElement {
  readonly #gestureController = new GestureController(this, {
    getCapabilities: () => ({ drag: true, pan: false, pinch: false, wheel: false })
  });

  static styles = css`
    :host {
      cursor: grab;
      display: grid;
      height: 64px;
      place-items: center;
      width: 64px;
    }

    :host([data-active]) {
      cursor: grabbing;
    }
  `;

  constructor() {
    super();
    this.#gestureController.target = this;
  }

  render() {
    return html`drag`;
  }
}

if (!customElements.get('gesture-controller-demo-element')) {
  customElements.define('gesture-controller-demo-element', GestureDemoElement);
}

/**
 * @summary Drag recognition delivered through gesture and unmatched pointer events. Use event details to move content and represent active pointer state.
 * @tags test-case
 */
export const Drag = {
  render: () => html`
<gesture-controller-demo-element></gesture-controller-demo-element>
<script type="module">
  const element = document.querySelector('gesture-controller-demo-element');
  let x = 0;
  let y = 0;

  element.addEventListener('nve-pointer-input', ({ detail }) => {
    if (detail.kind === 'pointerdown') element.dataset.active = '';
    if (detail.kind === 'pointerup' || detail.kind === 'pointercancel') delete element.dataset.active;
  });

  element.addEventListener('nve-gesture', ({ detail }) => {
    if (detail.kind !== 'drag') return;
    x += detail.movementX;
    y += detail.movementY;
    element.style.translate = x + 'px ' + y + 'px';
  });
</script>
`
};
