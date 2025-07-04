import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

import '@nvidia-elements/monaco/input/define.js';

describe('nve-monaco-input', () => {
  let fixture: HTMLElement;
  let element: MonacoInput;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-input value="initial value"></nve-monaco-input>
    `);
    element = fixture.querySelector(MonacoInput.metadata.tag) as MonacoInput;

    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoInput.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector(MonacoEditor.metadata.tag)).toBeDefined();
  });
});
