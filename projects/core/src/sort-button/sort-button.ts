// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@nvidia-elements/core/icon';
import { useStyles, BaseButton, I18nController, scopedRegistry } from '@nvidia-elements/core/internal';
import styles from './sort-button.css?inline';

const nextSort = {
  none: 'ascending',
  ascending: 'descending',
  descending: 'none'
};

/**
 * @element nve-sort-button
 * @description A sort button is a control that enables users to sort a list of items in ascending or descending order.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/sort-button
 * @event sort - Dispatched on sort button click, returns the current sort value and the next sort value.
 * @cssprop --width
 * @cssprop --height
 * @cssprop --border-radius
 * @cssprop --color
 * @csspart icon - The icon element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 */
@scopedRegistry()
export class SortButton extends BaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-sort-button',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /**
   * The current sort value, can be ascending, descending, or none.
   */
  @property({ type: String, reflect: true }) sort: 'ascending' | 'descending' | 'none' = 'none';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Updates internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host focus-within>
        <nve-icon part="icon" .name=${this.sort === 'descending' ? 'sort-descending' : 'sort-ascending'} aria-hidden="true"></nve-icon>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'spinbutton';

    this.addEventListener('click', () => {
      this._internals.ariaLabel = `${this.#i18nController.i18n.sort} ${nextSort[this.sort]}`;
      this.dispatchEvent(
        new CustomEvent('sort', {
          detail: { value: this.sort, next: nextSort[this.sort] },
          bubbles: true,
          composed: true
        })
      );
    });
  }
}
