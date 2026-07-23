// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ButtonFormControlMixin } from '@nvidia-elements/forms/mixins';
import { useStyles, audit } from '@nvidia-elements/core/internal';
import styles from './menu-item.css?inline';

/**
 * @element nve-menu-item
 * @description Represents a selectable option within a menu, providing an interactive button for navigation or actions.
 * @documentation https://nvidia.github.io/elements/docs/elements/menu/
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/menu
 * @slot - Label and supporting content for the menu option.
 * @slot suffix - slot for suffix icon
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border-background
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --line-height
 * @cssprop --cursor
 * @cssprop --opacity
 * @cssprop --text-transform

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
export class MenuItem extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([styles]);

  /** Applies danger styling to destructive or high-risk menu actions. */
  @property({ type: String, reflect: true }) status: 'danger';

  static readonly metadata = {
    tag: 'nve-menu-item',
    version: '0.0.0',
    parents: ['nve-menu']
  };

  static elementDefinitions = {};

  render() {
    return html`
      <div internal-host interaction-state focus-within part="_internal">
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'menuitem';
  }
}
