// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { classMap } from 'lit/directives/class-map.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './json-viewer.css?inline';

/* eslint-disable @nvidia-elements/lint/no-unknown-tags */
/* eslint-disable local/require-element-definitions */

/**
 * @deprecated use `nve-monaco-input` instead
 * @element nve-json-viewer
 * @description The JSON Viewer is a custom element that renders JSON data in a easy to read format. Use it for prototyping and quickly displaying and debugging data. The JSON View is not a substitute for treeview patterns.
 * @since 0.16.0
 * @slot - default slot for json
 * @csspart json-node - The json node elements
 * @stable false
 * @package false
 */
export class JSONViewer extends LitElement {
  /** JSON value to display */
  @property({ type: Object }) value = {}; // eslint-disable-line

  /** expand all nodes */
  @property({ type: Boolean }) expanded: boolean;

  @property({ type: Boolean }) expandedAll: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-json-viewer',
    version: '0.0.0'
  };

  get #classMap() {
    return {
      array: Array.isArray(this.value),
      object: typeof this.value === 'object' && this.value !== null,
      expanded: this.expanded
    };
  }

  render() {
    return html`
    <div internal-host class=${classMap(this.#classMap)}>
      <slot @slotchange=${this.#slotchange} hidden></slot>
      ${Object.entries(this.value)
        .filter(v => v[1] !== null)
        .map(
          ([prop, value]) =>
            html`<nve-json-node part="json-node" .expanded=${this.expanded} .expandedAll=${this.expanded} .prop=${prop} .value=${value}></nve-json-node>`
        )}
    </div>
    `;
  }

  #slotchange() {
    this.value = JSON.parse(this.textContent);
  }
}
