import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import '@nvidia-elements/core/resize-handle/define.js';

describe(ResizeHandle.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ResizeHandle;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-resize-handle aria-label="resize"></nve-resize-handle>
    `);
    element = fixture.querySelector(ResizeHandle.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ResizeHandle.metadata.tag]);
    expect(results.violations.length).toBe(0);
    expect(true).toBe(true);
  });
});
