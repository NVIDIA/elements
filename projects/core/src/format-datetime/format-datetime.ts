// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, typeSSR, LogService } from '@nvidia-elements/core/internal';
import styles from './format-datetime.css?inline';

/**
 * @element nve-format-datetime
 * @description Formats a date/time value as localized text using the Intl.DateTimeFormat API. Renders inside a semantic time element.
 * Granular options (weekday, year, month, day, hour, minute, second) mirror the Intl.DateTimeFormat API. 'numeric' omits zero-padding, '2-digit' zero-pads.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/format-datetime
 * @slot - Date string to format (such as 2023-07-28T04:20:17.434Z). Serves as fallback before hydration.
 */
@typeSSR()
export class FormatDatetime extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-format-datetime',
    version: '0.0.0'
  };

  /**
   * Optional date string for values supplied by JavaScript or bound data.
   * By default, the component formats the element's text content, which also serves as the SSR fallback.
   * When both are present, this property takes precedence.
   */
  @property({ type: String }) date?: string;

  /**
   * Language tag (such as en-US, de-DE). Defaults to document.documentElement.lang or browser default.
   */
  @property({ type: String }) locale?: string;

  /**
   * Weekday representation: 'long' | 'short' | 'narrow'.
   */
  @property({ type: String }) weekday?: 'long' | 'short' | 'narrow';

  /**
   * Year representation: 'numeric' | '2-digit'.
   */
  @property({ type: String }) year?: 'numeric' | '2-digit';

  /**
   * Month representation: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'.
   */
  @property({ type: String }) month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';

  /**
   * Day representation: 'numeric' | '2-digit'.
   */
  @property({ type: String }) day?: 'numeric' | '2-digit';

  /**
   * Hour representation: 'numeric' | '2-digit'.
   */
  @property({ type: String }) hour?: 'numeric' | '2-digit';

  /**
   * Minute representation: 'numeric' | '2-digit'.
   */
  @property({ type: String }) minute?: 'numeric' | '2-digit';

  /**
   * Second representation: 'numeric' | '2-digit'.
   */
  @property({ type: String }) second?: 'numeric' | '2-digit';

  /**
   * Preset date formatting style: 'full' | 'long' | 'medium' | 'short'.
   * Preset styles take precedence over granular date and time part options.
   */
  @property({ type: String, attribute: 'date-style' }) dateStyle?: 'full' | 'long' | 'medium' | 'short';

  /**
   * Preset time formatting style: 'full' | 'long' | 'medium' | 'short'.
   * Preset styles take precedence over granular date and time part options.
   */
  @property({ type: String, attribute: 'time-style' }) timeStyle?: 'full' | 'long' | 'medium' | 'short';

  /**
   * Time zone name display: 'long' | 'short'. Use it with granular options only; preset styles ignore it.
   */
  @property({ type: String, attribute: 'time-zone-name' }) timeZoneName?: 'long' | 'short';

  /**
   * IANA time zone identifier (such as 'America/New_York', 'UTC').
   */
  @property({ type: String, attribute: 'time-zone' }) timeZone?: string;

  get #dateValue(): string {
    return this.date ?? this.textContent?.trim() ?? '';
  }

  get #resolvedLocale(): string | undefined {
    return this.locale ?? (globalThis.document?.documentElement?.lang || undefined);
  }

  get #formattedDate(): string {
    const iso = this.#dateValue;
    if (!iso) return '';

    const date = this.#parseDate(iso);
    if (!date) return iso;

    try {
      return new Intl.DateTimeFormat(this.#resolvedLocale, this.#formatOptions).format(date);
    } catch (e) {
      LogService.warn(`format-datetime: ${(e as Error).message}`);
      return iso;
    }
  }

  get #formatOptions(): Intl.DateTimeFormatOptions {
    return this.#hasPresetStyle ? this.#presetFormatOptions : this.#granularFormatOptions;
  }

  get #hasPresetStyle(): boolean {
    return this.dateStyle !== undefined || this.timeStyle !== undefined;
  }

  get #presetFormatOptions(): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = {};

    if (this.dateStyle) options.dateStyle = this.dateStyle;
    if (this.timeStyle) options.timeStyle = this.timeStyle;
    if (this.timeZone) options.timeZone = this.timeZone;

    return options;
  }

  get #granularFormatOptions(): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = {};

    if (this.weekday) options.weekday = this.weekday;
    if (this.year) options.year = this.year;
    if (this.month) options.month = this.month;
    if (this.day) options.day = this.day;
    if (this.hour) options.hour = this.hour;
    if (this.minute) options.minute = this.minute;
    if (this.second) options.second = this.second;
    if (this.timeZoneName) options.timeZoneName = this.timeZoneName;
    if (this.timeZone) options.timeZone = this.timeZone;

    return options;
  }

  #parseDate(iso: string): Date | null {
    const date = new Date(iso);
    if (!isNaN(date.getTime())) return date;

    LogService.warn(`format-datetime: invalid date value "${iso}"`);
    return null;
  }

  render() {
    return html`<time internal-host datetime=${this.#dateValue}>${this.#formattedDate}<slot @slotchange=${this.#onSlotChange} hidden></slot></time>`;
  }

  #onSlotChange() {
    this.requestUpdate();
  }
}
