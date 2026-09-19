// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement } from 'lit';
import { GestureController } from '@nvidia-elements/core/internal';

export default {
  title: 'Internal/Controllers'
};

class GestureDemoElement extends LitElement {
  readonly #gestureController = new GestureController(this, {});

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
 * @summary Synchronously claimed pointer input produces drag gestures while preserving start and end input. Use this pattern when a control owns a pointer sequence.
 * @tags test-case
 */
export const Drag = {
  render: () => html`
<gesture-controller-demo-element></gesture-controller-demo-element>
<script type="module">
  const element = document.querySelector('gesture-controller-demo-element');
  let x = 0;
  let y = 0;

  element.addEventListener('nve-gesture-input', ({ detail }) => {
    if (detail.kind === 'pointerdown' && detail.claim({ kind: 'drag' })) element.dataset.active = '';
    if (detail.kind === 'pointerend') delete element.dataset.active;
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
