// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './ghost.css?inline';

/**
 * @element nve-ghost
 * @description An inert visual preview of content or its prospective placement. Applications control its geometry, movement, and accessible feedback.
 * @documentation https://nvidia.github.io/elements/docs/elements/ghost/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/ghost
 * @slot - Presentation content for the preview.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --stack-offset-x - Nonnegative horizontal distance between layers. Defaults to 4px.
 * @cssprop --stack-offset-y - Nonnegative vertical distance between layers. Defaults to 4px.
 * @cssprop --padding
 */
export class Ghost extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-ghost', version: '0.0.0' };

  /** Number of visual surfaces. Rendering truncates fractions and clamps to one through three; nonfinite values use one. */
  @property({ type: Number }) layers = 1;

  render() {
    const layers = Number.isFinite(this.layers) ? Math.min(3, Math.max(1, Math.trunc(this.layers))) : 1;
    return html`
      <div internal-host inert aria-hidden="true" style=${`--_back-layers:${layers - 1}`}>
        ${Array.from(
          { length: layers - 1 },
          (_, index) => html`<div class="surface rear" style=${`--_layer:${layers - index - 1}`}></div>`
        )}
        <div class="surface front"><slot></slot></div>
      </div>
    `;
  }
}
