// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  attachInternals,
  useStyles,
  associateAriaLabel,
  associateAriaDescribedBy,
  associateControlGroup,
  tagSelector
} from '@nvidia-elements/core/internal';
import type { ControlMessage } from '../control-message/control-message.js';
import { setupControlStatusStates, setupControlGroupStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates } from '../utils/layout.js';
import styles from './control-group.css?inline';

/**
 * @element nve-control-group
 * @description Groups many related form controls under a shared label and validation context for semantically linked inputs.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/forms
 * @slot - Control input elements
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-text-transform
 * @cssprop --label-font-weight
 * @cssprop --label-font-size
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
export class ControlGroup extends LitElement {
  /** Set each slotted control + label + control message layout */
  @property({ type: String, reflect: true }) layout:
    | 'vertical'
    | 'vertical-inline'
    | 'horizontal'
    | 'horizontal-inline';

  /** Set the visual prominence of the control group */
  @property({ type: String, reflect: true }) prominence: 'muted';

  get label() {
    return this.querySelector?.<HTMLLabelElement>('label');
  }

  get inputs() {
    return this.querySelectorAll ? Array.from(this.querySelectorAll<HTMLInputElement>(inputQuery)) : [];
  }

  get #messages() {
    return this.querySelectorAll
      ? Array.from(this.querySelectorAll<ControlMessage>(tagSelector('nve-control-message')))
      : [];
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-control-group',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host class="${this.#messages.length ? '' : 'no-messages'} ${this.label ? '' : 'no-label'}">
        <slot name="label"></slot>
        <slot class="input-slot"></slot>
        <slot name="messages"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.#observers = [
      setupControlGroupStates(this),
      setupControlLayoutStates(this),
      ...setupControlStatusStates(this, this.#messages)
    ];
    this.#updateAssociations();
    this.shadowRoot!.addEventListener('slotchange', () => this.#updateAssociations());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  #updateAssociations() {
    this.#assignLabel();
    associateAriaLabel(this.label as HTMLElement, this);
    associateAriaDescribedBy(
      Array.from(this.querySelectorAll<ControlMessage>(tagSelector('nve-control-message'))),
      this
    );
    associateControlGroup(Array.from(this.inputs));
  }

  #assignLabel() {
    if (this.label) {
      this.label.slot = 'label';
    }
  }
}
