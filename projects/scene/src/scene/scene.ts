// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import styles from './scene.css?inline';

/**
 * @element nve-scene
 * @description A visual scene component.
 * @documentation https://nvidia.github.io/elements/docs/elements/scene/
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/scene/scene
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Scene extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene',
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
