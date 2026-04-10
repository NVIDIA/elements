// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { hostAttr, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import { type ValidityStateError } from '../utils/types.js';
import styles from './control-message.css?inline';

const statusIcons = {
  undefined: 'information-circle-stroke',
  disabled: 'information-circle-stroke',
  warning: 'exclamation-triangle',
  success: 'checkmark-circle',
  error: 'exclamation-circle'
} as const;

/**
 * @element nve-control-message
 * @description Defining a Validity State on a control-message allows messages to show conditionally based on the current HTML5 validity state.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/forms
 * @slot - default slot for content
 * @cssprop --color
 * @cssprop --font-weight
 * @cssprop --font-size
 * @csspart icon - The icon element
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
@scopedRegistry()
export class ControlMessage extends LitElement {
  /**
   * Visual treatment for current form control validation status
   */
  @property({ type: String, reflect: true }) status?: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * Validation error code for current form control
   * https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   */
  @property({ type: String, reflect: true }) error: ValidityStateError | null = null;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-control-message',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  @hostAttr() slot = 'messages';

  render() {
    return html`
      <div internal-host>
        <slot name="icon"><nve-icon part="icon" name=${this.error ? statusIcons.error : statusIcons[this.status!]}></nve-icon></slot>
        <slot></slot>
      </div>
    `;
  }
}
