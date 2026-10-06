// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { ButtonFormControlMixin } from '@nvidia-elements/forms/mixins';
import { Icon } from '@nvidia-elements/core/icon';
import { scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import styles from './drag-handle.css?inline';

/**
 * @element nve-drag-handle
 * @description A draggable grip button with a native drag preview. Activation toggles the pressed state; the application controls movement.
 * @documentation https://nvidia.github.io/elements/docs/elements/drag-handle/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/drag-handle
 * @cssprop --cursor - The cursor over the handle.
 * @cssprop --color - The grip color.
 * @cssprop --width - The horizontal size of the pointer target.
 * @cssprop --height - The vertical size of the pointer target.
 * @cssprop --border-radius - The handle corner radius.
 * @csspart icon - The fixed grip icon.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
@scopedRegistry()
export class DragHandle extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-drag-handle',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  constructor() {
    super();
    this.type = 'button';
    this.pressed = false;
  }

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <nve-icon name="drag" .appearance=${this.pressed || this.expanded ? 'solid' : 'outline'} aria-hidden="true" part="icon"></nve-icon>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('nve-draggable', 'handle');
    if (!this.hasAttribute('draggable')) this.draggable = true;
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('dragstart', this.#onDragStart);
    this.addEventListener('dragend', this.#onDragEnd);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('dragstart', this.#onDragStart);
    this.removeEventListener('dragend', this.#onDragEnd);
    super.disconnectedCallback();
  }

  #onClick = (event: MouseEvent): void => {
    if (event.target !== this || event.defaultPrevented || this.disabled || this.readOnly) return;

    this.pressed = !this.pressed;
  };

  #onDragStart = (event: DragEvent): void => {
    if (this.disabled || this.readOnly) event.preventDefault();
  };

  #onDragEnd = (): void => {
    this._internals.states.delete('active');
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' || event.target !== this || event.defaultPrevented || this.disabled || this.readOnly) {
      return;
    }

    event.preventDefault();
  };
}
