// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './input.css?inline';

export const inputStyles = styles;

/**
 * @element nve-input
 * @description An input is a control that enables users to enter text.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/input
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --cursor
 * @cssprop --color
 * @cssprop --font-weight
 * @cssprop --width
 * @cssprop --min-width
 * @cssprop --max-width
 * @cssprop --border-bottom
 * @cssprop --box-shadow
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class Input extends Control implements ContainerElement {
  /**
   * Reduces the visual container for a minimal borderless appearance while preserving whitespace bounds.
   * Use when embedding within another container such as a toolbar.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  /**
   * Sets the rounded visual style of the input.
   */
  @property({ type: Boolean, reflect: true }) rounded = false;

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-input',
    version: '0.0.0'
  };
}
