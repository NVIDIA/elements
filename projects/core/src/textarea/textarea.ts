// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type CSSResult } from 'lit';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { Control } from '@nvidia-elements/core/forms';
import styles from './textarea.css?inline';

/**
 * @element nve-textarea
 * @description Wraps a native textarea for editing multiline text. Use it for messages, comments, or other input that needs more space than a single line.
 * @documentation https://nvidia.github.io/elements/docs/elements/textarea/
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/textarea
 * @slot prefix - Content to display before the textarea.
 * @slot suffix - Content to display after the textarea.
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --cursor
 * @cssprop --border
 * @cssprop --color
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 */
export class Textarea extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  /** @private */
  protected get prefixContent() {
    return html`<slot name="prefix"></slot>`;
  }

  /** @private */
  protected get suffixContent() {
    return html`<slot name="suffix"></slot>`;
  }

  static readonly metadata = {
    tag: 'nve-textarea',
    version: '0.0.0'
  };
}
