// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Color, Size } from '@nvidia-elements/core/internal';
import { useStyles, colorStateStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './logo.css?inline';

/**
 * @element nve-logo
 * @description A visual indicator for a brand or application.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/logo
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --height
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Logo extends LitElement {
  /**
   * Visual treatment to represent unique color of an application
   */
  @property({ type: String, reflect: true }) color: Color;

  /**
   * Determines size of logo
   */
  @property({ type: String, reflect: true }) size?: Size;

  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-logo',
    version: '0.0.0'
  };

  _internals: ElementInternals;

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
    this._internals.role = 'img';
  }
}
