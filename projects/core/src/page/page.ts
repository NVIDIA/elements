// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals, audit } from '@nvidia-elements/core/internal';
import styles from './page.css?inline';

/**
 * @element nve-page
 * @description Provide a consistent page structure across the applications, ensuring a seamless user experience.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @slot - The central content area of the page, where the primary focus of the user's attention should be.
 * @slot header - The topmost section of the page, typically containing navigation, branding, or other global elements.
 * @slot subheader - A secondary section below the header, often used for breadcrumbs, filters, or other contextual information.
 * @slot left-aside - A narrow section on the left side of the page, commonly used for navigation, filters, or other secondary content.
 * @slot left - The main content area on the left side of the page, typically containing primary navigation or features.
 * @slot bottom - A section for extra tooling outputs such as console outputs.
 * @slot right - The main content area on the right side of the page, typically containing secondary navigation or features.
 * @slot right-aside - A narrow section on the right side of the page, commonly used for navigation, filters, or other secondary content.
 * @slot subfooter - A secondary section below the main content area, often used for more information or calls to action.
 * @slot footer - The bottommost section of the page, typically containing global elements, such as copyright information.
 * @cssprop --padding
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @cssprop --min-height
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/
 * @responsive false
 *
 */
@audit({
  excessiveInstanceLimit: 0
})
export class Page extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page',
    version: '0.0.0'
  };

  static elementDefinitions = {};

  /**
   * Enables the page to use the document content scroll rather than its internal fixed scroll.
   */
  @property({ type: Boolean, reflect: true, attribute: 'document-scroll' }) documentScroll = false;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot name="header"></slot>
        <slot name="subheader"></slot>
        <slot name="left-aside"></slot>
        <slot name="left"></slot>
        <slot></slot>
        <slot name="bottom"></slot>
        <slot name="right"></slot>
        <slot name="right-aside"></slot>
        <slot name="subfooter"></slot>
        <slot name="footer"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}
