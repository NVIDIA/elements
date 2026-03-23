import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon-button/define.js';

describe(IconButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: IconButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-icon-button icon-name="add" aria-label="icon button"></nve-icon-button>
    `);
    element = fixture.querySelectorAll<IconButton>(IconButton.metadata.tag)[0];
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([IconButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
