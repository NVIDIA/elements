// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import styles from './plot.css?inline';

/**
 * @element nve-plot
 * @description A visual plot component.
 * @documentation https://nvidia.github.io/elements/docs/elements/plot/
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/plot/plot
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Plot extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-plot',
    version: '0.0.0'
  };

  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}
