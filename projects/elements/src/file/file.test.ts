import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { File } from '@elements/elements/file';
import '@elements/elements/file/define.js';

describe('mlv-file', () => {
  let fixture: HTMLElement;
  let element: File;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-file>
        <label>label</label>
        <input type="file" />
      </mlv-file>
    `);
    element = fixture.querySelector('mlv-file');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-file')).toBeDefined();
  });


  it('should append global styles needed for file pseudo selectors', () => {
    expect(element.querySelector('.mlv-file')).toBeTruthy();
  });
});
