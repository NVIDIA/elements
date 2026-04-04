// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  useStyles,
  keyNavigationList,
  attachInternals,
  generateId,
  isFocusable,
  typeSSR,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import styles from './breadcrumb.css?inline';
import { Icon } from '@nvidia-elements/core/icon';
import type { Button } from '@nvidia-elements/core/button';

/**
 * @element nve-breadcrumb
 * @description Breadcrumb is a component that can help users establish their location while navigating a website with complex URLs and navigation paths.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/breadcrumb
 * @cssprop --gap
 * @cssprop --height
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --width
 * @cssprop --icon-width
 * @cssprop --icon-height
 * @cssprop --text-decoration
 * @cssprop --breadcrumb-height - deprecated
 * @cssprop --item-text-size - deprecated
 * @cssprop --item-color - deprecated
 * @cssprop --item-active-color - deprecated
 * @cssprop --item-active-font-weight - deprecated
 * @slot - default slot for `nve-button` and anchor elements
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/navigation_role
 */
@typeSSR()
@scopedRegistry()
@keyNavigationList<Breadcrumb>()
export class Breadcrumb extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.shadowRoot!.querySelectorAll('slot'))
        .flatMap(slot => slot.assignedElements())
        .filter(e => isFocusable(e)) as HTMLElement[]
    };
  }

  /** @private */
  declare _internals: ElementInternals;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-breadcrumb',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  @state() private breadcrumbItems: Element[] = [];

  render() {
    /* eslint-disable @nvidia-elements/lint/no-unstyled-typography */
    return html`
    <ol internal-host>
      ${this.breadcrumbItems.map(
        (el, idx) => html`
        <li>
          <slot name=${el.slot} @slotchange=${this.#removeItem}></slot>
          ${idx < this.breadcrumbItems.length - 1 ? html`<nve-icon part="icon" separator aria-hidden="true" name="chevron" direction="right" size="sm"></nve-icon>` : nothing}
        </li>
      `
      )}
    </ol>
    <slot ?hidden-slot=${!this.breadcrumbItems.length} @slotchange=${this.#createItems}></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }

  #removeItem(e: Event) {
    if (!(e.target as HTMLSlotElement).assignedElements().length) {
      this.#resetItems();
    }
  }

  #createItems(e: Event) {
    if (e.target && (e.target as HTMLSlotElement).assignedElements().length) {
      this.#resetItems();
      const items = this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements();
      items
        .filter(i => i.matches('nve-button, nve-icon-button, nve-button, nve-icon-button, span, a'))
        .forEach(i => (i.slot = generateId()));
      items
        .filter(i => i.matches('nve-button, nve-icon-button, nve-button, nve-icon-button'))
        .forEach((i: Element) => ((i as Button).container = 'inline'));
      this.breadcrumbItems = items.length ? items : this.breadcrumbItems;
    }
  }

  #resetItems() {
    Array.from(this.shadowRoot!.querySelectorAll('slot'))
      .flatMap(i => i.assignedElements())
      .forEach(i => (i.slot = ''));
  }
}
