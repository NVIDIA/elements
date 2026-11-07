// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import { CodeBlock as CompatibilityCodeBlock } from '@nvidia-elements/code/codeblock';
import { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/languages/bash.js';
import '@nvidia-elements/code/code-block/languages/css.js';
import '@nvidia-elements/code/code-block/languages/go.js';
import '@nvidia-elements/code/code-block/languages/html.js';
import '@nvidia-elements/code/code-block/languages/javascript';
import '@nvidia-elements/code/code-block/languages/json.js';
import '@nvidia-elements/code/code-block/languages/markdown.js';
import '@nvidia-elements/code/code-block/languages/python';
import '@nvidia-elements/code/code-block/languages/toml.js';
import '@nvidia-elements/code/code-block/languages/typescript.js';
import '@nvidia-elements/code/code-block/languages/xml.js';
import '@nvidia-elements/code/code-block/languages/yaml.js';
import '@nvidia-elements/code/code-block/define.js';

describe('nve-code-block', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;
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
      <nve-code-block></nve-code-block>
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
    expect(CompatibilityCodeBlock).toBe(CodeBlock);
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
    expect(element.shadowRoot!.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render source code if set via the code property', async () => {
    element.language = 'typescript';
    element.code = typescript;
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render HTML source code if slotted within a <template> tag', async () => {
    element.language = 'typescript';
    element.innerHTML = `<template>
   ${typescript}
    </template>`;
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render source code if slotted within a <pre><code> block', async () => {
    element.language = 'typescript';
    element.innerHTML = '<pre><code>const answer = 42;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.hljs > code')!.textContent).toBe('const answer = 42;');
    expect(element.shadowRoot!.querySelector('.hljs-keyword')).toBeTruthy();
  });

  it('should decode escaped HTML source from a slotted <pre><code> block', async () => {
    element.language = 'html';
    element.innerHTML = '<pre><code>&lt;nve-button&gt;Save&lt;/nve-button&gt;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.hljs > code')!.textContent).toBe('<nve-button>Save</nve-button>');
    expect(element.shadowRoot!.querySelector('.hljs-name')!.textContent).toBe('nve-button');
  });

  it('should render HTML source code if slotted HTML content', async () => {
    element.language = 'typescript';
    const div = document.createElement('div');
    div.textContent = 'hello';
    element.append(div);
    element.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedNodes()[0]).toBe(div);
  });

  it('should not render any line numbers by default', async () => {
    await elementIsStable(element);
    expect(element.lineNumbers).toBeFalsy();
    expect(element.shadowRoot!.querySelector('.hljs-linenumber')).toBeFalsy();
  });

  it('should render line-numbers', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.lineNumbers = true;
    await elementIsStable(element);
    expect(element.lineNumbers).toBeTruthy();
    expect(element.shadowRoot!.querySelector('.hljs-linenumber')).toBeTruthy();
  });

  it('should not render any highlights by default', async () => {
    await elementIsStable(element);
    expect(element.highlight).toBeFalsy();
    expect(element.shadowRoot!.querySelector('.hljs-highlight')).toBeFalsy();
  });

  it('should highlight single line', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3';
    await elementIsStable(element);
    expect(element.highlight).toBe('3');
    expect(element.shadowRoot!.querySelector('.hljs-highlight')).toBeTruthy();
  });

  it('should highlight a line group', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3-6';
    await elementIsStable(element);
    expect(element.highlight).toBe('3-6');
    expect(element.shadowRoot!.querySelectorAll('.hljs-highlight').length).toBe(4);
  });

  it('should highlight a multiple line groups', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '1,3-5,7';
    await elementIsStable(element);
    expect(element.highlight).toBe('1,3-5,7');
    expect(element.shadowRoot!.querySelectorAll('.hljs-highlight').length).toBe(5);
  });

  it('should provide actions slot', async () => {
    expect(element.shadowRoot!.querySelector('slot[name="actions"]')).toBeTruthy();
  });

  it('should render actions slot', async () => {
    element.language = 'typescript';
    element.innerHTML = `${typescript}\n${slot}`;
    await elementIsStable(element);
    expect(element.innerHTML.includes(slot)).toBeTruthy();
    expect(element.shadowRoot!.querySelector('.hljs-title')).toBeTruthy();
    expect(element.shadowRoot!.querySelector('nve-icon-button')).toBeFalsy();
  });

  it('should highlight bash source once the bash language is registered', async () => {
    element.language = 'bash';
    element.code = 'echo "hello" # greet';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('bash');
    expect(element.shadowRoot!.querySelector('.hljs-string')).toBeTruthy();
  });

  it('should highlight toml source once the toml language is registered', async () => {
    element.language = 'toml';
    element.code = 'name = "elements" # package';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('toml');
    expect(element.shadowRoot!.querySelector('.hljs-string')).toBeTruthy();
  });

  it('should not assign a language classname if no language was set or provided', async () => {
    element.language = 'typescript';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('typescript');

    element.language = undefined as unknown as typeof element.language;
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.className).toBe('');
  });

  it('should not run highlight logic if no source was provided', async () => {
    element.language = 'typescript';
    element.code = '';
    await elementIsStable(element);
    expect(element['formattedCode']).toBe(undefined);
  });
});

