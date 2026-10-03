// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { cdp, userEvent } from 'vitest/browser';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CodeTextarea } from '@nvidia-elements/code/code-textarea';
import { getScanner } from '../internal/highlight/language-registry.mjs';
import { categories } from '../internal/highlight/categories.mjs';
import '@nvidia-elements/code/code-textarea/define.js';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/tsx.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';

function opaqueRanges() {
  return Array.from(CSS.highlights).flatMap(([name, highlight]) =>
    Array.from(highlight)
      .filter(range => 'disconnect' in range)
      .map(range => ({ name, range }))
  );
}

function actualSpans() {
  return opaqueRanges()
    .map(({ name, range }) => [range.startOffset, range.endOffset, categories.indexOf(name.slice(9))])
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

  it('defines the component and preserves the native value and form control', () => {
    expect('createValueRange' in textarea, navigator.userAgent).toBe(true);
    expect(customElements.get(CodeTextarea.metadata.tag)).toBeDefined();
    expect(element.input).toBe(textarea);
    expect(textarea.value).toBe('  const answer: number = 42;\n');
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
    expect(new FormData(textarea.form ?? undefined).get('source')).toBe(textarea.value);
    expect(element.shadowRoot?.querySelector('textarea, code, pre')).toBeNull();
  });

  it('refreshes after direct value assignments without requiring input events', async () => {
    textarea.value = 'const greeting = "hello";';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it('rebuilds live ranges even when an assignment leaves the value equal', async () => {
    const previous = opaqueRanges().map(entry => entry.range);
    textarea.value = textarea.value;
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
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
    expect(actualSpans()).toEqual(getScanner('json')(textarea.value));
    expect(opaqueRanges().some(entry => entry.range === tail)).toBe(true);
  });

  it('propagates edits through Markdown fences and embedded language state', async () => {
    element.language = 'markdown';
    textarea.value = '# Title\n\n```typescript\nconst value = "text";\n```\n\nAfter\n';
    await elementIsStable(element);
    const start = textarea.value.indexOf('```');
    textarea.setRangeText('``', start, start + 3);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('markdown')(textarea.value));
  });

  it('rebuilds after batched edits that return to the original value', async () => {
    const original = textarea.value;
    textarea.setRangeText('changed', 2, 7);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    textarea.setRangeText(original.slice(2, 7), 2, 9);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await elementIsStable(element);
    expect(textarea.value).toBe(original);
    expect(actualSpans()).toEqual(getScanner('typescript')(original));
  });

  it('updates native default content without overwriting a dirty value', async () => {
    textarea.defaultValue = 'const defaultValue = true;';
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
    textarea.value = 'const dirtyValue = 42;';
    textarea.defaultValue = 'const resetValue = false;';
    await elementIsStable(element);
    expect(textarea.value).toBe('const dirtyValue = 42;');
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it('reclassifies the same value when the language changes', async () => {
    textarea.value = 'const node = <Widget prop="value" />;';
    element.language = 'tsx';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('tsx')(textarea.value));
    element.language = 'typescript';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
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
    expect(actualSpans()).toEqual(getScanner('typescript')(edited));
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'z', code: 'KeyZ', commands: ['undo'] });
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'z', code: 'KeyZ' });
    await elementIsStable(element);
    expect(textarea.value).toBe(original);
    expect(actualSpans()).toEqual(getScanner('typescript')(original));
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'z', code: 'KeyZ', commands: ['redo'] });
    await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'z', code: 'KeyZ' });
    await elementIsStable(element);
    expect(textarea.value).toBe(edited);
    expect(actualSpans()).toEqual(getScanner('typescript')(edited));
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
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it('finishes native IME composition without changing the selection', async () => {
    const events: string[] = [];
    for (const type of ['compositionstart', 'compositionend'])
      textarea.addEventListener(type, event => events.push(event.type));
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
    expect(events).toEqual(['compositionstart', 'compositionend']);
    expect(textarea.value).toBe(committed);
    expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([committed.length, committed.length]);
    expect(actualSpans()).toEqual(getScanner('typescript')(committed));
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
    expect(actualSpans()).toEqual(getScanner('tsx')(textarea.value));
  });

  it('handles native form reset and the inherited control reset', async () => {
    textarea.value = 'const other = false;';
    await elementIsStable(element);
    textarea.form?.reset();
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
    textarea.value = '0';
    element.reset();
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
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
    await elementIsStable(element);
    expect(textarea.value).toBe(textarea.defaultValue);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it('supports an explicit refresh after setRangeText without an input event', async () => {
    textarea.setRangeText('false', 25, 27);
    element.refreshHighlighting();
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it('releases owned ranges and restores the value setter on disconnect', async () => {
    const previous = opaqueRanges().map(entry => entry.range);
    element.remove();
    expect(opaqueRanges()).toHaveLength(0);
    expect(previous.every(range => range.startOffset === 0 && range.endOffset === 0)).toBe(true);
    expect(Object.hasOwn(textarea, 'value')).toBe(false);
    fixture.append(element);
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
  });

  it("preserves another textarea's highlights when one disconnects", async () => {
    const other = document.createElement('nve-code-textarea');
    other.language = 'typescript';
    other.innerHTML = '<label>Other</label><textarea>const other = 1;</textarea>';
    fixture.append(other);
    await elementIsStable(other);
    const otherCount = getScanner('typescript')('const other = 1;').length;
    element.remove();
    expect(opaqueRanges()).toHaveLength(otherCount);
  });

  it('shares semantic groups with codeblocks without removing their ranges', async () => {
    const block = document.createElement('nve-codeblock');
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
    expect(actualSpans()).toEqual(getScanner('typescript')(textarea.value));
    host.remove();
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
    expect(actualSpans()).toEqual(getScanner(language)(textarea.value));
  });

  it('binds a replacement textarea and restores the detached control', async () => {
    const replacement = document.createElement('textarea');
    replacement.name = 'source';
    replacement.value = 'const replacement = true;';
    textarea.replaceWith(replacement);
    await elementIsStable(element);
    expect(element.input).toBe(replacement);
    expect(Object.hasOwn(textarea, 'value')).toBe(false);
    expect(actualSpans()).toEqual(getScanner('typescript')(replacement.value));
    expect(fixture.querySelector('label')?.htmlFor).toBe(replacement.id);
    replacement.value = 'const changed = 2;';
    await elementIsStable(element);
    expect(actualSpans()).toEqual(getScanner('typescript')(replacement.value));
  });

  it('keeps editing and forms usable when opaque ranges are unavailable', async () => {
    element.remove();
    Object.defineProperty(textarea, 'createValueRange', { configurable: true, value: undefined });
    fixture.append(element);
    await elementIsStable(element);
    textarea.focus();
    textarea.select();
    await cdp().send('Input.insertText', { text: 'plain text' });
    await elementIsStable(element);
    expect(opaqueRanges()).toHaveLength(0);
    expect(textarea.value).toBe('plain text');
    expect(element.input).toBe(textarea);
  });
});
