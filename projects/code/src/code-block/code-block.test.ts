// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/languages/css.js';
import '@nvidia-elements/code/languages/go.js';
import '@nvidia-elements/code/languages/html.js';
import '@nvidia-elements/code/languages/javascript.js';
import '@nvidia-elements/code/languages/json.js';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/python.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/languages/xml.js';
import '@nvidia-elements/code/languages/yaml.js';
import '@nvidia-elements/code/code-block/define.js';
import '@nvidia-elements/themes/index.css';
import '@nvidia-elements/themes/dark.css';

describe(CodeBlock.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CodeBlock;

  function highlighted(category: string) {
    const code = element.shadowRoot?.querySelector('code');
    const result: string[] = [];
    for (const range of CSS.highlights.get(`nve-code-${category}`) ?? []) {
      if (code?.contains(range.startContainer)) {
        const text = document.createRange();
        text.setStart(range.startContainer, range.startOffset);
        text.setEnd(range.endContainer, range.endOffset);
        result.push(text.toString());
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

  it('should define element', () => {
    expect(customElements.get(CodeBlock.metadata.tag)).toBeDefined();
  });

  it('should default to plain text', () => {
    expect(element.language).toBe('text');
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

  it('should restore the current slotted source after removing a property override', async () => {
    element.language = 'javascript';
    element.innerHTML = '<pre><code>const slot = 42;</code></pre>';
    await elementIsStable(element);

    element.code = 'const property = 43;';
    await elementIsStable(element);
    const renderedCode = element.shadowRoot!.querySelector('code');
    expect(renderedCode?.textContent).toBe('const property = 43;');

    element.querySelector('pre > code')!.textContent = 'const slot = 44;';
    element.code = undefined;
    await elementIsStable(element);
    expect(renderedCode?.textContent).toBe('const slot = 44;');
    expect(highlighted('number')).toContain('44');
  });

  it('should restore slotted source after removing an empty code attribute', async () => {
    element.language = 'javascript';
    element.innerHTML = '<pre><code>const slot = 42;</code></pre>';
    await elementIsStable(element);
    const renderedCode = element.shadowRoot!.querySelector('code')!;
    expect(renderedCode.textContent).toBe('const slot = 42;');

    element.setAttribute('code', '');
    await elementIsStable(element);
    expect(renderedCode.textContent).toBe('');

    element.removeAttribute('code');
    await elementIsStable(element);

    expect(renderedCode.textContent).toBe('const slot = 42;');
    expect(highlighted('number')).toContain('42');
  });

  it('uses the inherited theme token for syntax colors and respects local overrides', async () => {
    element.language = 'typescript';
    element.code = 'const value = true;';
    element.style.cssText = '--nve-ref-color-purple-violet-1100: red; --nve-ref-color-blue-cobalt-1100: blue;';
    await elementIsStable(element);

    const code = element.shadowRoot!.querySelector('code')!;
    const body = document.body;
    const previousTheme = body.getAttribute('nve-theme');

    try {
      code.style.colorScheme = 'dark';
      body.setAttribute('nve-theme', 'light');
      expect(getComputedStyle(code, '::highlight(nve-code-keyword)').color).toBe('rgb(255, 0, 0)');

      body.setAttribute('nve-theme', 'dark');
      code.style.colorScheme = 'light';
      expect(getComputedStyle(code, '::highlight(nve-code-keyword)').color).toBe('rgb(0, 0, 255)');

      element.setAttribute('nve-theme', 'light');
      code.style.colorScheme = 'dark';
      expect(getComputedStyle(code, '::highlight(nve-code-keyword)').color).toBe('rgb(255, 0, 0)');
    } finally {
      if (previousTheme === null) body.removeAttribute('nve-theme');
      else body.setAttribute('nve-theme', previousTheme);
    }
  });

  it.each([
    ['bash', 'echo "<ready>"'],
    ['shell', '$ echo "<ready>"\n<ready>'],
    ['toml', 'status = "<ready>"']
  ] as const)('renders %s as plain text', async (language, source) => {
    element.language = language;
    element.code = source;
    await elementIsStable(element);

    const code = element.shadowRoot?.querySelector('code');
    const ranges = [...CSS.highlights.values()].flatMap(group => [...group]);
    expect(code?.textContent).toBe(source);
    expect(code?.children).toHaveLength(0);
    expect(ranges.some(range => code?.contains(range.startContainer))).toBe(false);
  });

  it('opts into bracket depth coloring without replacing the source text', async () => {
    element.language = 'typescript';
    element.code = 'const value = ({ item: [1] }); const text = "(ignored)";';
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBeNull();
    expect(highlighted('bracket-1')).toEqual([]);

    element.setAttribute('bracket-pair-coloring', '');
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBe('shared');
    expect(highlighted('bracket-1')).toEqual(['(', ')']);
    expect(highlighted('bracket-2')).toEqual(['{', '}']);
    expect(highlighted('bracket-3')).toEqual(['[', ']']);
    const code = element.shadowRoot?.querySelector('code');
    const sourceNode = Array.from(code?.childNodes ?? []).find(node => node instanceof Text);
    expect(sourceNode).toBeInstanceOf(Text);

    element.bracketPairColoring = 'independent';
    await elementIsStable(element);
    expect(highlighted('bracket-1')).toEqual(['(', '{', '[', ']', '}', ')']);
    expect(highlighted('bracket-2')).toEqual([]);
    expect(sourceNode?.parentNode).toBe(code);

    element.setAttribute('bracket-pair-coloring', 'false');
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBeNull();
    expect(highlighted('bracket-1')).toEqual([]);

    element.setAttribute('bracket-pair-coloring', 'SHARED');
    await elementIsStable(element);
    expect(highlighted('bracket-3')).toEqual(['[', ']']);

    element.bracketPairColoring = null;
    await elementIsStable(element);
    expect(element.bracketPairColoring).toBeNull();
    expect(highlighted('bracket-1')).toEqual([]);
    expect(highlighted('keyword')).toContain('const');
  });

  it('should highlight TypeScript source from a slotted template', async () => {
    element.language = 'typescript';
    element.innerHTML = `<template>
   ${typescript}
    </template>`;
    await elementIsStable(element);
    expect(highlighted('function')).toContain('getTime');
  });

  it('should preserve code indentation after blank lines around a slotted template', async () => {
    const source = 'function run() {\n  return true;\n}';
    element.language = 'typescript';
    element.innerHTML = ` <template>\n${source}\n</template>`;
    await elementIsStable(element);

    expect(element.shadowRoot?.querySelector('code')?.textContent).toBe(source);
  });

  it('preserves and highlights a Markdown heading after inline template padding', async () => {
    const source = '# Release notes\n\nParagraph with spaces.';
    element.language = 'markdown';
    element.innerHTML = ` <template>${source}</template>`;
    await elementIsStable(element);

    expect(element.shadowRoot?.querySelector('code')?.textContent).toBe(source);
    expect(highlighted('meta').join('')).toContain('Release notes');
  });

  it('should render source code if slotted within a <pre><code> block', async () => {
    element.language = 'typescript';
    element.innerHTML = '<pre><code>const answer = 42;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.code > code')!.textContent).toBe('const answer = 42;');
    expect(highlighted('keyword')).toContain('const');
  });

  it('should decode escaped HTML source from a slotted <pre><code> block', async () => {
    element.language = 'html';
    element.innerHTML = '<pre><code>&lt;nve-button&gt;Save&lt;/nve-button&gt;</code></pre>';
    await elementIsStable(element);

    expect(element.shadowRoot!.querySelector('pre.code > code')!.textContent).toBe('<nve-button>Save</nve-button>');
    expect(highlighted('tag')).toContain('nve-button');
  });

  it('should render nested markup from a slotted element as literal source', async () => {
    element.innerHTML = '<div><strong>hello</strong></div>';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('<strong>hello</strong>');
  });

  it('should display source without line decorations by default', async () => {
    element.code = 'first\nsecond';
    await elementIsStable(element);
    expect(element.shadowRoot!.querySelector('code')!.textContent).toBe('first\nsecond');
    expect(element.shadowRoot!.querySelector('.line-number, .selected-line')).toBeNull();
  });

  it('should render a number for every source line', async () => {
    element.code = 'first\nsecond\nthird';
    element.lineNumbers = true;
    await elementIsStable(element);
    const labels = Array.from(element.shadowRoot!.querySelectorAll('.line-number'), number => number.textContent);
    expect(labels.join('\n')).toBe('1\n2\n3');
  });

  it.each([
    { selection: '3', expected: ['3'] },
    { selection: '3-6', expected: ['3', '4', '5', '6'] },
    { selection: '1,3-5,7', expected: ['1', '3', '4', '5', '7'] }
  ])('should highlight exactly the lines selected by $selection', async ({ selection, expected }) => {
    element.code = 'first\nsecond\nthird\nfourth\nfifth\nsixth\nseventh';
    element.highlight = selection;
    await elementIsStable(element);

    const selected = element.shadowRoot!.querySelectorAll<HTMLElement>('.selected-line');
    expect(Array.from(selected, row => row.dataset.line)).toEqual(expected);
  });

  it('should slot actions outside the source text', async () => {
    element.language = 'typescript';
    element.innerHTML = `${typescript}<button slot="actions">Copy source</button>`;
    await elementIsStable(element);

    const actions = element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="actions"]');
    expect(actions?.assignedElements()).toEqual([element.querySelector('button')]);
    expect(element.shadowRoot?.querySelector('code')?.textContent).toBe(typescript.trim());
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

  it('preserves source, highlights, and wrapped line decorations across text nodes', async () => {
    const comment = `/* ${'a'.repeat(4_096)}\ncomment ends here */`;
    const source = `${comment}\nconst tail = 42;`;
    element.language = 'javascript';
    element.code = source;
    element.lineNumbers = true;
    element.highlight = '3';
    element.style.cssText = 'width:180px; --white-space:pre-wrap;';
    await elementIsStable(element);

    const code = element.shadowRoot?.querySelector('code');
    const row = element.shadowRoot?.querySelector('[data-line="3"].selected-line');
    const nodes = [...(code?.childNodes ?? [])].filter(node => node instanceof Text);
    const tail = nodes[1];
    if (!code || !row || !tail) throw new Error('Missing chunked code or line decoration');
    const selection = document.createRange();
    selection.selectNodeContents(code);
    expect(selection.toString()).toBe(source);
    expect(code.childElementCount).toBe(0);
    expect(highlighted('comment')).toEqual([comment]);
    const lineStart = tail.data.indexOf('const');
    const glyph = document.createRange();
    glyph.setStart(tail, lineStart);
    glyph.setEnd(tail, lineStart + 1);
    const bounds = glyph.getBoundingClientRect();
    const selected = row.getBoundingClientRect();
    expect(selected.height).toBeGreaterThan(0);
    expect(selected.top).toBeLessThanOrEqual(bounds.top);
    expect(selected.bottom).toBeGreaterThanOrEqual(bounds.bottom);
  });

  it('should dispose only its own ranges and highlight edited text after reconnecting', async () => {
    element.bracketPairColoring = 'shared';
    element.language = 'json';
    element.code = '{"value": 42}';
    const other = document.createElement('nve-code-block');
    other.bracketPairColoring = 'shared';
    other.language = 'json';
    other.code = '{"value": 43}';
    fixture.append(other);
    await elementIsStable(element);
    await elementIsStable(other);
    const owned = (block: CodeBlock) => {
      const code = block.shadowRoot!.querySelector('code')!;
      return Array.from(CSS.highlights).flatMap(([, group]) =>
        [...group].filter(range => code.contains(range.startContainer))
      );
    };
    const ranges = owned(other);
    expect(highlighted('bracket-1')).toEqual(['{', '}']);
    element.remove();
    expect(owned(element)).toEqual([]);
    expect(owned(other)).toEqual(ranges);
    element.code = '{"value": 44}';
    await element.updateComplete;
    expect(owned(element)).toEqual([]);
    fixture.append(element);
    await elementIsStable(element);
    expect(highlighted('number')).toContain('44');
    expect(highlighted('bracket-1')).toEqual(['{', '}']);
    expect(owned(other)).toEqual(ranges);
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

  it('should refresh wrapped decorations on resize while preserving syntax ranges', async () => {
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
    const selectedLine = element.shadowRoot!.querySelector('.selected-line[data-line="1"]')!;
    const firstHeight = selectedLine.getBoundingClientRect().height;
    const labels = Array.from(element.shadowRoot!.querySelectorAll('.line-number'), label => label.textContent);
    expect(labels).toEqual(['1', '2']);
    const labelText = document.createRange();
    labelText.selectNodeContents(selectedLine);
    expect(labelText.getBoundingClientRect().right).toBeLessThan(code.getBoundingClientRect().left);

    element.style.width = '480px';
    await frame();
    const nextHeight = element.shadowRoot!.querySelector('[data-line="1"]')!.getBoundingClientRect().height;
    expect(nextHeight).toBeLessThan(firstHeight);
    expect(CSS.highlights.get('nve-code-keyword')?.has(range!)).toBe(true);
    expect(code.textContent).toBe(element.code);
    element.remove();
    await frame();
    expect(highlighted('keyword')).toEqual([]);
  });

  it('should refresh wrapped decorations after a font loading event at a fixed width', async () => {
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(() => undefined);

    try {
      await document.fonts.ready;
      element.style.cssText =
        'width:360px; font-size:12px; line-height:32px; --white-space:pre-wrap; --font-family:monospace';
      element.code = 'const text = "one two three four five six seven eight nine ten";\n// tail';
      element.lineNumbers = true;
      element.highlight = '1';
      await elementIsStable(element);

      const code = element.shadowRoot!.querySelector('code')!;
      const firstLine = element.shadowRoot!.querySelector('[data-line="1"]')!;
      const initialCodeHeight = code.getBoundingClientRect().height;
      const initialLineHeight = firstLine.getBoundingClientRect().height;

      element.style.fontSize = '28px';
      expect(code.getBoundingClientRect().height).toBeGreaterThan(initialCodeHeight);
      expect(firstLine.getBoundingClientRect().height).toBe(initialLineHeight);

      document.fonts.dispatchEvent(new Event('loadingdone'));
      await vi.waitFor(() => expect(firstLine.getBoundingClientRect().height).toBeGreaterThan(initialLineHeight));
    } finally {
      observe.mockRestore();
    }
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
