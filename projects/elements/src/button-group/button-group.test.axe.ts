import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { ButtonGroup } from '@nvidia-elements/core/button-group';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(ButtonGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <mlv-button-group>
      <mlv-icon-button pressed icon-name="split-vertical" aria-label="split vertical"></mlv-icon-button>
      <mlv-icon-button icon-name="split-horizontal" aria-label="split horizontal"></mlv-icon-button>
      <mlv-icon-button icon-name="split-none" aria-label="split none"></mlv-icon-button>
    </mlv-button-group>
    `);
    element = fixture.querySelector(ButtonGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ButtonGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
