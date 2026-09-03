// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { LogService, typeSSR, useStyles } from '@nvidia-elements/core/internal';
import styles from './format-bytes.css?inline';

export type FormatBytesDisplay = 'decimal' | 'binary';
export type FormatBytesUnit = 'b' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
export type FormatBytesUnitDisplay = 'short' | 'long';

interface UnitLabels {
  short: string;
  singular: string;
  plural: string;
}

const UNITS: readonly FormatBytesUnit[] = ['b', 'kb', 'mb', 'gb', 'tb', 'pb'];
const DISPLAYS: readonly FormatBytesDisplay[] = ['decimal', 'binary'];
const UNIT_DISPLAYS: readonly FormatBytesUnitDisplay[] = ['short', 'long'];

const DECIMAL_LABELS: Record<FormatBytesUnit, UnitLabels> = {
  b: { short: 'B', singular: 'byte', plural: 'bytes' },
  kb: { short: 'kB', singular: 'kilobyte', plural: 'kilobytes' },
  mb: { short: 'MB', singular: 'megabyte', plural: 'megabytes' },
  gb: { short: 'GB', singular: 'gigabyte', plural: 'gigabytes' },
  tb: { short: 'TB', singular: 'terabyte', plural: 'terabytes' },
  pb: { short: 'PB', singular: 'petabyte', plural: 'petabytes' }
};

const BINARY_LABELS: Record<FormatBytesUnit, UnitLabels> = {
  b: { short: 'B', singular: 'byte', plural: 'bytes' },
  kb: { short: 'KiB', singular: 'kibibyte', plural: 'kibibytes' },
  mb: { short: 'MiB', singular: 'mebibyte', plural: 'mebibytes' },
  gb: { short: 'GiB', singular: 'gibibyte', plural: 'gibibytes' },
  tb: { short: 'TiB', singular: 'tebibyte', plural: 'tebibytes' },
  pb: { short: 'PiB', singular: 'pebibyte', plural: 'pebibytes' }
};

function isDisplay(value: unknown): value is FormatBytesDisplay {
  return DISPLAYS.some(display => display === value);
}

function isUnit(value: unknown): value is FormatBytesUnit {
  return UNITS.some(unit => unit === value);
}

function isUnitDisplay(value: unknown): value is FormatBytesUnitDisplay {
  return UNIT_DISPLAYS.some(unitDisplay => unitDisplay === value);
}

/**
 * @element nve-format-bytes
 * @description Formats a byte count as localized, human-readable decimal or binary units.
 * @documentation https://nvidia.github.io/elements/docs/elements/format-bytes/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/format-bytes
 * @slot - Numeric byte count to format (such as 1048576). Serves as fallback before hydration.
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/data
 */
