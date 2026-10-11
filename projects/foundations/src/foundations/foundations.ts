// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './foundations.css?inline';

/**
 * @element nve-foundations
 * @description A slotted container component for NVIDIA Elements.
 * @documentation https://nvidia.github.io/elements/docs/foundations/component/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/foundations/foundations
 * @slot - Content to display inside the container.
 */
export class Foundations extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-foundations',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
