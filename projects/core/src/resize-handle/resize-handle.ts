// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property } from 'lit/decorators/property.js';
import { FormControlMixin } from '@nvidia-elements/forms/mixins';
import {
  GestureController,
  I18nController,
  useStyles,
  type Gesture,
  type UnhandledPointerInput
} from '@nvidia-elements/core/internal';
import styles from './resize-handle.css?inline';

/**
 * @element nve-resize-handle
 * @description A resize-handle slider is a control that enables users to resize views or panels vertically or horizontally.
 * @documentation https://nvidia.github.io/elements/docs/elements/resize-handle/
 * @since 1.27.0
 * @entrypoint \@nvidia-elements/core/resize-handle
 * @event toggle - Dispatched when the resize handle is double clicked.
 * @cssprop --background
 * @cssprop --line-width
 * @cssprop --target-size
 * @cssprop --cursor

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 *
 */
export class ResizeHandle extends FormControlMixin<typeof LitElement, number>(LitElement) {
  /**
   * Determines the orientation direction of the resize handle.
   */
  @property({ type: String, reflect: true }) orientation?: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Determines the min resize value.
   */
  @property({ type: Number, reflect: true }) min = 0;

  /**
   * Determines the max resize value.
   */
  @property({ type: Number, reflect: true }) max = 100;

  /**
   * Determines the value step change.
   */
  @property({ type: Number, reflect: true }) step = 10;

  static styles = useStyles([styles]);

  get #range() {
    return this.shadowRoot!.querySelector('input')!;
  }

  static readonly metadata = {
    tag: 'nve-resize-handle',
    version: '0.0.0',
    valueSchema: {
      type: 'number' as const
    }
  };

  readonly #i18nController: I18nController<this> = new I18nController<this>(this);

  readonly #gestureController: GestureController;

  #dragPointerId?: number;

  /**
   * Updates internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #offset = 0;

  render() {
    return html`
      <div internal-host>
        <div class="line" part="_line"></div>
        <input aria-label=${ifDefined(this.ariaLabel ?? this.i18n.resize)} type="range" min=${this.min} max=${this.max} .valueAsNumber=${this.valueAsNumber} @input=${(e: Event) => this.#setInput((e.target as HTMLInputElement).valueAsNumber)} @change=${(e: Event) => this.#setChange((e.target as HTMLInputElement).valueAsNumber)} step=${this.step} />
      </div>
    `;
  }

  constructor() {
    super();
    this.value = this.value ?? 50;
    this.#offset = this.valueAsNumber;
    this.#gestureController = new GestureController(this, {
      getCapabilities: () => ({ drag: true, pan: false, pinch: false, wheel: false })
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'none';
    this.addEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.addEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.removeEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
    this.#cancelDrag();
    super.disconnectedCallback();
  }

  firstUpdated(props: PropertyValues) {
    super.firstUpdated(props);
    this.#gestureController.target = this;
    this.addEventListener('dblclick', () => {
      if (!this.dispatchEvent(new CustomEvent('toggle', { cancelable: true, bubbles: true, composed: true }))) {
        return;
      }
      this.#toggle();
    });
  }

  #toggle() {
    const value = this.valueAsNumber <= this.max && this.valueAsNumber !== this.min ? this.min : this.max;
    this.#setInput(value);
    this.#setChange(value);
  }

  #handlePointerInput = (event: CustomEvent<UnhandledPointerInput>): void => {
    if (
      event.detail.kind === 'pointerdown' &&
      event.detail.event.button === 0 &&
      event.detail.event.isPrimary &&
      this.#dragPointerId === undefined
    ) {
      this.#dragStart(event.detail.event.pointerId);
    }
    if (event.detail.event.pointerId !== this.#dragPointerId) return;
    if (event.detail.kind === 'pointerup') this.#dragEnd();
    if (event.detail.kind === 'pointercancel') this.#cancelDrag();
  };

  #handleGesture = (event: CustomEvent<Gesture<undefined>>): void => {
    if (event.detail.kind === 'drag' && event.detail.event.pointerId === this.#dragPointerId) {
      this.#dragMove(event.detail);
    }
  };

  #dragStart(pointerId: number) {
    this.#dragPointerId = pointerId;
    this.#range.step = '1';
    this._internals.states.add('active');
    this.#offset = this.valueAsNumber;
  }

  #dragMove(gesture: Extract<Gesture<undefined>, { kind: 'drag' }>) {
    const offset =
      (this.orientation === 'vertical' ? gesture.movementX : -gesture.movementY) * (this.dir === 'rtl' ? -1 : 1);
    this.#offset = Math.max(this.min, Math.min(this.max, this.#offset + offset));
    this.#setInput(this.#offset);
  }

  #dragEnd() {
    this.#offset = this.valueAsNumber;
    this.#range.step = `${this.step}`;
    this.#dragPointerId = undefined;
    this._internals.states.delete('active');
    this.#setChange(this.#offset);
  }

  #cancelDrag() {
    if (this.#dragPointerId === undefined) return;
    this.#dragPointerId = undefined;
    this.#range.step = `${this.step}`;
    this._internals.states.delete('active');
  }

  #setInput(value: number) {
    this.#updateValue(value);
    this.dispatchInputEvent();
  }

  #setChange(value: number) {
    this.#updateValue(value);
    this.dispatchChangeEvent();
  }

  #updateValue(value: number) {
    if (value <= this.max && value >= this.min) {
      this.valueAsNumber = value;
    }
  }
}
