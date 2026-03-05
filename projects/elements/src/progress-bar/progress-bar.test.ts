import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';
import '@nvidia-elements/core/progress-bar/define.js';

describe(ProgressBar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-bar></nve-progress-bar>
    `);
    element = fixture.querySelector(ProgressBar.metadata.tag);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ProgressBar.metadata.tag)).toBeDefined();
  });

  it('should set properties on its native progress element', async () => {
    element.value = 50;
    element.max = 75;
    await elementIsStable(element);

    const nativeProgress = element.shadowRoot.querySelector('progress') as HTMLProgressElement;

    expect(nativeProgress.value).toBe(element.value);
    expect(nativeProgress.max).toBe(element.max);
  });

  it('should properly set full and minWidth styles', async () => {
    element.value = 50;
    element.max = 50;
    await elementIsStable(element);

    const nativeProgress = element.shadowRoot.querySelector('progress') as HTMLProgressElement;

    expect(nativeProgress.classList.contains('full')).toBe(true);
    expect(nativeProgress.classList.contains('min-width')).toBe(true);
  });
});
