import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { File } from '@elements/elements/file';
import '@elements/elements/file/define.js';

describe('mlv-file axe', () => {
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

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-file']);
    expect(results.violations.length).toBe(0);
  });
});
