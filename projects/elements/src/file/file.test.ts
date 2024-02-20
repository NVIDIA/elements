import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { File } from '@elements/elements/file';
import '@elements/elements/file/define.js';

describe('nve-file', () => {
  let fixture: HTMLElement;
  let element: File;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-file>
        <label>label</label>
        <input type="file" />
      </nve-file>
    `);
    element = fixture.querySelector('nve-file');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-file')).toBeDefined();
  });

  it('should append global styles needed for file pseudo selectors', () => {
    expect((element as any).getRootNode().adoptedStyleSheets).toBeTruthy();
  });
});
