import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Markdown } from '@nvidia-elements/markdown/markdown';
import '@nvidia-elements/markdown/markdown/define.js';

describe(Markdown.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Markdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-markdown></nve-markdown>
    `);
    element = fixture.querySelector(Markdown.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Markdown.metadata.tag)).toBeDefined();
  });
});
