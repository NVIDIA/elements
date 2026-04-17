// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { property } from 'lit/decorators/property.js';
import type { Color, Container, Prominence, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, useStyles, supportStateStyles, audit, colorStateStyles } from '@nvidia-elements/core/internal';
import { Alert } from './alert.js';
import styles from './alert-group.css?inline';

/**
 * @element nve-alert-group
 * @description An alert group is an element that displays a group of related and important messages in a way that attracts the user's attention without interrupting the user's task.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/alert
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --padding
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --background
 * @slot - default slot for nve-alert
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 */
@audit()
export class AlertGroup extends LitElement {
  static styles = useStyles([styles, supportStateStyles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-alert-group',
    version: '0.0.0',
    children: [Alert.metadata.tag]
  };

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status?: SupportStatus;

  /** Determines the visual prominence or weight, emphasis applies banner style alerts */
  @property({ type: String, reflect: true }) prominence?: Extract<Prominence, 'emphasis'>;

  /** Allows colors not defined by semantic status definitions for non-status instances, such as callouts for tutorials or tips on a documentation site. */
  @property({ type: String, reflect: true }) color: Color;

  /** Determines the container bounds of the element */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'full'>;

  /** @private */
  declare _internals: ElementInternals;

  @queryAssignedElements() private alerts!: Alert[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateStatus()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateStatus();
  }

  #updateStatus() {
    this.alerts.forEach(alert => (alert.status = this.status));
  }
}
