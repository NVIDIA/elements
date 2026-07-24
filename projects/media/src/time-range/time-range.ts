// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { I18nController, useStyles } from '@nvidia-elements/core/internal';
import { TypeCommandController } from '@nvidia-elements/forms/internal';
import { SliderFormControlMixin } from '@nvidia-elements/forms/mixins';
import { MediaStateController } from '../internal/controllers/media-state.controller.js';
import { mediaCommands } from '../internal/media-command.js';
import type { MediaState } from '../internal/media-state.js';
import mediaRangeStyles from '../internal/media-range.css?inline';
import styles from './time-range.css?inline';

/**
 * @element nve-media-time-range
 * @description Scrubs finite media time and submits the current time as a numeric form value.
 * @documentation https://nvidia.github.io/elements/docs/media/time-range/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/time-range
 * @cssprop --background
 * @cssprop --track-background
 * @cssprop --track-height
 * @cssprop --track-border-radius
 * @cssprop --thumb-background
 * @cssprop --thumb-border
 * @cssprop --thumb-height
 * @cssprop --thumb-width
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 */
export class MediaTimeRange extends SliderFormControlMixin(LitElement) {
  static styles = useStyles([mediaRangeStyles, styles]);

  static override readonly sliderDefaults = {
    max: 1,
    step: 0.1
  };

  static readonly metadata = {
    tag: 'nve-media-time-range',
    valueSchema: {
      type: 'number' as const
    },
    version: '0.0.0'
  };

  @property({ type: String, reflect: true }) command: string = mediaCommands.seek;

  @property({ type: String, attribute: 'commandfor', reflect: true }) commandfor: string | null = null;

  @property({ attribute: false }) commandForElement: HTMLElement | null = null;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  protected readonly commandController = new TypeCommandController(this, { events: ['input'] });

  @state() protected mediaDisabled = false;

  #mediaStateController = new MediaStateController(this, mediaState => this.#handleMediaState(mediaState));

  override connectedCallback() {
    super.connectedCallback();
    this.tabIndex = -1;
  }

  render() {
    return html`
      <div internal-host>
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${getInputStep(this.min, this.max, this.step)}
          .value=${`${this.value}`}
          ?disabled=${this.disabled || this.readOnly || this.mediaDisabled}
          aria-label=${this.ariaLabel ?? this.i18n.currentTime}
          aria-readonly=${this.readOnly ? 'true' : nothing}
          @input=${this.#onInput}
          @change=${this.#onChange}
        />
      </div>
    `;
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.#syncTrackProgress();
  }

  override updateSliderState() {
    super.updateSliderState();
    if (this.mediaDisabled) {
      this._internals.setFormValue(null);
    }
  }

  #onInput = (event: InputEvent) => {
    event.stopPropagation();
    if (this.mediaDisabled) {
      return;
    }

    this.valueAsNumber = (event.currentTarget as HTMLInputElement).valueAsNumber;
    this.dispatchInputEvent();
  };

  #onChange = (event: Event) => {
    event.stopPropagation();
    this.dispatchChangeEvent();
  };

  #syncTrackProgress() {
    const range = this.max - this.min;
    const progress = range > 0 ? (this.value - this.min) / range : 0;
    this.style.setProperty('--track-progress', `${Math.min(1, Math.max(0, progress))}`);
  }

  #handleMediaState = (mediaState: MediaState | null) => {
    if (!mediaState) {
      return;
    }

    const duration = mediaState.duration;
    this.mediaDisabled = !Number.isFinite(duration) || duration <= 0;
    this.min = 0;
    this.max = this.mediaDisabled ? 0 : duration;
    this.valueAsNumber = mediaState.ended ? this.max : clamp(mediaState.currentTime, this.min, this.max);
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getInputStep(min: number, max: number, step: number) {
  const range = max - min;
  const intervals = Math.ceil(range / step);
  return range > 0 && Number.isFinite(intervals) && intervals > 0 ? (range / intervals) * (1 - Number.EPSILON) : step;
}
