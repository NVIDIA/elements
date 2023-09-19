import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ProgressBar } from '@elements/elements/progress-bar';
import '@elements/elements/progress-bar/define.js';


describe('mlv-progress-bar', () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-progress-bar></mlv-progress-bar>
    `);
    element = fixture.querySelector('mlv-progress-bar');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-progress-bar')).toBeDefined();
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
    expect(nativeProgress.classList.contains('minWidth')).toBe(true);
  });
});
