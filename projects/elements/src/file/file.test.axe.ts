import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { File } from '@nvidia-elements/core/file';
import '@nvidia-elements/core/file/define.js';

describe(File.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: File;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-file>
        <label>label</label>
        <input type="file" />
      </mlv-file>
    `);
    element = fixture.querySelector(File.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([File.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
