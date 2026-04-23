// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './pulse.css?inline';

/**
 * @element nve-pulse
 * @description Pulse component signals attention for a particular area of a UI. This helps with tutorial/getting started guides for new users.
 * @since 1.16.3
 * @entrypoint \@nvidia-elements/core/pulse
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @cssprop --animation-duration
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 *
 */
export class Pulse extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-pulse',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }

  /** Sets size of the pulse component. You can also update size using the `width + height` css props. */
  @property({ type: String, reflect: true }) size?: Size | 'xs';

  /** These visual treatments represent the `status` of different tasks. When `status` changes to `accent`, `warning` or `danger`, the component embeds appropriate colors. */
  @property({ type: String, reflect: true }) status?: 'accent' | 'warning' | 'danger';

  render() {
    return html`
    <svg internal-host width="100%" height="100%" viewBox="0 0 200 200">
      <circle class="circle" cx="100" cy="100" r="25"></circle>
      <circle class="circle c1" cx="100" cy="100" r="25"></circle>
      <circle class="circle c2" cx="100" cy="100" r="25"></circle> 
      <circle class="circle c3" cx="100" cy="100" r="25"></circle>
    </svg>
  `;
  }
}
