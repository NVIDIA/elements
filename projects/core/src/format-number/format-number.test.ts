// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LogService } from '@nvidia-elements/core/internal';
import { FormatNumber } from '@nvidia-elements/core/format-number';
import '@nvidia-elements/core/format-number/define.js';

describe(FormatNumber.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatNumber;
  let originalDocumentLang: string;

  beforeEach(async () => {
    originalDocumentLang = document.documentElement.lang;
    fixture = await createFixture(html`<nve-format-number locale="en-US">1234567</nve-format-number>`);
    element = fixture.querySelector(FormatNumber.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    document.documentElement.lang = originalDocumentLang;
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(FormatNumber.metadata.tag)).toBeDefined();
  });

  it('should render formatted number from slot content', async () => {
    const data = element.shadowRoot!.querySelector('data');
    expect(data!.textContent!.trim()).toBe('1,234,567');
  });

  it('should render semantic data element with value attribute', async () => {
    const data = element.shadowRoot!.querySelector('data');
    expect(data).toBeTruthy();
    expect(data!.getAttribute('value')).toBe('1234567');
  });

  it('should use number attribute over slot content', async () => {
    element.number = '9999';
    await elementIsStable(element);

    const data = element.shadowRoot!.querySelector('data');
    expect(data!.getAttribute('value')).toBe('9999');
    expect(data!.textContent!.trim()).toBe('9,999');
  });

  it('should re-render when slot content changes', async () => {
    element.textContent = '2048';
    await elementIsStable(element);

    const data = element.shadowRoot!.querySelector('data');
    expect(data!.getAttribute('value')).toBe('2048');
    expect(data!.textContent!.trim()).toBe('2,048');
  });

  describe('format-style', () => {
    it('should format as decimal by default', async () => {
      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1,234,567');
    });

    it('should format as currency', async () => {
      element.number = '1234.56';
      element.formatStyle = 'currency';
      element.currency = 'USD';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('$1,234.56');
    });

    it('should format as percent', async () => {
      element.number = '0.85';
      element.formatStyle = 'percent';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('85%');
    });

    it('should format as unit', async () => {
      element.number = '12';
      element.formatStyle = 'unit';
      element.unit = 'kilometer';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('km');
    });
  });

  describe('currency options', () => {
    it('should display currency code', async () => {
      element.number = '1234.56';
      element.formatStyle = 'currency';
      element.currency = 'USD';
      element.currencyDisplay = 'code';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('USD');
    });

    it('should display currency name', async () => {
      element.number = '1234.56';
      element.formatStyle = 'currency';
      element.currency = 'USD';
      element.currencyDisplay = 'name';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('US dollars');
    });

    it('should use accounting sign for negative values', async () => {
      element.number = '-1234.56';
      element.formatStyle = 'currency';
      element.currency = 'USD';
      element.currencySign = 'accounting';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('($1,234.56)');
    });
  });

  describe('notation', () => {
    it('should format with compact notation short', async () => {
      element.number = '1234567';
      element.notation = 'compact';
      element.compactDisplay = 'short';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1.2M');
    });

    it('should format with compact notation long', async () => {
      element.number = '1234567';
      element.notation = 'compact';
      element.compactDisplay = 'long';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('million');
    });

    it('should format with scientific notation', async () => {
      element.number = '1234567';
      element.notation = 'scientific';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('E');
    });
  });

  describe('sign-display', () => {
    it('should show sign always', async () => {
      element.number = '12';
      element.signDisplay = 'always';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('+12');
    });

    it('should hide sign with never', async () => {
      element.number = '-12';
      element.signDisplay = 'never';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('12');
    });
  });

  describe('unit-display', () => {
    it('should display unit long', async () => {
      element.number = '12';
      element.formatStyle = 'unit';
      element.unit = 'kilometer';
      element.unitDisplay = 'long';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toContain('kilometers');
    });
  });

  describe('use-grouping', () => {
    it('should suppress grouping with false', async () => {
      element.number = '1234567';
      element.useGrouping = 'false';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1234567');
    });
  });

  describe('fraction digits', () => {
    it('should pad with minimum-fraction-digits', async () => {
      element.number = '1.5';
      element.minimumFractionDigits = 4;
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1.5000');
    });

    it('should round with maximum-fraction-digits', async () => {
      element.number = '1.567';
      element.maximumFractionDigits = 0;
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('2');
    });
  });

  describe('locale', () => {
    it('should fall back to document lang when locale is omitted', async () => {
      document.documentElement.lang = 'de-DE';
      removeFixture(fixture);

      fixture = await createFixture(html`<nve-format-number>1234.56</nve-format-number>`);
      element = fixture.querySelector(FormatNumber.metadata.tag);
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1.234,56');
    });

    it('should format with explicit de-DE locale', async () => {
      removeFixture(fixture);

      fixture = await createFixture(html`<nve-format-number locale="de-DE">1234.56</nve-format-number>`);
      element = fixture.querySelector(FormatNumber.metadata.tag);
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1.234,56');
    });
  });

  describe('fallback', () => {
    let warnSpy: MockInstance<typeof LogService.warn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(LogService, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should show raw string for invalid number input', async () => {
      element.number = 'not-a-number';
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('not-a-number');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid numeric value'));
    });

    it('should fall back for invalid Intl options', async () => {
      element.number = '1234.56';
      element.setAttribute('format-style', 'banana');
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1234.56');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should fall back when currency is missing', async () => {
      element.number = '1234.56';
      element.formatStyle = 'currency';
      element.currency = undefined;
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('1234.56');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should fall back when unit is missing', async () => {
      element.number = '12';
      element.formatStyle = 'unit';
      element.unit = undefined;
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('12');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should render empty for no content', async () => {
      removeFixture(fixture);

      fixture = await createFixture(html`<nve-format-number></nve-format-number>`);
      element = fixture.querySelector(FormatNumber.metadata.tag);
      await elementIsStable(element);

      const data = element.shadowRoot!.querySelector('data');
      expect(data!.textContent!.trim()).toBe('');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
