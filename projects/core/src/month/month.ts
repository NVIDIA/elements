// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './month.css?inline';

/**
 * @element nve-month
 * @description A month picker is a control that enables users to choose a month value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/month
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --cursor
 * @csspart icon-button - The calendar icon button element
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
 */
@scopedRegistry()
export class Month extends Control implements ContainerElement {
  /**
   * Reduces the visual container for a minimal borderless appearance while preserving whitespace bounds.
   * Use when embedding within another container such as a toolbar.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-month',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button part="icon-button" .ariaLabel=${this.i18n.expand} icon-name="calendar" container="inline" @click=${this.showPicker}></nve-icon-button>`;
  }
}
