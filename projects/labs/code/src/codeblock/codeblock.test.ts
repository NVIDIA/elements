import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import type { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/define.js';

describe('nve-codeblock', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-codeblock></nve-codeblock>
    `);
    element = fixture.querySelector('nve-codeblock') as CodeBlock;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    await elementIsStable(element);
    expect(customElements.get('nve-codeblock')).toBeDefined();
  });
});
