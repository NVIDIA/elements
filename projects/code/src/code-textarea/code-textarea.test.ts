// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CodeTextarea } from '@nvidia-elements/code/code-textarea';
import { parseCode } from '../internal/highlight/syntax.js';
import '@nvidia-elements/code/languages/html.js';
import '@nvidia-elements/code/languages/json.js';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/python.js';
import '@nvidia-elements/code/languages/tsx.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/code-block/define.js';
import '@nvidia-elements/code/code-textarea/define.js';
import '@nvidia-elements/themes/index.css';
import '@nvidia-elements/themes/dark.css';

function getExpectedSyntaxRanges(language: string, text: string) {
  return parseCode(language, text).ranges;
}

function opaqueRanges() {
  return Array.from(CSS.highlights).flatMap(([name, highlight]) =>
    Array.from(highlight)
      .filter(range => 'disconnect' in range)
      .map(range => ({ name, range }))
  );
}

function actualSpans() {
  return opaqueRanges()
    .filter(({ name }) => name.startsWith('nve-code-') && !name.startsWith('nve-code-bracket-'))
    .map(({ name, range }) => [range.startOffset, range.endOffset, name.slice(9)] as [number, number, string])
    .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0) || (a[1] ?? 0) - (b[1] ?? 0));
}

describe(CodeTextarea.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CodeTextarea;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-code-textarea language="typescript">
          <label>Source</label>
          <textarea name="source" rows="6" required>  const answer: number = 42;
</textarea>
        </nve-code-textarea>
      </form>
    `);
    const control = fixture.querySelector('nve-code-textarea');
    const input = fixture.querySelector('textarea');
    if (!control || !input) throw new Error('Missing textarea fixture');
    element = control;
    textarea = input;
    await elementIsStable(element);
  });

  afterEach(() => removeFixture(fixture));

  it('defines the component', () => {
    expect(customElements.get(CodeTextarea.metadata.tag)).toBeDefined();
  });

  it('uses the inherited theme token for native syntax colors and respects local overrides', () => {
    element.style.cssText = '--nve-ref-color-purple-violet-1100: red; --nve-ref-color-blue-cobalt-1100: blue;';
    const body = document.body;
    const previousTheme = body.getAttribute('nve-theme');

    try {
      body.setAttribute('nve-theme', 'dark');
      textarea.style.colorScheme = 'light';
      expect(getComputedStyle(textarea, '::highlight(nve-code-keyword)').color).toBe('rgb(0, 0, 255)');

      body.setAttribute('nve-theme', 'light');
      textarea.style.colorScheme = 'dark';
      expect(getComputedStyle(textarea, '::highlight(nve-code-keyword)').color).toBe('rgb(255, 0, 0)');

      element.setAttribute('nve-theme', 'dark');
      textarea.style.colorScheme = 'light';
      expect(getComputedStyle(textarea, '::highlight(nve-code-keyword)').color).toBe('rgb(0, 0, 255)');
    } finally {
      if (previousTheme === null) body.removeAttribute('nve-theme');
      else body.setAttribute('nve-theme', previousTheme);
    }
  });

  it('preserves the native value and form control', () => {
    expect('createValueRange' in textarea, navigator.userAgent).toBe(true);
    expect(element.input).toBe(textarea);
    expect(textarea.value).toBe('  const answer: number = 42;\n');
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    expect(new FormData(textarea.form ?? undefined).get('source')).toBe(textarea.value);
    expect(element.shadowRoot?.querySelector('textarea, code, pre')).toBeNull();
  });

  it('refreshes after direct value assignments without requiring input events', async () => {
    textarea.value = 'const greeting = "hello";';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('rebuilds live ranges even when an assignment leaves the value equal', async () => {
    const previous = opaqueRanges().map(entry => entry.range);
    textarea.value = textarea.value;
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    expect(opaqueRanges().every(entry => !previous.includes(entry.range))).toBe(true);
    expect(previous.every(range => range.startOffset === 0 && range.endOffset === 0)).toBe(true);
  });

  it('updates native edits incrementally and retains unaffected ranges', async () => {
    element.language = 'json';
    textarea.value = '[\n' + Array.from({ length: 80 }, (_, index) => `  {"value": ${index}}`).join(',\n') + '\n]';
    await elementIsStable(element);
    const tail = opaqueRanges().find(({ range }) => range.startOffset > textarea.value.length - 40)?.range;
    textarea.setRangeText('9', textarea.value.indexOf('0'), textarea.value.indexOf('0') + 1);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '9' }));
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('json', textarea.value));
    expect(opaqueRanges().some(entry => entry.range === tail)).toBe(true);
  });

  it('updates opted-in bracket levels across native edits', async () => {
    element.language = 'typescript';
    textarea.value = 'const value = ({ item: [1] });';
    await elementIsStable(element);
    const brackets = () =>
      opaqueRanges()
        .filter(({ name }) => name.startsWith('nve-code-bracket-'))
        .map(({ name, range }) => [name, textarea.value.slice(range.startOffset, range.endOffset)]);
    expect(element.bracketPairColoring).toBeNull();
    expect(brackets()).toEqual([]);

    element.setAttribute('bracket-pair-coloring', '');
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBe('shared');
    expect(brackets()).toHaveLength(6);
    const start = textarea.value.indexOf('[1]');
    textarea.setRangeText('[(2)]', start, start + 3);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(brackets()).toHaveLength(8);
    expect(brackets()).toContainEqual(['nve-code-bracket-1', '(']);
    element.setAttribute('bracket-pair-coloring', 'independent');
    await elementIsStable(element);
    expect(brackets().filter(([name]) => name === 'nve-code-bracket-1')).toHaveLength(6);
    expect(brackets().filter(([name]) => name === 'nve-code-bracket-2')).toHaveLength(2);
    element.removeAttribute('bracket-pair-coloring');
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBeNull();
    expect(brackets()).toEqual([]);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('propagates edits through Markdown fences and embedded language state', async () => {
    element.language = 'markdown';
    textarea.value = '# Title\n\n```typescript\nconst value = "text";\n```\n\nAfter\n';
    await elementIsStable(element);
    const start = textarea.value.indexOf('```');
    textarea.setRangeText('``', start, start + 3);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('markdown', textarea.value));
  });

  it('rebuilds after batched edits that return to the original value', async () => {
    const original = textarea.value;
    textarea.setRangeText('changed', 2, 7);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    textarea.setRangeText(original.slice(2, 7), 2, 9);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(textarea.value).toBe(original);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', original));
  });

  it('updates native default content without overwriting a dirty value', async () => {
    textarea.defaultValue = 'const defaultValue = true;';
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    textarea.value = 'const dirtyValue = 42;';
    textarea.defaultValue = 'const resetValue = false;';
    await elementIsStable(element);
    expect(textarea.value).toBe('const dirtyValue = 42;');
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('reclassifies the same value when the language changes', async () => {
    textarea.value = 'const node = <Widget prop="value" />;';
    element.language = 'tsx';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('tsx', textarea.value));
    element.language = 'typescript';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('preserves native undo and redo while updating syntax ranges', async () => {
    textarea.value = 'const initial = 1;';
    await elementIsStable(element);
    const original = textarea.value;
    const edited = 'const greeting = "日本語😀";';
    textarea.focus();
    textarea.select();
    await cdp().send('Input.insertText', { text: edited });
    await elementIsStable(element);
    expect(textarea.value).toBe(edited);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', edited));
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'z', code: 'KeyZ', commands: ['undo'] });
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'z', code: 'KeyZ' });
    await elementIsStable(element);
    expect(textarea.value).toBe(original);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', original));
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'z', code: 'KeyZ', commands: ['redo'] });
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'z', code: 'KeyZ' });
    await elementIsStable(element);
    expect(textarea.value).toBe(edited);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', edited));
  });

  it('highlights native clipboard paste without changing the selection', async () => {
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    const original = textarea.value;
    const pasted = '// pasted 日本語😀\nconst pasted = true;';
    await navigator.clipboard.writeText(pasted);
    const modifier = navigator.platform.includes('Mac') ? 'Meta' : 'Control';
    await userEvent.keyboard(`{${modifier}>}v{/${modifier}}`);
    await elementIsStable(element);
    expect(textarea.value).toBe(original + pasted);
    expect(textarea.selectionStart).toBe(textarea.value.length);
    expect(textarea.selectionEnd).toBe(textarea.value.length);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('finishes native IME composition without changing the selection', async () => {
    textarea.focus();
    textarea.select();
    const composing = 'const name = "日本";';
    await cdp().send('Input.imeSetComposition', {
      text: composing,
      selectionStart: composing.length,
      selectionEnd: composing.length
    });
    const committed = 'const name = "日本語";';
    await cdp().send('Input.insertText', { text: committed });
    await elementIsStable(element);
    expect(textarea.value).toBe(committed);
    expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([committed.length, committed.length]);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', committed));
  });

  it('preserves scroll position and backward selection across refresh and language changes', async () => {
    textarea.value = Array.from({ length: 120 }, (_, index) => `const n${index} = ${index};`).join('\n');
    await elementIsStable(element);
    textarea.scrollTop = 300;
    textarea.setSelectionRange(10, 15, 'backward');
    const scroll = textarea.scrollTop;
    expect(scroll).toBeGreaterThan(0);
    element.refreshHighlighting();
    element.language = 'tsx';
    await elementIsStable(element);
    expect(textarea.scrollTop).toBe(scroll);
    expect([textarea.selectionStart, textarea.selectionEnd, textarea.selectionDirection]).toEqual([10, 15, 'backward']);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('tsx', textarea.value));
  });

  it.each([500, 1_000])('keeps only nearby native ranges when %i JSON records scroll', async count => {
    const source =
      '[\n' +
      Array.from({ length: count }, (_, index) => `{"id":${index},"name":"first-${index}","enabled":true}`).join(
        ',\n'
      ) +
      '\n]';
    element.language = 'json';
    textarea.value = source;
    await elementIsStable(element);
    expect(opaqueRanges().length).toBeLessThan(2_000);
    expect(opaqueRanges().some(({ range }) => range.startOffset < 100)).toBe(true);
    expect(opaqueRanges().some(({ range }) => range.startOffset > source.length - 100)).toBe(false);
    const firstRange = opaqueRanges()[0]?.range;

    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(opaqueRanges().length).toBeLessThan(2_000);
    expect(opaqueRanges().some(({ range }) => range.startOffset < 100)).toBe(false);
    expect(opaqueRanges().some(({ range }) => range.startOffset > source.length - 100)).toBe(true);
    expect([firstRange?.startOffset, firstRange?.endOffset]).toEqual([0, 0]);
  });

  it('keeps full-value highlighting under a flip and suspends windowing until the layout supports it', async () => {
    fixture.style.transform = 'scaleY(-1)';
    textarea.value = 'const value = 42;';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));

    const source = 'const value = 42;\n'.repeat(2_000) + 'const last = 12345;';
    const start = source.indexOf('12345');
    textarea.value = source;
    await elementIsStable(element);
    expect(opaqueRanges()).toHaveLength(0);

    fixture.style.transform = 'translate(12px, 20px)';
    textarea.scrollTop = textarea.scrollHeight;
    await expect.poll(() => actualSpans()).toContainEqual([start, start + 5, 'number']);
    expect(opaqueRanges().some(({ range }) => range.startOffset < 100)).toBe(false);
  });

  it('colors syntax and bracket pairs in a small rotated textarea', async () => {
    textarea.style.transform = 'rotate(30deg)';
    element.bracketPairColoring = 'shared';
    textarea.value = 'const values = [42];';
    await elementIsStable(element);

    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    expect(opaqueRanges().filter(({ name }) => name.startsWith('nve-code-bracket-'))).toHaveLength(2);
  });

  it('clips wide JSON rows independently as two textareas scroll horizontally', async () => {
    const row = '{"value":0},'.repeat(1_100);
    const source = `[\n${row}{"value":11111},\n${row}{"value":22222},\n${row}{"value":33333}\n]`;
    element.language = 'json';
    element.bracketPairColoring = 'shared';
    textarea.wrap = 'off';
    textarea.style.width = '260px';
    textarea.value = source;
    await elementIsStable(element);

    const end = source.indexOf('22222');
    const hasRange = (name: string, offset: number) =>
      opaqueRanges().some(({ name: category, range }) => category === name && range.startOffset === offset);
    expect(hasRange('nve-code-number', end)).toBe(false);

    const firstRanges = new Set(opaqueRanges().map(({ range }) => range));
    const other = new CodeTextarea();
    other.language = 'json';
    const otherTextarea = textarea.cloneNode() as HTMLTextAreaElement;
    otherTextarea.value = source;
    other.append(otherTextarea);
    fixture.append(other);
    await elementIsStable(other);
    const otherRanges = opaqueRanges().filter(({ range }) => !firstRanges.has(range));
    expect(otherRanges.length).toBeGreaterThan(0);

    textarea.scrollLeft = textarea.scrollWidth;
    await expect.poll(() => hasRange('nve-code-number', end)).toBe(true);
    expect(hasRange('nve-code-number', source.indexOf('11111'))).toBe(true);
    expect(hasRange('nve-code-bracket-2', end + 5)).toBe(true);
    const active = new Set(opaqueRanges().map(({ range }) => range));
    expect(otherRanges.every(({ range }) => active.has(range))).toBe(true);

    otherTextarea.scrollLeft = otherTextarea.scrollWidth;
    await expect.poll(() => opaqueRanges().filter(({ range }) => range.startOffset === end)).toHaveLength(2);
    expect(hasRange('nve-code-bracket-2', end + 5)).toBe(true);
  });

  it('preserves a multiline comment across horizontal scroll and wrapping changes', async () => {
    const source = `/*\n${'x'.repeat(18_000)}\n${'y'.repeat(18_000)}\n*/`;
    textarea.wrap = 'off';
    textarea.style.width = '260px';
    textarea.value = source;
    await elementIsStable(element);

    const first = source.indexOf('x') + 4;
    const end = source.lastIndexOf('y') - 4;
    const highlightsOffset = (offset: number) =>
      opaqueRanges().some(
        ({ name, range }) => name === 'nve-code-comment' && range.startOffset <= offset && offset < range.endOffset
      );
    expect(highlightsOffset(first)).toBe(true);
    expect(highlightsOffset(end)).toBe(false);

    textarea.scrollLeft = textarea.scrollWidth;
    await expect.poll(() => highlightsOffset(end)).toBe(true);
    expect(highlightsOffset(first)).toBe(false);

    textarea.wrap = 'soft';
    textarea.scrollTop = 0;
    await expect.poll(() => highlightsOffset(first)).toBe(true);
    expect(highlightsOffset(end)).toBe(false);
  });

  it('keeps the whole value plain when an offscreen wide row cannot be clipped', async () => {
    const rows = '{"value":0},\n'.repeat(500);
    const wideRow = '{"ערך":0},'.repeat(3_000);
    const source = `[\n${rows}${wideRow}{"value":12345}\n]`;
    element.language = 'json';
    element.bracketPairColoring = 'shared';
    textarea.wrap = 'off';
    textarea.style.width = '260px';
    textarea.value = source;
    await elementIsStable(element);
    expect(opaqueRanges()).toHaveLength(0);

    textarea.scrollTop = textarea.scrollHeight;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(opaqueRanges()).toHaveLength(0);

    const start = source.indexOf('12345');
    textarea.wrap = 'soft';
    textarea.scrollTop = 0;
    await expect.poll(() => opaqueRanges().some(({ range }) => range.startOffset < 100)).toBe(true);
    expect(actualSpans()).not.toContainEqual([start, start + 5, 'number']);
  });

  it('restores highlighting when resizing brings the window within the range limit', async () => {
    textarea.style.height = '30000px';
    textarea.value = 'const item = "placeholder";\n'.repeat(2_000);
    await elementIsStable(element);
    expect(opaqueRanges()).toHaveLength(0);

    textarea.style.height = '120px';
    await expect.poll(() => opaqueRanges().length).toBeGreaterThan(0);
    expect(opaqueRanges().length).toBeLessThan(4_096);
  });

  it('keeps highlighting on scroll after an input event leaves the value unchanged', async () => {
    const body = 'const item = "placeholder";\n'.repeat(1_500);
    const source = body + 'const finalValue = 12345;';
    const numberStart = source.indexOf('12345');
    textarea.value = source;
    await elementIsStable(element);
    expect(actualSpans()).not.toContainEqual([numberStart, numberStart + 5, 'number']);

    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    expect(actualSpans()).toContainEqual([numberStart, numberStart + 5, 'number']);
  });

  it('removes and restores embedded syntax at the bottom after a distant Markdown fence edit', async () => {
    const body = 'const item = "sample";\n'.repeat(1_500);
    const source = '# Heading\n\n~~~typescript\n' + body + 'const finalValue = 12345;\n~~~';
    const fenceLanguage = source.indexOf('typescript');
    const hasFinalNumber = () => {
      const start = textarea.value.indexOf('12345');
      return actualSpans().some(([from, to, category]) => from === start && to === start + 5 && category === 'number');
    };
    element.language = 'markdown';
    textarea.value = source;
    await elementIsStable(element);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(hasFinalNumber()).toBe(true);

    textarea.setRangeText('text', fenceLanguage, fenceLanguage + 'typescript'.length);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);

    expect(hasFinalNumber()).toBe(false);

    textarea.setRangeText('typescript', fenceLanguage, fenceLanguage + 'text'.length);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);

    expect(hasFinalNumber()).toBe(true);
  });

  it('handles a queued scroll when composition shortens a long value', async () => {
    textarea.value = 'const item = "placeholder";\n'.repeat(1_500);
    await elementIsStable(element);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('scroll'));

    textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    textarea.setRangeText('const value = 42;', 0, textarea.value.length);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await elementIsStable(element);

    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('clips highlights within a long wrapped line', async () => {
    const value = 'x'.repeat(4_000);
    const source =
      `[\n{"description":"${value}"},\n` +
      Array.from({ length: 1_000 }, (_, index) => `{"id":${index},"enabled":true}`).join(',\n') +
      '\n]';
    element.language = 'json';
    textarea.style.width = '120px';
    textarea.value = source;
    await elementIsStable(element);
    textarea.scrollTop = 900;
    textarea.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const start = source.indexOf(value);
    const end = start + value.length;
    expect(
      opaqueRanges().some(
        ({ name, range }) => name === 'nve-code-string' && range.startOffset > start && range.endOffset < end
      )
    ).toBe(true);
  });

  it('restores the visible range window after an initially hidden textarea appears', async () => {
    fixture.style.display = 'none';
    element.language = 'json';
    textarea.value =
      '[\n' + Array.from({ length: 1_000 }, (_, index) => `{"id":${index},"enabled":true}`).join(',\n') + '\n]';
    await elementIsStable(element);
    expect(opaqueRanges()).toEqual([]);

    fixture.style.display = '';
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(opaqueRanges().length).toBeGreaterThan(0);
    expect(opaqueRanges().length).toBeLessThan(2_000);
  });

  it('restores highlights after clicking a native reset button', async () => {
    const form = textarea.form;
    expect(form).not.toBeNull();

    const reset = document.createElement('button');
    reset.type = 'reset';
    reset.textContent = 'Reset';
    form!.append(reset);
    textarea.value = 'const other = false;';
    await elementIsStable(element);

    await userEvent.click(reset);

    expect(textarea.value).toBe(textarea.defaultValue);
    await expect.poll(actualSpans).toEqual(getExpectedSyntaxRanges('typescript', textarea.defaultValue));
  });

  it('handles native form reset and the inherited control reset', async () => {
    textarea.value = 'const other = false;';
    await elementIsStable(element);
    textarea.form?.reset();
    expect(textarea.value).toBe(textarea.defaultValue);
    await expect.poll(actualSpans).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    textarea.value = '0';
    element.reset();
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('handles reassociation with an external form before reset', async () => {
    const external = document.createElement('form');
    external.id = 'external-source-form';
    fixture.append(external);
    textarea.setAttribute('form', external.id);
    textarea.value = 'const other = false;';
    await elementIsStable(element);
    external.id = 'renamed-source-form';
    textarea.setAttribute('form', external.id);
    external.reset();
    expect(textarea.value).toBe(textarea.defaultValue);
    await expect.poll(actualSpans).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('supports an explicit refresh after setRangeText without an input event', async () => {
    textarea.setRangeText('false', 25, 27);
    element.refreshHighlighting();
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
  });

  it('releases owned ranges and restores the value setter on disconnect', async () => {
    element.bracketPairColoring = 'shared';
    textarea.value = 'const answer = [42];';
    await elementIsStable(element);
    expect(opaqueRanges().some(({ name }) => name === 'nve-code-bracket-1')).toBe(true);
    const previous = opaqueRanges().map(entry => entry.range);
    element.remove();
    expect(opaqueRanges()).toHaveLength(0);
    expect(previous.every(range => range.startOffset === 0 && range.endOffset === 0)).toBe(true);
    expect(Object.hasOwn(textarea, 'value')).toBe(false);
    fixture.append(element);
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    expect(opaqueRanges().some(({ name }) => name === 'nve-code-bracket-1')).toBe(true);
  });

  it("preserves another textarea's highlights when one disconnects", async () => {
    const other = document.createElement('nve-code-textarea');
    other.language = 'typescript';
    other.innerHTML = '<label>Other</label><textarea>const other = 1;</textarea>';
    fixture.append(other);
    await elementIsStable(other);
    const otherCount = getExpectedSyntaxRanges('typescript', 'const other = 1;').length;
    element.remove();
    expect(opaqueRanges()).toHaveLength(otherCount);
  });

  it('shares semantic groups with codeblocks without removing their ranges', async () => {
    const block = document.createElement('nve-code-block');
    block.language = 'typescript';
    block.code = 'const companion = 42;';
    fixture.append(block);
    await elementIsStable(block);
    const textRanges = () =>
      Array.from(CSS.highlights).flatMap(([, group]) =>
        Array.from(group).filter(
          range => 'startContainer' in range && range.startContainer?.parentElement?.tagName === 'CODE'
        )
      );
    const previous = textRanges();
    expect(previous.length).toBeGreaterThan(0);
    element.remove();
    expect(textRanges()).toEqual(previous);
    expect(opaqueRanges()).toHaveLength(0);
  });

  it('binds native values and highlighting inside a consumer shadow root', async () => {
    element.remove();
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.append(element);
    fixture.append(host);
    await elementIsStable(element);
    expect(
      root.adoptedStyleSheets.some(sheet =>
        Array.from(sheet.cssRules).some(rule => rule.cssText.includes('::highlight(nve-code-keyword)'))
      )
    ).toBe(true);
    textarea.value = 'const shadowValue = true;';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));
    host.remove();
    expect(opaqueRanges()).toHaveLength(0);
  });

  it('highlights a forwarded textarea through editing, form reset, and replacement', async () => {
    const form = textarea.form!;
    const wrapper = document.createElement('div');
    const root = wrapper.attachShadow({ mode: 'open' });
    const slot = document.createElement('slot');
    const reset = document.createElement('button');
    reset.type = 'reset';
    reset.textContent = 'Reset';
    wrapper.append(textarea);
    element.replaceChildren(slot);
    root.append(element);
    form.append(wrapper, reset);
    await elementIsStable(element);

    const originalValue = textarea.value;
    expect(element.input).toBe(textarea);
    expect(textarea.form).toBe(form);
    textarea.style.setProperty('--nve-ref-color-purple-violet-1100', 'red');
    textarea.style.setProperty('--nve-ref-color-blue-cobalt-1100', 'red');
    expect(getComputedStyle(textarea, '::highlight(nve-code-keyword)').color).toBe('rgb(255, 0, 0)');

    textarea.focus();
    textarea.select();
    await cdp().send('Input.insertText', { text: 'let edited = true;' });
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', textarea.value));

    await userEvent.click(reset);
    expect(textarea.value).toBe(originalValue);
    await expect.poll(actualSpans).toEqual(getExpectedSyntaxRanges('typescript', originalValue));

    const replacement = document.createElement('textarea');
    replacement.value = 'const replacement = 1;';
    textarea.replaceWith(replacement);
    await elementIsStable(element);
    expect(element.input).toBe(replacement);
    expect(Object.hasOwn(textarea, 'value')).toBe(false);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', replacement.value));

    wrapper.remove();
    expect(opaqueRanges()).toHaveLength(0);
  });

  it.each<[CodeTextarea['language'], string]>([
    ['html', '<script>const x = "value";</script>\n<style>a { color: red; }</style>\n'],
    ['markdown', '> quoted\n> continuation\n\n~~~python\nprint("value")\n~~~\n'],
    ['python', 'text = """first\nsecond\nthird"""\nprint(text)\n'],
    ['tsx', 'const x = <Widget value="text" />;\n']
  ])('matches complete scanning after edits in %s', async (language, source) => {
    element.language = language;
    textarea.value = source.repeat(20);
    await elementIsStable(element);
    const edit = source.length * 10 + Math.floor(source.length / 2);
    textarea.setRangeText('x\n', edit, edit + 1);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges(language, textarea.value));
  });

  it('binds a replacement textarea and restores the detached control', async () => {
    const replacement = document.createElement('textarea');
    replacement.name = 'source';
    replacement.value = 'const replacement = true;';
    textarea.replaceWith(replacement);
    await elementIsStable(element);
    expect(element.input).toBe(replacement);
    expect(Object.hasOwn(textarea, 'value')).toBe(false);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', replacement.value));
    expect(fixture.querySelector('label')?.htmlFor).toBe(replacement.id);
    replacement.value = 'const changed = 2;';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getExpectedSyntaxRanges('typescript', replacement.value));
  });

  it('restores highlighting when the same textarea is removed and reinserted', async () => {
    const value = textarea.value;
    const spans = actualSpans();
    expect(spans.length).toBeGreaterThan(0);

    textarea.remove();
    element.append(textarea);
    await elementIsStable(element);

    expect(textarea.value).toBe(value);
    expect(actualSpans()).toEqual(spans);
  });

  it('keeps editing and forms usable when opaque ranges are unavailable', async () => {
    const form = textarea.form;
    if (!form) throw new Error('Missing form fixture');
    element.remove();
    Object.defineProperty(textarea, 'createValueRange', { configurable: true, value: undefined });
    form.append(element);
    await elementIsStable(element);

    textarea.focus();
    textarea.select();
    await cdp().send('Input.insertText', { text: 'plain text' });
    await elementIsStable(element);
    expect(opaqueRanges()).toHaveLength(0);
    expect(textarea.value).toBe('plain text');
    expect(element.input).toBe(textarea);
    expect(new FormData(form).get('source')).toBe('plain text');
  });
});
