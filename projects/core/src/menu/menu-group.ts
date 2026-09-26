// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  attachInternals,
  audit,
  scopedRegistry,
  TypeExpandableController,
  useStyles
} from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './menu-group.css?inline';

/**
 * @element nve-menu-group
 * @description Organizes related menu items under a disclosure header that can show or hide one child menu.
 * @documentation https://nvidia.github.io/elements/docs/elements/menu/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/menu
 * @command --open - Opens the menu group.
 * @command --close - Closes the menu group.
 * @command --toggle - Toggles the menu group.
 * @event open - Dispatched when the user requests that the menu group open.
 * @event close - Dispatched when the user requests that the menu group close.
 * @slot - Label content for the disclosure header.
 * @slot prefix - Non-interactive content before the header label, such as an icon or avatar.
 * @slot suffix - Non-interactive content after the header label, such as a badge or count.
 * @slot menu - One `nve-menu` containing the grouped menu items. Direct menus use this slot automatically in browsers; server-rendered menus must set `slot="menu"` explicitly.
 * @cssprop --background
 * @cssprop --font-size
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --width
 * @cssprop --min-height
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
 */
@audit()
@scopedRegistry()
export class MenuGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-menu-group',
    version: '0.0.0',
    children: ['nve-menu']
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** Determines whether the child menu is visible. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /** Prevents user activation of the disclosure header. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Determines whether user activation automatically updates the expanded state. */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /** @private */
  declare _internals: ElementInternals;

  #typeExpandableController = new TypeExpandableController(this);

  render() {
    return html`
      <div internal-host>
        <button
          id="trigger"
          type="button"
          aria-expanded=${this.expanded}
          ?disabled=${this.disabled}
          aria-controls="content"
          @click=${this.#toggle}
        >
          <slot name="prefix"></slot>
          <slot></slot>
          <slot name="suffix"></slot>
          <nve-icon
            part="caret"
            name="caret"
            direction=${this.expanded ? 'down' : 'right'}
            size="sm"
            aria-hidden="true"
          ></nve-icon>
        </button>
        <slot id="content" name="menu" ?hidden=${!this.expanded}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  #toggle = () => {
    if (!this.disabled) {
      this.#typeExpandableController.toggle();
    }
  };
}
