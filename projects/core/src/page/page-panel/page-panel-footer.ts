// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './page-panel-footer.css?inline';

/**
 * @element nve-page-panel-footer
 * @description Provides a fixed action area at the bottom of a page panel for persistent controls or status information.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @slot - default slot for the page-panel footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --min-height
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 *
 */
export class PagePanelFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel-footer',
    version: '0.0.0'
  };

  @hostAttr() slot = 'footer';

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
