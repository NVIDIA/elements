// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/languages/bash.js';
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/go.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/python';
import '@nvidia-elements/code/codeblock/languages/toml.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import '@nvidia-elements/code/codeblock/languages/yaml.js';
import '@nvidia-elements/code/codeblock/define.js';

describe('nve-codeblock', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;

  function highlighted(category: string) {
    const code = element.shadowRoot?.querySelector('code');
    const result: string[] = [];
    for (const range of CSS.highlights.get(`nve-code-${category}`) ?? []) {
      if (code?.contains(range.startContainer)) {
        result.push(range.startContainer.textContent?.slice(range.startOffset, range.endOffset) ?? '');
      }
    }
    return result;
  }
  const typescript = `
/**
 * Function to get current time.
 * @return {number} time in milis
 */
function getTime(): number {
  return new Date().getTime();
}`;
  const slot = `<nve-icon-button slot="actions" container="flat" icon-name="copy"></nve-icon-button>`;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-codeblock></nve-codeblock>
    `);
    element = fixture.querySelector(CodeBlock.metadata.tag) as CodeBlock;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    await elementIsStable(element);
    expect(customElements.get(CodeBlock.metadata.tag)).toBeDefined();
  });

  it('should default to shell language', async () => {
    await elementIsStable(element);
    expect(element.language).toBe('shell');
  });

  it('should have language defined', async () => {
    element.language = 'typescript';
    await elementIsStable(element);
    expect(element.language).toBe('typescript');
  });

  it('should render source code if slotted', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    await elementIsStable(element);
    expect(highlighted('function')).toContain('getTime');
  });

  it('should render source code if set via the code property', async () => {
    element.language = 'typescript';
    element.code = typescript;
    await elementIsStable(element);
    expect(highlighted('function')).toContain('getTime');
  });

  it('should render HTML source code if slotted within a <template> tag', async () => {
    element.language = 'typescript';
    element.innerHTML = `<template>
   ${typescript}
    </template>`;
    await elementIsStable(element);
    expect(highlighted('function')).toContain('getTime');
  });

  it('should render source code if slotted within a <pre><code> block', async () => {
    element.language = 'typescript';
    element.innerHTML = '<pre><code>const answer = 42;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.hljs > code')!.textContent).toBe('const answer = 42;');
    expect(highlighted('keyword')).toContain('const');
  });

  it('should decode escaped HTML source from a slotted <pre><code> block', async () => {
    element.language = 'html';
    element.innerHTML = '<pre><code>&lt;nve-button&gt;Save&lt;/nve-button&gt;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.hljs > code')!.textContent).toBe('<nve-button>Save</nve-button>');
    expect(highlighted('tag')).toContain('nve-button');
  });

  it('should render HTML source code if slotted HTML content', async () => {
    element.language = 'typescript';
    const div = document.createElement('div');
    div.textContent = 'hello';
    element.append(div);
    element.shadowRoot!.querySelector('slot')!.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('slot')!.assignedNodes()[0]).toBe(div);
  });

  it('should not render any line numbers by default', async () => {
    await elementIsStable(element);
    expect(element.lineNumbers).toBeFalsy();
    expect(element.shadowRoot!.querySelector('.line-number')).toBeFalsy();
  });

  it('should render line-numbers', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.lineNumbers = true;
    await elementIsStable(element);
    expect(element.lineNumbers).toBeTruthy();
    expect(element.shadowRoot!.querySelector('.line-number')).toBeTruthy();
  });

  it('should not render any highlights by default', async () => {
    await elementIsStable(element);
    expect(element.highlight).toBeFalsy();
    expect(element.shadowRoot!.querySelector('.selected-line')).toBeFalsy();
  });

  it('should highlight single line', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3';
    await elementIsStable(element);
    expect(element.highlight).toBe('3');
    expect(element.shadowRoot!.querySelector('.selected-line')).toBeTruthy();
  });

  it('should highlight a line group', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3-6';
    await elementIsStable(element);
    expect(element.highlight).toBe('3-6');
    expect(element.shadowRoot!.querySelectorAll('.selected-line').length).toBe(4);
  });

  it('should highlight a multiple line groups', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '1,3-5,7';
    await elementIsStable(element);
    expect(element.highlight).toBe('1,3-5,7');
    expect(element.shadowRoot!.querySelectorAll('.selected-line').length).toBe(5);
  });

  it('should provide actions slot', async () => {
    expect(element.shadowRoot!.querySelector('slot[name="actions"]')).toBeTruthy();
  });

  it('should render actions slot', async () => {
    element.language = 'typescript';
    element.innerHTML = `${typescript}\n${slot}`;
    await elementIsStable(element);
    expect(element.innerHTML.includes(slot)).toBeTruthy();
    expect(highlighted('function')).toContain('getTime');
    expect(element.shadowRoot!.querySelector('nve-icon-button')).toBeFalsy();
  });

  it('should highlight bash source once the bash language is registered', async () => {
    element.language = 'bash';
    element.code = 'echo "hello" # greet';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('bash');
    expect(highlighted('string')).toContain('"hello"');
  });

  it('should highlight toml source once the toml language is registered', async () => {
    element.language = 'toml';
    element.code = 'name = "elements" # package';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('toml');
    expect(highlighted('string')).toContain('"elements"');
  });

  it('should not assign a language classname if no language was set or provided', async () => {
    element.language = 'typescript';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('typescript');

    element.setAttribute('language', 'typescript');
    element.removeAttribute('language');
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('');
  });

  it('should not run highlight logic if no source was provided', async () => {
    element.language = 'typescript';
    element.code = '';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('');
    expect(highlighted('keyword')).toEqual([]);
  });

  it('should preserve normalized code without token elements and clear empty updates', async () => {
    element.language = 'json';
    element.code = '\n  {"value": 42, "enabled": true}\n';
    await elementIsStable(element);
    const code = element.shadowRoot!.querySelector('code')!;
    expect(code.textContent).toBe('{"value": 42, "enabled": true}');
    expect(code.childElementCount).toBe(0);
    expect(highlighted('number')).toContain('42');
    element.code = '';
    await elementIsStable(element);
    expect(code.textContent).toBe('');
    expect(highlighted('number')).toEqual([]);
  });

  it('should update language and decorations without rewriting the source text node', async () => {
    element.language = 'javascript';
    element.code = 'const value = 42;\n// tail';
    await elementIsStable(element);
    const code = element.shadowRoot!.querySelector('code')!;
    const text = [...code.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    expect(highlighted('keyword')).toContain('const');
    element.setAttribute('language', 'json');
    element.setAttribute('line-numbers', '');
    element.setAttribute('highlight', '2');
    await elementIsStable(element);
    expect([...code.childNodes].find(node => node.nodeType === Node.TEXT_NODE)).toBe(text);
    expect(highlighted('keyword')).toEqual([]);
    expect(highlighted('number')).toContain('42');
    expect(code.querySelector('[data-lines]')).toBeNull();
    expect(element.shadowRoot!.querySelector('.selected-line')?.getAttribute('data-line')).toBe('2');
    element.removeAttribute('line-numbers');
    element.removeAttribute('highlight');
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('[data-lines]')).toBeNull();
  });

  it('should dispose only its own ranges and highlight edited text after reconnecting', async () => {
    element.language = 'json';
    element.code = '{"value": 42}';
    const other = document.createElement('nve-codeblock');
    other.language = 'json';
    other.code = '{"value": 43}';
    fixture.append(other);
    await elementIsStable(element);
    await elementIsStable(other);
    const otherCode = other.shadowRoot!.querySelector('code')!;
    const owned = () =>
      [...(CSS.highlights.get('nve-code-number') ?? [])].filter(range => otherCode.contains(range.startContainer));
    const ranges = owned();
    expect(ranges).toHaveLength(1);
    element.remove();
    expect(highlighted('number')).toEqual([]);
    expect(owned()).toEqual(ranges);
    element.code = '{"value": 44}';
    await element.updateComplete;
    expect(highlighted('number')).toEqual([]);
    fixture.append(element);
    await elementIsStable(element);
    expect(highlighted('number')).toContain('44');
    expect(owned()).toEqual(ranges);
  });

  it('should restore slotted source after removing a property override', async () => {
    element.language = 'javascript';
    element.innerHTML = '<pre><code>const slot = 42;</code></pre>';
    element.code = 'const property = 43;';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('const property = 43;');
    element.code = undefined;
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('const slot = 42;');
    expect(highlighted('number')).toContain('42');
  });

  it('should extract source from a pre element without a code child', async () => {
    element.language = 'javascript';
    element.innerHTML = '<pre>const value = 42;</pre>';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('const value = 42;');
    expect(highlighted('number')).toContain('42');
  });

  it('should leave readable plain text when native highlights are unavailable', async () => {
    vi.stubGlobal('Highlight', undefined);
    try {
      element.language = 'json';
      element.code = '{"value": 42}';
      await elementIsStable(element);
      const code = element.shadowRoot!.querySelector('code')!;
      expect(code.textContent).toBe(element.code);
      expect(code.childElementCount).toBe(0);
      expect(highlighted('number')).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('should refresh wrapped decorations on resize and font events while preserving syntax ranges', async () => {
    const frame = () =>
      new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    element.style.cssText =
      'width:240px; font-size:14px; line-height:20px; --white-space:pre-wrap; --font-family:monospace';
    element.language = 'javascript';
    element.code = 'const text = "one two three four five six seven eight nine ten eleven twelve thirteen";\n// tail';
    element.lineNumbers = true;
    element.highlight = '1';
    await elementIsStable(element);
    await frame();
    const code = element.shadowRoot!.querySelector('code')!;
    const range = [...(CSS.highlights.get('nve-code-keyword') ?? [])].find(item => code.contains(item.startContainer));
    const firstHeight = element.shadowRoot!.querySelector('[data-line="1"]')!.getBoundingClientRect().height;
    element.style.width = '480px';
    document.fonts.dispatchEvent(new Event('loadingdone'));
    document.fonts.dispatchEvent(new Event('loadingdone'));
    await frame();
    const nextHeight = element.shadowRoot!.querySelector('[data-line="1"]')!.getBoundingClientRect().height;
    expect(nextHeight).toBeLessThan(firstHeight);
    expect(CSS.highlights.get('nve-code-keyword')?.has(range!)).toBe(true);
    expect(code.textContent).toBe(element.code);
    // Removing a component also cancels a queued font refresh.
    document.fonts.dispatchEvent(new Event('loadingdone'));
    element.remove();
    await frame();
    expect(highlighted('keyword')).toEqual([]);
  });
});