for (const tag of ['nve-code-block', 'nve-codeblock']) {
  describe(`${tag} composition`, () => {
    let fixture: HTMLElement;
    afterEach(() => removeFixture(fixture));

    it('should exclude companion content from source through dynamic changes', async () => {
      fixture = await createFixture(html`<div></div>`);
      fixture.innerHTML = `<${tag}><nve-code-block-header>Title</nve-code-block-header><template>echo hello</template><nve-code-block-footer>Status</nve-code-block-footer></${tag}>`;
      const element = fixture.querySelector<CodeBlock>(tag)!;
      await elementIsStable(element);
      const header = element.querySelector('nve-code-block-header')!;
      const footer = element.querySelector('nve-code-block-footer')!;
      expect(header.slot).toBe('header');
      expect(footer.slot).toBe('footer');
      expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('echo hello');
      header.remove();
      footer.remove();
      await elementIsStable(element);
      element.append(header, footer);
      await elementIsStable(element);
      expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('echo hello');
      element.code = 'echo property';
      await elementIsStable(element);
      expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('echo property');
    });

    it.each(['header', 'footer'])('should support a standalone %s and natural source height', async part => {
      fixture = await createFixture(html`<div></div>`);
      fixture.innerHTML = `<${tag}><nve-code-block-${part}>Label</nve-code-block-${part}></${tag}>`;
      const element = fixture.querySelector<CodeBlock>(tag)!;
      await elementIsStable(element);
      expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('');
      element.code = 'echo hello';
      await elementIsStable(element);
      expect(element.shadowRoot!.querySelector('pre')!.getBoundingClientRect().height).toBeGreaterThan(0);
      expect(element.getBoundingClientRect().height).toBeGreaterThan(
        element.querySelector(`nve-code-block-${part}`)!.getBoundingClientRect().height
      );
    });

    it('should keep companions and actions stationary while source scrolls', async () => {
      fixture = await createFixture(html`<div></div>`);
      fixture.innerHTML = `<${tag} style="height: 180px; width: 240px;"><nve-code-block-header>Title</nve-code-block-header><template>${'echo ' + 'long '.repeat(100)}\n${'echo hello\n'.repeat(40)}</template><button slot="actions">Copy</button><nve-code-block-footer>Status</nve-code-block-footer></${tag}>`;
      const element = fixture.querySelector<CodeBlock>(tag)!;
      await elementIsStable(element);
      const source = element.shadowRoot!.querySelector<HTMLElement>('.source')!;
      const header = element.querySelector('nve-code-block-header')!;
      const footer = element.querySelector('nve-code-block-footer')!;
      const actions = element.querySelector('button')!;
      const positions = [header, footer, actions].map(node => node.getBoundingClientRect().toJSON());
      expect(source.scrollHeight).toBeGreaterThan(source.clientHeight);
      expect(source.scrollWidth).toBeGreaterThan(source.clientWidth);
      source.scrollTop = 100;
      source.scrollLeft = 100;
      expect(source.scrollTop).toBe(100);
      expect(source.scrollLeft).toBe(100);
      expect([header, footer, actions].map(node => node.getBoundingClientRect().toJSON())).toEqual(positions);
      expect(header.getBoundingClientRect().bottom).toBeLessThanOrEqual(source.getBoundingClientRect().top);
      expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(source.getBoundingClientRect().bottom);
    });
  });
}

for (const part of ['header', 'footer']) {
  describe(`nve-code-block-${part} slots`, () => {
    let fixture: HTMLElement;
    afterEach(() => removeFixture(fixture));

    it.each(['ltr', 'rtl'])('should arrange prefix, content, and suffix in %s order', async direction => {
      fixture = await createFixture(html`<nve-code-block></nve-code-block>`);
      const parent = fixture.querySelector('nve-code-block')!;
      parent.innerHTML = `<nve-code-block-${part} dir="${direction}"><span slot="suffix">Action</span><span>Title</span><span slot="prefix">Label</span></nve-code-block-${part}><template>echo hello</template>`;
      const element = parent.querySelector<HTMLElement>(`nve-code-block-${part}`)!;
      await elementIsStable(parent);
      await elementIsStable(element);
      const prefix = element.querySelector<HTMLElement>('[slot="prefix"]')!;
      const suffix = element.querySelector<HTMLElement>('[slot="suffix"]')!;
      const content = element.querySelector<HTMLElement>('span:not([slot])')!;
      for (const name of ['prefix', 'suffix']) {
        const slot = element.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)!;
        expect(slot.assignedElements()).toEqual([element.querySelector(`[slot="${name}"]`)]);
      }
      const sign = direction === 'ltr' ? 1 : -1;
      expect(sign * (content.getBoundingClientRect().x - prefix.getBoundingClientRect().x)).toBeGreaterThan(0);
      expect(sign * (suffix.getBoundingClientRect().x - content.getBoundingClientRect().x)).toBeGreaterThan(0);
      expect(parent.shadowRoot!.querySelector('code')!.textContent).toBe('echo hello');
      prefix.remove();
      suffix.remove();
      await elementIsStable(element);
      const row = element.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
      const style = getComputedStyle(row);
      const availableWidth = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      expect(
        element.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.getBoundingClientRect().width
      ).toBeCloseTo(availableWidth, 0);
    });
  });
}
