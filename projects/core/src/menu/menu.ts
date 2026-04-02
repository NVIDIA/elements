// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import { useStyles, attachInternals, keyNavigationList, appendRootNodeStyle, audit } from '@nvidia-elements/core/internal';
import type { MenuItem } from './menu-item.js';
import styles from './menu.css?inline';
import globalStyles from './menu.global.css?inline';

/**
 * @element nve-menu
 * @description A menu offers a list of choices to the user, such as a set of actions or functions. Choosing an item in a menu typically opens a sub menu, or invokes a command.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/menu
 * @slot - default slot for `nve-menu-item`
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --min-width
 * @cssprop --max-height
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
@keyNavigationList<Menu>()
export class Menu extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-menu',
    version: '0.0.0',
    children: ['nve-menu-item', 'nve-divider']
  };

  static elementDefinitions = {};

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      layout: 'vertical',
      items: this.items
    };
  }

  /** @private */
  declare _internals: ElementInternals;

  @queryAssignedElements() items!: MenuItem[];

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'menu';
    appendRootNodeStyle(this, globalStyles);
  }
}
