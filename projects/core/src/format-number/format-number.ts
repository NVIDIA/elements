// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, typeSSR, LogService } from '@nvidia-elements/core/internal';
import styles from './format-number.css?inline';

export type FormatNumberStyle = 'decimal' | 'currency' | 'percent' | 'unit';
export type CurrencyDisplayOption = 'symbol' | 'code' | 'name' | 'narrowSymbol';
export type CurrencySignOption = 'standard' | 'accounting';
export type NotationOption = 'standard' | 'scientific' | 'engineering' | 'compact';
export type CompactDisplayOption = 'short' | 'long';
export type UnitDisplayOption = 'short' | 'long' | 'narrow';
export type SignDisplayOption = 'auto' | 'never' | 'always' | 'exceptZero';

const STRING_KEYS: [keyof FormatNumber, string][] = [
  ['currency', 'currency'],
  ['currencyDisplay', 'currencyDisplay'],
  ['currencySign', 'currencySign'],
  ['notation', 'notation'],
  ['compactDisplay', 'compactDisplay'],
  ['unit', 'unit'],
  ['unitDisplay', 'unitDisplay'],
  ['signDisplay', 'signDisplay']
];

const NUMBER_KEYS: [keyof FormatNumber, string][] = [
  ['minimumFractionDigits', 'minimumFractionDigits'],
  ['maximumFractionDigits', 'maximumFractionDigits'],
  ['minimumIntegerDigits', 'minimumIntegerDigits']
];

/**
 * @element nve-format-number
 * @description A localized number formatter for currencies, percentages, units, and compact notation, backed by Intl.NumberFormat.
 * Provide a `currency` attribute when `formatStyle` is `currency`, and a `unit` attribute when `formatStyle` is `unit`.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/format-number
 * @slot - Numeric string to format (such as 1234567 or 1234.56). Serves as fallback before hydration.
 */
@typeSSR()
export class FormatNumber extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-format-number',
    version: '0.0.0'
  };

  /**
   * Optional numeric string for values supplied by JavaScript or bound data.
   * By default, the component formats the element's text content, which also serves as the SSR fallback.
   * When both are present, this property takes precedence.
   */
  @property({ type: String }) number?: string;

  /**
   * Language tag (such as en-US, de-DE). Defaults to document.documentElement.lang or browser default.
   */
  @property({ type: String }) locale?: string;

  /**
   * Formatting style: 'decimal' | 'currency' | 'percent' | 'unit'.
   */
  @property({ type: String, attribute: 'format-style' }) formatStyle: FormatNumberStyle = 'decimal';

  /**
   * ISO 4217 currency code (such as USD or EUR). Required when formatStyle is currency.
   */
  @property({ type: String }) currency?: string;

  /**
   * Currency sign style: 'standard' | 'accounting'.
   */
  @property({ type: String, attribute: 'currency-sign' }) currencySign?: CurrencySignOption;

  /**
   * Currency display style: 'symbol' | 'code' | 'name' | 'narrowSymbol'.
   */
  @property({ type: String, attribute: 'currency-display' }) currencyDisplay?: CurrencyDisplayOption;

  /**
   * Unit identifier (such as kilometer or byte). Required when formatStyle is unit.
   */
  @property({ type: String }) unit?: string;

  /**
   * Unit display style: 'short' | 'long' | 'narrow'.
   */
  @property({ type: String, attribute: 'unit-display' }) unitDisplay?: UnitDisplayOption;

  /**
   * Number notation: 'standard' | 'scientific' | 'engineering' | 'compact'.
   */
  @property({ type: String }) notation?: NotationOption;

  /**
   * Compact notation display: 'short' | 'long'. Only applies when notation is compact.
   */
  @property({ type: String, attribute: 'compact-display' }) compactDisplay?: CompactDisplayOption;

  /**
   * Sign display: 'auto' | 'never' | 'always' | 'exceptZero'.
   */
  @property({ type: String, attribute: 'sign-display' }) signDisplay?: SignDisplayOption;

  /**
   * Grouping separators: 'auto' | 'always' | 'min2' | 'true' | 'false'.
   */
  @property({ type: String, attribute: 'use-grouping' }) useGrouping?: string;

  /**
   * Pad fraction output to at least this many digits (0-20).
   */
  @property({ type: Number, attribute: 'minimum-fraction-digits' }) minimumFractionDigits?: number;

  /**
   * Round fraction output to at most this many digits (0-20).
   */
  @property({ type: Number, attribute: 'maximum-fraction-digits' }) maximumFractionDigits?: number;

  /**
   * Pad integer output to at least this many digits (1-21).
   */
  @property({ type: Number, attribute: 'minimum-integer-digits' }) minimumIntegerDigits?: number;

  get #rawValue(): string {
    return this.number ?? this.textContent?.trim() ?? '';
  }

  get #resolvedLocale(): string | undefined {
    return this.locale ?? (globalThis.document?.documentElement?.lang || undefined);
  }

  get #parsedNumber(): number | null {
    const raw = this.#rawValue;
    if (!raw) return null;

    const numericValue = Number(raw);
    if (Number.isFinite(numericValue)) return numericValue;

    LogService.warn(`format-number: invalid numeric value "${raw}"`);
    return null;
  }

  get #formatOptions(): Intl.NumberFormatOptions {
    const options: Intl.NumberFormatOptions = { style: this.formatStyle };

    for (const [prop, key] of STRING_KEYS) {
      const value = this[prop] as string | undefined;
      if (value !== undefined) (options as Record<string, unknown>)[key] = value;
    }

    for (const [prop, key] of NUMBER_KEYS) {
      const value = this[prop] as number | undefined;
      if (value !== undefined) (options as Record<string, unknown>)[key] = value;
    }

    if (this.useGrouping !== undefined) {
      const grouping = this.useGrouping === 'false' ? false : this.useGrouping === 'true' ? true : this.useGrouping;
      (options as Record<string, unknown>).useGrouping = grouping;
    }

    return options;
  }

  get #formattedNumber(): string {
    const raw = this.#rawValue;
    if (!raw) return '';

    const numericValue = this.#parsedNumber;
    if (numericValue === null) return raw;

    try {
      return new Intl.NumberFormat(this.#resolvedLocale, this.#formatOptions).format(numericValue);
    } catch (e) {
      LogService.warn(`format-number: ${(e as Error).message}`);
      return raw;
    }
  }

  render() {
    return html`<data internal-host value=${this.#rawValue}>${this.#formattedNumber}<slot @slotchange=${this.#onSlotChange} hidden></slot></data>`;
  }

  #onSlotChange() {
    this.requestUpdate();
  }
}
