import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { File } from '@nvidia-elements/core/file';
import '@nvidia-elements/core/file/define.js';

describe(File.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: File;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-file>
        <label>label</label>
        <input type="file" />
      </nve-file>
    `);
    element = fixture.querySelector(File.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(File.metadata.tag)).toBeDefined();
  });

  it('should append global styles needed for file pseudo selectors', () => {
    expect((element.getRootNode() as Document).adoptedStyleSheets).toBeTruthy();
  });
});
