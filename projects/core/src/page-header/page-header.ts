// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './page-header.css?inline';

/**
 * @element nve-page-header
 * @description An element that appears across the top of all pages containing the application name and primary navigation.
 * @entrypoint \@nvidia-elements/core/page-header
 * @since 1.15.0
 * @slot - The default content slot
 * @slot prefix - Content displayed at the start of the header
 * @slot suffix - Content displayed at the end of the header
 * @cssprop --background - Background color of the header
 * @cssprop --padding - Padding inside the header
 * @cssprop --border-bottom - Border below the header
 * @cssprop --gap - Gap between the prefix, default, and suffix slots
 * @cssprop --margin-inline - left and right margin applied to the default content slot

 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
 *
 */
export class PageHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-header',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  /** @private */
  declare _internals: ElementInternals;

  connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }
}
