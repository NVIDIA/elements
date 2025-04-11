import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/go.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/python';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import '@nvidia-elements/code/codeblock/languages/yaml.js';
import '@nvidia-elements/code/codeblock/define.js';

describe('nve-codeblock', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;
  let typescript = `
/**
 * Function to get current time.
 * @return {number} time in milis
 */
function getTime(): number {
  return new Date().getTime();
}`;
  let slot = `<nve-icon-button slot="actions" container="flat" icon-name="copy"></nve-icon-button>`;

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
    expect(element.shadowRoot.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render source code if set via the code property', async () => {
    element.language = 'typescript';
    element.code = typescript;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render HTML source code if slotted within a <template> tag', async () => {
    element.language = 'typescript';
    element.innerHTML = `<template>
   ${typescript}
    </template>`;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.hljs-title')).toBeTruthy();
  });

  it('should render HTML source code if slotted HTML content', async () => {
    element.language = 'typescript';
    const div = document.createElement('div');
    div.textContent = 'hello';
    element.append(div);
    element.shadowRoot.querySelector('slot').dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot').assignedNodes()[0]).toBe(div);
  });

  it('should not render any line numbers by default', async () => {
    await elementIsStable(element);
    expect(element.lineNumbers).toBeFalsy();
    expect(element.shadowRoot.querySelector('.hljs-linenumber')).toBeFalsy();
  });

  it('should render line-numbers', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.lineNumbers = true;
    await elementIsStable(element);
    expect(element.lineNumbers).toBeTruthy();
    expect(element.shadowRoot.querySelector('.hljs-linenumber')).toBeTruthy();
  });

  it('should not render any highlights by default', async () => {
    await elementIsStable(element);
    expect(element.highlight).toBeFalsy();
    expect(element.shadowRoot.querySelector('.hljs-highlight')).toBeFalsy();
  });

  it('should highlight single line', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3';
    await elementIsStable(element);
    expect(element.highlight).toBe('3');
    expect(element.shadowRoot.querySelector('.hljs-highlight')).toBeTruthy();
  });

  it('should highlight a line group', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '3-6';
    await elementIsStable(element);
    expect(element.highlight).toBe('3-6');
    expect(element.shadowRoot.querySelectorAll('.hljs-highlight').length).toBe(4);
  });

  it('should highlight a multiple line groups', async () => {
    element.language = 'typescript';
    element.innerHTML = typescript;
    element.highlight = '1,3-5,7';
    await elementIsStable(element);
    expect(element.highlight).toBe('1,3-5,7');
    expect(element.shadowRoot.querySelectorAll('.hljs-highlight').length).toBe(5);
  });

  it('should provide actions slot', async () => {
    expect(element.shadowRoot.querySelector('slot[name="actions"]')).toBeTruthy();
  });

  it('should render actions slot', async () => {
    element.language = 'typescript';
    element.innerHTML = `${typescript}\n${slot}`;
    await elementIsStable(element);
    expect(element.innerHTML.includes(slot)).toBeTruthy();
    expect(element.shadowRoot.querySelector('.hljs-title')).toBeTruthy();
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeFalsy();
  });

  it('should not assign a language classname if no language was set or provided', async () => {
    element.language = 'typescript';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('code').className).toBe('typescript');

    element.language = undefined;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('code').className).toBe('');
  });

  it('should not run highlight logic if no source was provided', async () => {
    element.language = 'typescript';
    element.code = '';
    await elementIsStable(element);
    expect(element['formattedCode']).toBe(undefined);
  });
});
