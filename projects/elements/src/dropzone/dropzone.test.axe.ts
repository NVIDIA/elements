import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Dropzone } from '@nvidia-elements/core/dropzone';
import '@nvidia-elements/core/dropzone/define.js';

describe(Dropzone.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dropzone;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dropzone></nve-dropzone>
    `);
    element = fixture.querySelector(Dropzone.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Dropzone.metadata.tag]);
    expect(results.violations.length).toBe(0);
    expect(true).toBe(true);
  });
});
