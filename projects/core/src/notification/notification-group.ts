// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { PopoverAlign, PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import { audit, popoverStyles, TypeNativePopoverController, useStyles } from '@nvidia-elements/core/internal';
import styles from './notification-group.css?inline';

/**
 * @element nve-notification-group
 * @description Displays real time updates without interrupting the user's workflow to communicate an important message or status.
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/notification
 * @slot - default slot for `nve-notification`
 * @cssprop --box-shadow
 * @cssprop --animation-duration - Duration of notification group open/close animations
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
@audit()
export class NotificationGroup extends LitElement {
  /**
   * (optional) By default the popover will automatically anchor itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document?.body;

  /**
   * Sets the position of the popover relative to the anchor element.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition;

  /**
   * Sets the alignment of the popover relative to the anchor element.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  protected typeNativePopoverController = new TypeNativePopoverController<NotificationGroup>(this);

  static styles = useStyles([popoverStyles, styles]);

  /** @private */
  get popoverType(): PopoverType {
    return 'manual';
  }

  static readonly metadata = {
    tag: 'nve-notification-group',
    version: '0.0.0',
    children: ['nve-notification']
  };

  render() {
    return html`
    <div internal-host>
      <slot @slotchange=${() => this.showPopover()}></slot>
    </div>
    `;
  }
}
