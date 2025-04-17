import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Editor } from '@nvidia-elements/monaco/editor';
import '@nvidia-elements/monaco/editor/define.js';

describe('nve-monaco-editor', () => {
  let fixture: HTMLElement;
  let element: Editor;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-editor></nve-monaco-editor>
    `);
    element = fixture.querySelector(Editor.metadata.tag) as Editor;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    await elementIsStable(element);
    expect(customElements.get(Editor.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('#editor')).toBeDefined();
    expect(element.shadowRoot.querySelector('.monaco-editor')).toBeDefined();
  });
});