@typeSSR()
export class FormatBytes extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-format-bytes',
    version: '0.0.0'
  };

  /**
   * Optional byte count for values supplied by JavaScript or bound data.
   * By default, the component formats the element's text content, which also serves as the SSR fallback.
   * When both are present, this property takes precedence.
   */
  @property({ type: Number }) value?: number;

  /**
   * Unit system: 'decimal' uses powers of 1000 and 'binary' uses powers of 1024.
   */
  @property({ type: String }) display: FormatBytesDisplay = 'decimal';

  /**
   * Optional unit magnitude. When omitted, the component selects a unit from the byte count.
   */
  @property({ type: String }) unit?: FormatBytesUnit;

  /**
   * Unit label length: 'short' renders labels such as 'MB'; 'long' renders labels such as 'megabytes'.
   */
  @property({ type: String, attribute: 'unit-display' }) unitDisplay: FormatBytesUnitDisplay = 'short';

  /**
   * Language tag (such as en-US or de-DE) used to format the number.
   * Defaults to document.documentElement.lang or the runtime default.
   */
  @property({ type: String }) locale?: string;

  /**
   * Pad fraction output to at least this many digits.
   */
  @property({ type: Number, attribute: 'minimum-fraction-digits' }) minimumFractionDigits?: number;

  /**
   * Round fraction output to at most this many digits. Defaults to two effective digits after the decimal point.
   */
  @property({ type: Number, attribute: 'maximum-fraction-digits' }) maximumFractionDigits?: number;

  get #rawValue(): string {
    const value = Number.isNaN(this.value) ? (this.getAttribute('value') ?? this.value) : this.value;
    return String(value ?? this.textContent?.trim() ?? '');
  }

  get #resolvedLocale(): string | undefined {
    return this.locale ?? (globalThis.document?.documentElement?.lang || undefined);
  }

  get #parsedValue(): number | null {
    const rawValue = this.#rawValue;
    if (!rawValue) return null;

    const numericValue = Number(rawValue);
    if (Number.isFinite(numericValue)) return numericValue;

    LogService.warn(`format-bytes: invalid numeric value "${rawValue}"`);
    return null;
  }

  #resolveAutoUnit(value: number, display: FormatBytesDisplay): FormatBytesUnit {
    const base = display === 'binary' ? 1024 : 1000;
    const absoluteValue = Math.abs(value);

    for (let index = UNITS.length - 1; index > 0; index--) {
      const unit = UNITS[index];
      if (unit && absoluteValue >= base ** index) return unit;
    }

    return 'b';
  }

  #formatLabel(unit: FormatBytesUnit, convertedValue: number): string {
    const labels = this.display === 'binary' ? BINARY_LABELS[unit] : DECIMAL_LABELS[unit];
    if (this.unitDisplay === 'short') return labels.short;
    return Math.abs(convertedValue) === 1 ? labels.singular : labels.plural;
  }

  #warnInvalidOption(name: string, value: unknown): void {
    LogService.warn(`format-bytes: invalid ${name} value "${String(value)}"`);
  }

  #hasValidConfiguration(): boolean {
    if (!isDisplay(this.display)) {
      this.#warnInvalidOption('display', this.display);
      return false;
    }
    if (!isUnitDisplay(this.unitDisplay)) {
      this.#warnInvalidOption('unit-display', this.unitDisplay);
      return false;
    }
    if (this.unit !== undefined && !isUnit(this.unit)) {
      this.#warnInvalidOption('unit', this.unit);
      return false;
    }
    return true;
  }

  get #numberFormatOptions(): Intl.NumberFormatOptions {
    const effectiveMaximumFractionDigits = this.maximumFractionDigits ?? Math.max(this.minimumFractionDigits ?? 0, 2);
    return {
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: effectiveMaximumFractionDigits
    };
  }

  #roundNumber(value: number): number {
    return Number(
      new Intl.NumberFormat('en-US-u-nu-latn', {
        ...this.#numberFormatOptions,
        useGrouping: false
      }).format(value)
    );
  }

  #formatNumber(value: number): string {
    return new Intl.NumberFormat(this.#resolvedLocale, this.#numberFormatOptions).format(value);
  }

  get #formattedBytes(): string {
    const rawValue = this.#rawValue;
    if (!rawValue) return '';

    const numericValue = this.#parsedValue;
    if (numericValue === null) return rawValue;
    if (!this.#hasValidConfiguration()) return rawValue;

    const resolvedUnit = this.unit ?? this.#resolveAutoUnit(numericValue, this.display);
    const unitIndex = UNITS.indexOf(resolvedUnit);
    const base = this.display === 'binary' ? 1024 : 1000;
    const convertedValue = numericValue / base ** unitIndex;

    try {
      const roundedValue = this.#roundNumber(convertedValue);
      return `${this.#formatNumber(roundedValue)} ${this.#formatLabel(resolvedUnit, roundedValue)}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      LogService.warn(`format-bytes: ${message}`);
      return rawValue;
    }
  }

  render() {
    return html`<data internal-host value=${this.#rawValue}>${this.#formattedBytes}<slot @slotchange=${this.#onSlotChange} hidden></slot></data>`;
  }

  #onSlotChange() {
    this.requestUpdate();
  }
}
