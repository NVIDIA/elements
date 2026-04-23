// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, typeSSR, LogService } from '@nvidia-elements/core/internal';
import styles from './format-relative-time.css?inline';

type TimeUnitOption = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/**
 * @element nve-format-relative-time
 * @description Formats a date/time value as localized relative text using the Intl.RelativeTimeFormat API. Renders inside a semantic time element.
 * Options mirror the Intl.RelativeTimeFormat API. When unit is 'auto', the component selects the best unit based on the time difference.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/format-relative-time
 * @slot - Date string to format (such as 2023-07-28T04:20:17.434Z). Serves as fallback before hydration.
 */
@typeSSR()
export class FormatRelativeTime extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-format-relative-time',
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
   * Numeric formatting: 'always' | 'auto'. When 'auto', enables natural language forms such as 'yesterday' instead of '1 day ago'.
   */
  @property({ type: String }) numeric: 'always' | 'auto' = 'always';

  /**
   * Formatting length: 'long' | 'short' | 'narrow'. Controls verbosity (such as '3 days ago' vs '3d ago'). Maps to Intl.RelativeTimeFormat style option.
   */
  @property({ type: String, attribute: 'format-style' }) formatStyle: 'long' | 'short' | 'narrow' = 'long';

  /**
   * Time unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'auto'. Use 'auto' to let the component select the most appropriate unit based on the time difference.
   */
  @property({ type: String }) unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'auto' = 'auto';

  /**
   * When present, auto-updates the displayed relative time at appropriate intervals.
   */
  @property({ type: Boolean }) sync = false;

  #timer?: ReturnType<typeof setTimeout>;

  get #dateValue(): string {
    return this.date ?? this.textContent?.trim() ?? '';
  }

  get #resolvedLocale(): string | undefined {
    return this.locale ?? (globalThis.document?.documentElement?.lang || undefined);
  }

  #computeUnit(diffMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
    const absDiff = Math.abs(diffMs);
    const sign = diffMs < 0 ? -1 : 1;

    const seconds = Math.round(absDiff / 1000);
    const minutes = Math.round(absDiff / 60000);
    const hours = Math.round(absDiff / 3600000);
    const days = Math.round(absDiff / 86400000);
    const weeks = Math.round(absDiff / 604800000);
    const months = Math.round(absDiff / 2592000000);
    const years = Math.round(absDiff / 31536000000);

    if (seconds < 60) return { value: sign * seconds, unit: 'second' };
    if (minutes < 60) return { value: sign * minutes, unit: 'minute' };
    if (hours < 24) return { value: sign * hours, unit: 'hour' };
    if (days < 7) return { value: sign * days, unit: 'day' };
    if (weeks < 4) return { value: sign * weeks, unit: 'week' };
    if (months < 12) return { value: sign * months, unit: 'month' };
    return { value: sign * years, unit: 'year' };
  }

  #computeExplicitUnit(diffMs: number, unit: TimeUnitOption): number {
    const divisors: Record<string, number> = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000,
      month: 2592000000,
      year: 31536000000
    };
    return Math.round(diffMs / (divisors[unit] ?? 1));
  }

  get #formattedRelativeTime(): string {
    const iso = this.#dateValue;
    if (!iso) return '';

    const target = new Date(iso);
    if (isNaN(target.getTime())) {
      LogService.warn(`format-relative-time: invalid date value "${iso}"`);
      return iso;
    }

    const diffMs = target.getTime() - Date.now();
    let value: number;
    let resolvedUnit: Intl.RelativeTimeFormatUnit;

    if (this.unit === 'auto') {
      ({ value, unit: resolvedUnit } = this.#computeUnit(diffMs));
    } else {
      resolvedUnit = this.unit;
      value = this.#computeExplicitUnit(diffMs, resolvedUnit);
    }

    try {
      return new Intl.RelativeTimeFormat(this.#resolvedLocale, {
        numeric: this.numeric,
        style: this.formatStyle
      }).format(value, resolvedUnit);
    } catch (e) {
      LogService.warn(`format-relative-time: ${(e as Error).message}`);
      return iso;
    }
  }

  #getSyncInterval(): number {
    const iso = this.#dateValue;
    if (!iso) return 60000;

    const absDiff = Math.abs(new Date(iso).getTime() - Date.now());
    if (absDiff < 60000) return 10000;
    if (absDiff < 3600000) return 30000;
    if (absDiff < 86400000) return 300000;
    return 3600000;
  }

  #startSync() {
    this.#stopSync();
    if (!this.sync) return;

    this.#timer = setTimeout(() => {
      this.requestUpdate();
      this.#startSync();
    }, this.#getSyncInterval());
  }

  #stopSync() {
    if (this.#timer !== undefined) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.sync) this.#startSync();
  }

  disconnectedCallback() {
    this.#stopSync();
    super.disconnectedCallback();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('sync')) {
      if (this.sync) {
        this.#startSync();
      } else {
        this.#stopSync();
      }
    }
  }

  render() {
    return html`<time internal-host datetime=${this.#dateValue}>${this.#formattedRelativeTime}<slot @slotchange=${this.#onSlotChange} hidden></slot></time>`;
  }

  #onSlotChange() {
    this.requestUpdate();
  }
}
