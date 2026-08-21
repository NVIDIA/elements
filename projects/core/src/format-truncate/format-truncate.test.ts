// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { FormatTruncate } from '@nvidia-elements/core/format-truncate';
import '@nvidia-elements/core/format-truncate/define.js';
import { truncateText } from './utils.js';

describe(FormatTruncate.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatTruncate;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-format-truncate>short text</nve-format-truncate>`);
    element = getTruncate(fixture);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(FormatTruncate.metadata.tag)).toBeDefined();
  });

  it('should expose reflected defaults', () => {
    expect(element.position).toBe('start');
    expect(element.getAttribute('position')).toBe('start');
    expect(element.bias).toBe('end');
    expect(element.getAttribute('bias')).toBe('end');
    expect(element.strategy).toBe('character');
    expect(element.getAttribute('strategy')).toBe('character');
    expect(element.preserve).toBe(6);
    expect(element.getAttribute('preserve')).toBe('6');
  });

  it('should render computed content in an aria-hidden internal host', () => {
    expect(element.hasAttribute('title')).toBe(false);
    expect(element.shadowRoot?.textContent).toBe('short text');
    const internalHost = element.shadowRoot?.querySelector<HTMLSpanElement>('[internal-host]');
    expect(internalHost).toBeInstanceOf(HTMLSpanElement);
    expect(internalHost?.getAttribute('aria-hidden')).toBe('true');
    expect(internalHost?.textContent).toBe('short text');
  });

  it('should inherit font size from its container', () => {
    fixture.style.font = '700 32px/1.2 serif';
    fixture.style.color = 'rgb(12, 34, 56)';

    const internalHost = element.shadowRoot?.querySelector<HTMLElement>('[internal-host]');
    expect(internalHost).toBeInstanceOf(HTMLSpanElement);

    const styles = getComputedStyle(internalHost!);
    expect(styles.fontSize).toBe('32px');
  });

  it('should normalize mixed slotted content', async () => {
    element.innerHTML = 'alpha<strong>beta</strong>gamma';
    getDefaultSlot(element).dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);

    expect(element.shadowRoot?.textContent).toBe('alpha beta gamma');
    expect(element.hasAttribute('title')).toBe(false);
  });

  it('should remove text alternatives for empty content', async () => {
    element.textContent = '';
    getDefaultSlot(element).dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);

    expect(element.shadowRoot?.textContent).toBe('');
    expect(element.hasAttribute('title')).toBe(false);
  });

  it('should visually hide the source slot with the component stylesheet', () => {
    const slot = getDefaultSlot(element);
    expect(slot.hidden).toBe(false);
    expect(getComputedStyle(slot).position).toBe('absolute');
    expect(getComputedStyle(slot).width).toBe('1px');
  });

  it('should recompute the plain text for a constrained container', async () => {
    fixture.style.width = '40px';
    element.position = 'end';
    element.textContent = 'abcdefghij';
    getDefaultSlot(element).dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);

    expect(element.shadowRoot?.textContent).toContain('…');
    expect(element.title).toBe('abcdefghij');
    expect(element.shadowRoot?.querySelector('[internal-host]')).toBeInstanceOf(HTMLSpanElement);
  });

  it('should recompute text after moving between containers', async () => {
    const narrowContainer = document.createElement('div');
    narrowContainer.style.width = '40px';
    const wideContainer = document.createElement('div');
    wideContainer.style.width = '400px';
    fixture.append(narrowContainer, wideContainer);

    element.textContent = 'abcdefghij';
    narrowContainer.append(element);
    await elementIsStable(element);

    expect(element.shadowRoot?.textContent).toContain('…');
    expect(element.title).toBe('abcdefghij');

    wideContainer.append(element);
    await elementIsStable(element);

    expect(element.shadowRoot?.textContent).toBe('abcdefghij');
    expect(element.hasAttribute('title')).toBe(false);
  });
});

describe('truncateText', () => {
  it('should leave text unchanged when it fits', () => {
    expect(renderTruncatedText('short', { availableWidth: 5 })).toBe('short');
  });

  it('should truncate at the start or end by grapheme', () => {
    expect(renderTruncatedText('abcdefghij', { position: 'start', availableWidth: 6 })).toBe('…fghij');
    expect(renderTruncatedText('abcdefghij', { position: 'end', availableWidth: 6 })).toBe('abcde…');
  });

  it('should keep the configured center bias', () => {
    expect(
      renderTruncatedText('abcdefghij', { position: 'center', bias: 'start', preserve: 3, availableWidth: 8 })
    ).toBe('abc…ghij');
    expect(renderTruncatedText('abcdefghij', { position: 'center', bias: 'end', preserve: 3, availableWidth: 8 })).toBe(
      'abcd…hij'
    );
  });

  it('should preserve complete words', () => {
    expect(
      renderTruncatedText('alpha beta gamma delta', {
        position: 'center',
        strategy: 'word',
        bias: 'end',
        preserve: 2,
        availableWidth: 17
      })
    ).toBe('alpha…gamma delta');
    expect(
      renderTruncatedText('alpha beta gamma delta', {
        position: 'center',
        strategy: 'word',
        bias: 'start',
        preserve: 2,
        availableWidth: 16
      })
    ).toBe('alpha beta…delta');
  });

  it('should preserve complete path segments', () => {
    expect(
      renderTruncatedText('/models/checkpoints/run/model.bin', {
        position: 'center',
        strategy: 'path',
        bias: 'end',
        preserve: 2,
        availableWidth: 22
      })
    ).toBe('/models…/run/model.bin');
    expect(
      renderTruncatedText('/models/checkpoints/run/model.bin', {
        position: 'center',
        strategy: 'path',
        bias: 'start',
        preserve: 2,
        availableWidth: 30
      })
    ).toBe('/models/checkpoints/…model.bin');
  });

  it('should not split Unicode grapheme clusters', () => {
    expect(
      renderTruncatedText('A👩🏽‍💻BCD', {
        position: 'end',
        availableWidth: 4,
        measureText: measureGraphemes
      })
    ).toBe('A👩🏽‍💻B…');
  });

  it('should clamp preserve to one whole unit', () => {
    expect(
      renderTruncatedText('abcdefghij', {
        position: 'center',
        bias: 'end',
        preserve: 0.5,
        availableWidth: 6
      })
    ).toBe('abcd…j');
  });

  it('should keep the biased edge when preserved content does not fit', () => {
    expect(
      renderTruncatedText('abcdefghij', {
        position: 'center',
        bias: 'end',
        preserve: 6,
        availableWidth: 4
      })
    ).toBe('…hij');
  });
});

type TruncateOptions = Parameters<typeof truncateText>[1];

function renderTruncatedText(text: string, options: Partial<TruncateOptions>): string {
  return truncateText(text, {
    position: 'end',
    strategy: 'character',
    bias: 'end',
    preserve: 6,
    availableWidth: Number.POSITIVE_INFINITY,
    measureText: value => Array.from(value).length,
    ...options
  });
}

function measureGraphemes(text: string): number {
  return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length;
}

function getTruncate(container: ParentNode): FormatTruncate {
  const element = container.querySelector<FormatTruncate>(FormatTruncate.metadata.tag);
  if (!element) throw new Error('Expected format truncate element');
  return element;
}

function getDefaultSlot(element: FormatTruncate): HTMLSlotElement {
  const slot = element.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
  if (!slot) throw new Error('Expected default slot');
  return slot;
}
