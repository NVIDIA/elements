// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import styles from './skeleton.css?inline';

/**
 * @element nve-skeleton
 * @description A loading placeholder component that displays animated placeholder shapes while content loads.
 * @since 1.44.0
 * @entrypoint \@nvidia-elements/core/skeleton
 * @slot - default content slot
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --min-height
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live
 */
export class Skeleton extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-skeleton',
    version: '0.0.0'
  };

  /** The effect of the skeleton */
  @property({ type: String, reflect: true }) effect: 'shimmer' | 'pulse';

  /** The shape of the skeleton */
  @property({ type: String, reflect: true }) shape: 'round' | 'pill';

  /** Whether the skeleton hides its content */
  @property({ type: Boolean, reflect: true }) hidden = false;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <div class="animate"></div>
        <slot @slotchange=${this.#slotchange}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.ariaBusy = 'true';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaBusy = `${!this.hidden}`;
  }

  #slotchange(event: Event) {
    const target = event.target as HTMLSlotElement;
    const hasContent = target
      .assignedNodes()
      .some(
        node =>
          node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
      );

    if (hasContent) {
      this._internals.states.add('slotted');
    } else {
      this._internals.states.delete('slotted');
    }
  }
}
