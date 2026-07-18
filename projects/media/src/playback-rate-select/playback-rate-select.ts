// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { I18nController, useStyles } from '@nvidia-elements/core/internal';
import { TypeCommandController } from '@nvidia-elements/forms/internal';
import { SelectFormControlMixin } from '@nvidia-elements/forms/mixins';
import { MediaStateController } from '../internal/controllers/media-state.controller.js';
import { mediaCommands } from '../internal/media-command.js';
import type { MediaState } from '../internal/media-state.js';
import styles from './playback-rate-select.css?inline';

const defaultRates = [0.5, 1.0, 1.5, 2.0];

/**
 * @element nve-media-playback-rate-select
 * @description Selects native media playback rate and submits the selected rate as a string form value.
 * @documentation https://nvidia.github.io/elements/docs/media/playback-rate-select/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/playback-rate-select
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --height
 * @cssprop --padding
 * @cssprop --picker-background
 * @cssprop --picker-border
 * @cssprop --width
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
 */
export class MediaPlaybackRateSelect extends SelectFormControlMixin(LitElement) {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-media-playback-rate-select',
    valueSchema: {
      type: 'string' as const
    },
    version: '0.0.0'
  };

  @property({ type: String, reflect: true }) command: string = mediaCommands.setPlaybackRate;

  @property({ type: String, attribute: 'commandfor', reflect: true }) commandfor: string | null = null;

  @property({ attribute: false }) commandForElement: HTMLElement | null = null;

  @property({ type: Array }) rates: Array<number | string> = [...defaultRates]; // eslint-disable-line local/primitive-property -- Playback rate lists map directly to native select options.

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  protected readonly commandController = new TypeCommandController(this, { events: ['change'] });

  #mediaStateController = new MediaStateController(this, mediaState => this.#handleMediaState(mediaState));

  override get value() {
    return this.hasAttribute('value') ? super.value : '1';
  }

  override set value(value: string) {
    super.value = value;
  }

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <select
          .value=${this.value}
          ?disabled=${this.disabled || this.readOnly}
          aria-label=${this.#label}
          aria-readonly=${ifDefined(this.readOnly ? 'true' : undefined)}
          @input=${this.#onInput}
          @change=${this.#onChange}
        >
          ${getRateOptions(this.rates).map(
            rate => html`<option value=${rate}>${formatI18n(this.i18n.playbackRateOption, 'rate', rate)}</option>`
          )}
        </select>
      </div>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.tabIndex = -1;
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.updateSelectState();
    this.checkValidity();
  }

  #onInput = (event: InputEvent) => {
    event.stopPropagation();
    if (this.disabled || this.readOnly) {
      return;
    }

    this.value = (event.currentTarget as HTMLSelectElement).value;
    this.dispatchInputEvent();
  };

  #onChange = (event: Event) => {
    event.stopPropagation();
    if (this.disabled || this.readOnly) {
      return;
    }

    this.value = (event.currentTarget as HTMLSelectElement).value;
    this.dispatchChangeEvent();
  };

  #handleMediaState = (state: MediaState | null) => {
    if (!state) {
      return;
    }

    const playbackRate = state.playbackRate;
    if (Number.isFinite(playbackRate) && playbackRate > 0) {
      this.value = `${playbackRate}`;
    }
  };

  get #label() {
    return this.ariaLabel ?? this.i18n.playbackRate;
  }
}

function formatI18n(template: string | undefined, placeholder: string, value: string) {
  return template?.replace(`{${placeholder}}`, value);
}

function getRateOptions(rates: readonly unknown[] | null | undefined) {
  const options = (Array.isArray(rates) ? rates : defaultRates)
    .map(rate => Number(rate))
    .filter(rate => Number.isFinite(rate) && rate > 0)
    .map(rate => `${rate}`);

  return Array.from(new Set(options.length ? options : ['1']));
}
