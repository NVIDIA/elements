// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { FormatBytes, type FormatBytesUnit } from '@nvidia-elements/core/format-bytes';
import { LogService } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/format-bytes/define.js';

function renderedData(element: FormatBytes): HTMLDataElement | null {
  return element.shadowRoot?.querySelector('data') ?? null;
}

function renderedText(element: FormatBytes): string {
  return renderedData(element)?.textContent?.trim() ?? '';
}

describe(FormatBytes.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatBytes;
  let originalDocumentLang: string;

  beforeEach(async () => {
    originalDocumentLang = document.documentElement.lang;
    fixture = await createFixture(html`<nve-format-bytes locale="en-US">1048576</nve-format-bytes>`);
    element = fixture.querySelector(FormatBytes.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    document.documentElement.lang = originalDocumentLang;
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should define element', () => {
    expect(customElements.get(FormatBytes.metadata.tag)).toBeDefined();
  });

  it('should render semantic data with the raw byte count', () => {
    expect(renderedData(element)?.getAttribute('value')).toBe('1048576');
    expect(renderedText(element)).toBe('1.05 mb');
  });

  it('should use value over slot content', async () => {
    element.value = 1024;
    await elementIsStable(element);

    expect(renderedData(element)?.getAttribute('value')).toBe('1024');
    expect(renderedText(element)).toBe('1.02 kb');
  });

  it('should use slot content when value attribute is removed', async () => {
    element.setAttribute('value', '1024');
    await elementIsStable(element);

    element.removeAttribute('value');
    await elementIsStable(element);

    expect(renderedData(element)?.getAttribute('value')).toBe('1048576');
    expect(renderedText(element)).toBe('1.05 mb');
  });

  it('should render empty output without a value', async () => {
    element.textContent = '';
    await elementIsStable(element);

    expect(renderedData(element)?.getAttribute('value')).toBe('');
    expect(renderedText(element)).toBe('');
  });

  it('should re-render when slot content changes', async () => {
    element.textContent = '1073741824';
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1.07 gb');
  });

  it.each([
    ['999', '999 b'],
    ['1000', '1 kb'],
    ['1024', '1.02 kb'],
    ['1048576', '1.05 mb'],
    ['1073741824', '1.07 gb']
  ])('should automatically format decimal bytes %s as %s', async (value, expected) => {
    element.textContent = value;
    await elementIsStable(element);

    expect(renderedText(element)).toBe(expected);
  });

  it.each([
    ['1023', '1,023 b'],
    ['1024', '1 kib'],
    ['1048576', '1 mib'],
    ['1073741824', '1 gib']
  ])('should automatically format binary bytes %s as %s', async (value, expected) => {
    element.display = 'binary';
    element.textContent = value;
    await elementIsStable(element);

    expect(renderedText(element)).toBe(expected);
  });

  it.each<[FormatBytesUnit, string]>([
    ['kb', '1,048.58 kb'],
    ['mb', '1.05 mb'],
    ['gb', '0 gb']
  ])('should force the %s unit', async (unit, expected) => {
    element.unit = unit;
    await elementIsStable(element);

    expect(renderedText(element)).toBe(expected);
  });

  it('should use the forced magnitude with binary labels', async () => {
    element.display = 'binary';
    element.unit = 'kb';
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1,024 kib');
  });

  it.each([
    [1000000, '1 megabyte'],
    [1500000, '1.5 megabytes'],
    [-1000000, '-1 megabyte']
  ])('should format decimal long labels for %s bytes', async (value, expected) => {
    element.value = value;
    element.unitDisplay = 'long';
    await elementIsStable(element);

    expect(renderedText(element)).toBe(expected);
  });

  it('should format binary long labels', async () => {
    element.display = 'binary';
    element.unitDisplay = 'long';
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1 mebibyte');
  });

  it('should select a long label from the rounded value', async () => {
    element.value = 999999;
    element.unit = 'mb';
    element.unitDisplay = 'long';
    element.maximumFractionDigits = 0;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1 megabyte');
  });

  it('should format with maximum fraction digits', async () => {
    element.textContent = '1234567';
    element.maximumFractionDigits = 0;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1 mb');
  });

  it('should format with fixed fraction digits', async () => {
    element.textContent = '1234567';
    element.minimumFractionDigits = 3;
    element.maximumFractionDigits = 3;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1.235 mb');
  });

  it('should expand the effective default maximum for minimum fraction digits', async () => {
    element.textContent = '1234567';
    element.minimumFractionDigits = 3;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1.235 mb');
  });

  it('should use the configured locale', async () => {
    element.locale = 'de-DE';
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1,05 mb');
  });

  it('should use the document locale by default', async () => {
    element.locale = undefined;
    document.documentElement.lang = 'de-DE';
    element.requestUpdate();
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1,05 mb');
  });

  it('should use the runtime locale when the document language is empty', async () => {
    element.locale = undefined;
    document.documentElement.lang = '';
    element.requestUpdate();
    await elementIsStable(element);

    const expectedNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(1.05);
    expect(renderedText(element)).toBe(`${expectedNumber} mb`);
  });

  it('should preserve zero and negative values', async () => {
    element.value = 0;
    await elementIsStable(element);
    expect(renderedText(element)).toBe('0 b');

    element.value = -1000;
    await elementIsStable(element);
    expect(renderedText(element)).toBe('-1 kb');
  });

  it('should cap automatic conversion at petabytes', async () => {
    element.value = 1e18;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1,000 pb');
  });

  it.each([
    ['display', 'invalid'],
    ['unit', 'invalid'],
    ['unit-display', 'invalid']
  ])('should preserve input for an invalid %s option', async (attribute, value) => {
    const warn = vi.spyOn(LogService, 'warn').mockImplementation(() => undefined);
    element.setAttribute(attribute, value);
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1048576');
    expect(warn).toHaveBeenCalledOnce();
  });

  it('should preserve and warn for invalid numeric input', async () => {
    const warn = vi.spyOn(LogService, 'warn').mockImplementation(() => undefined);
    element.textContent = 'not-a-number';
    await elementIsStable(element);

    expect(renderedText(element)).toBe('not-a-number');
    expect(warn).toHaveBeenCalledWith('format-bytes: invalid numeric value "not-a-number"');
  });

  it('should preserve and warn for an invalid value attribute', async () => {
    const warn = vi.spyOn(LogService, 'warn').mockImplementation(() => undefined);
    element.setAttribute('value', 'not-a-number');
    await elementIsStable(element);

    expect(renderedData(element)?.getAttribute('value')).toBe('not-a-number');
    expect(renderedText(element)).toBe('not-a-number');
    expect(warn).toHaveBeenCalledWith('format-bytes: invalid numeric value "not-a-number"');
  });

  it('should preserve and warn for a NaN value property', async () => {
    const warn = vi.spyOn(LogService, 'warn').mockImplementation(() => undefined);
    element.value = Number.NaN;
    await elementIsStable(element);

    expect(renderedData(element)?.getAttribute('value')).toBe('NaN');
    expect(renderedText(element)).toBe('NaN');
    expect(warn).toHaveBeenCalledWith('format-bytes: invalid numeric value "NaN"');
  });

  it('should preserve input for invalid fraction digit options', async () => {
    const warn = vi.spyOn(LogService, 'warn').mockImplementation(() => undefined);
    element.minimumFractionDigits = 3;
    element.maximumFractionDigits = 2;
    await elementIsStable(element);

    expect(renderedText(element)).toBe('1048576');
    expect(warn).toHaveBeenCalledOnce();
  });
});
