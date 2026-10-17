// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './ghost.css?inline';

/**
 * @element nve-ghost
 * @description An inert visual preview of content or its prospective placement.
 * @documentation https://nvidia.github.io/elements/docs/elements/ghost/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/ghost
 * @slot - Presentation content for the preview.
 * @slot label - Optional preview title.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --padding
 */
export class Ghost extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-ghost', version: '0.0.0' };

  render() {
    return html`
      <div internal-host inert aria-hidden="true">
        <slot name="label"></slot>
        <div class="content"><slot></slot></div>
      </div>
    `;
  }
}
