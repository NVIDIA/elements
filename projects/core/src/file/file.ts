// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { appendRootNodeStyle, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './file.css?inline';
import globalStyles from './file.global.css?inline';

/**
 * @element nve-file
 * @description A file picker is a control that enables users to choose a file value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/file
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --font-weight
 * @cssprop --font-size
 * @cssprop --text-decoration
 * @cssprop --cursor
 * @cssprop --gap
 * @cssprop --height
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 */
export class File extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-file',
    version: '0.0.0'
  };

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }
}
