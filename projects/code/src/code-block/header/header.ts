// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './header.css?inline';

/**
 * @element nve-code-block-header
 * @description Content and controls above the source code. Assigns its own slot and remains visible while code scrolls. Provide headings and accessible labels in the content as needed.
 * @documentation https://nvidia.github.io/elements/docs/code/codeblock/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/code/code-block
 * @slot - Labels, supporting text, and action controls. Fills the space between the prefix and suffix.
 * @slot prefix - Content displayed at the start of the row.
 * @slot suffix - Content displayed at the end of the row.
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --border-bottom
 */
export class CodeBlockHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-code-block-header',
    version: '0.0.0',
    parents: ['nve-code-block', 'nve-codeblock']
  };

  /** @private */
  @hostAttr() slot = 'header';

  render() {
    return html`
      <div internal-host>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}
