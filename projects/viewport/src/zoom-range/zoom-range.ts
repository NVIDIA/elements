// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { I18nController, useStyles } from '@nvidia-elements/core/internal';
import { SliderFormControlMixin } from '@nvidia-elements/forms/mixins';
import { ViewportControlController, ViewportCommandController } from '../viewport/viewport-control.controller.js';
import type { Viewport } from '@nvidia-elements/viewport/viewport';
import styles from './zoom-range.css?inline';

/**
 * @element nve-viewport-zoom-range
 * @description Controls viewport zoom with a range slider.
 * @documentation https://nvidia.github.io/elements/docs/viewport/zoom-range/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/viewport/zoom-range
 * @cssprop --background - Active track fill. Defaults to transparent.
 * @cssprop --track-background
 * @cssprop --track-height
 * @cssprop --track-border-radius
 * @cssprop --thumb-background
 * @cssprop --thumb-border
 * @cssprop --thumb-height
 * @cssprop --thumb-width
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 * @stable false
 */
export class ViewportZoomRange extends SliderFormControlMixin(LitElement) {
  static styles = useStyles([styles]);
  static override readonly sliderDefaults = { min: 0.05, max: 20, step: 0, value: 1 };
  static readonly metadata = {
    tag: 'nve-viewport-zoom-range',
    valueSchema: { type: 'number' as const },
    version: '0.0.0'
  };

  /** Determines the orientation of the range slider. */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Command issued for each user input. */
  @property({ type: String, reflect: true }) command = '--zoom-to';
  /** ID of the viewport command target. Defaults to a direct parent viewport. */
  @property({ type: String, attribute: 'commandfor', reflect: true }) commandfor: string | null = null;
  /** Viewport command target, taking precedence over commandfor. */
  @property({ attribute: false }) commandForElement: HTMLElement | null = null;

  /** Scale submitted by a zoom command. */
  get scale(): number {
    return this.valueAsNumber;
  }

  readonly #i18nController: I18nController<this> = new I18nController<this>(this);
  /** Enables updating internal strings for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  @state() protected viewportDisabled = false;
  readonly #viewportControl = new ViewportControlController(this, target => this.#syncViewport(target), {
    parentFallback: true
  });
  protected readonly commandController = new ViewportCommandController(this, this.#viewportControl);

  render() {
    return html`<div internal-host>
      <input type="range" min="0" max="1" step="any"
        .value=${String(this.#progress)}
        ?disabled=${this.disabled || this.readOnly || this.viewportDisabled || this.min === this.max}
        aria-label=${this.ariaLabel ?? this.i18n.scale ?? nothing}
        aria-valuemin=${this.min} aria-valuemax=${this.max} aria-valuenow=${this.scale}
        aria-valuetext=${`${Number((this.scale * 100).toPrecision(4)).toLocaleString()}%`}
        aria-orientation=${this.orientation}
        aria-readonly=${this.readOnly ? 'true' : nothing}
        @input=${this.#onInput} @change=${this.#onChange} @keydown=${this.#onKeyDown} />
    </div>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.tabIndex = -1;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.style.setProperty('--track-progress', String(this.#progress));
  }

  get #progress(): number {
    if (this.min <= 0 || this.max <= this.min || this.scale <= 0) return 0;
    return Math.min(1, Math.max(0, Math.log(this.scale / this.min) / Math.log(this.max / this.min)));
  }

  override updateSliderState(): void {
    super.updateSliderState();
    if (this.viewportDisabled) this._internals.setFormValue(null);
  }

  #syncViewport(target: Viewport | null): void {
    this.viewportDisabled = target ? !target.zoomable : false;
    if (target) {
      this.min = target.minScale;
      this.max = target.maxScale;
      this.valueAsNumber = target.scale;
    }
    this.updateSliderState();
  }

  #onInput = (event: InputEvent): void => {
    event.stopPropagation();
    const target = this.#viewportControl.resolveTarget();
    if (this.disabled || this.readOnly || (target && !target.zoomable)) return;
    const position = (event.currentTarget as HTMLInputElement).valueAsNumber;
    let scale = this.min * (this.max / this.min) ** position;
    if (this.step > 0) scale = this.min + Math.round((scale - this.min) / this.step) * this.step;
    this.valueAsNumber = Math.min(this.max, Math.max(this.min, scale));
    this.dispatchInputEvent();
    this.#syncViewport(this.#viewportControl.resolveTarget());
  };

  #onChange = (event: Event): void => {
    event.stopPropagation();
    if (!this.disabled && !this.readOnly && !this.viewportDisabled) this.dispatchChangeEvent();
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.step <= 0 || this.disabled || this.readOnly) return;
    const target = this.#viewportControl.resolveTarget();
    if (target && !target.zoomable) return;
    const direction = scaleStepDirection(event.key);
    if (!direction) return;
    event.preventDefault();
    const scale = Math.min(this.max, Math.max(this.min, this.scale + direction * this.step));
    const input = event.currentTarget as HTMLInputElement;
    input.valueAsNumber = this.max > this.min ? Math.log(scale / this.min) / Math.log(this.max / this.min) : 0;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
}

function scaleStepDirection(key: string): -1 | 0 | 1 {
  if (key === 'ArrowRight' || key === 'ArrowUp') return 1;
  if (key === 'ArrowLeft' || key === 'ArrowDown') return -1;
  return 0;
}
