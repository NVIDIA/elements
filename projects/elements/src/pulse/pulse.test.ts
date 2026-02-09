import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Pulse } from '@nvidia-elements/core/pulse';
import '@nvidia-elements/core/pulse/define.js';

describe(Pulse.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pulse;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-pulse></nve-pulse>
    `);
    element = fixture.querySelector(Pulse.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Pulse.metadata.tag)).toBeDefined();
  });

  it('should set size attribute', async () => {
    element.size = 'xs';
    await elementIsStable(element);
    expect(element.size).toBe('xs');
  });

  it('should set status attribute', async () => {
    element.status = 'warning';
    await elementIsStable(element);
    expect(element.status).toBe('warning');
  });

  it('should provide a aria role of alert to describe content', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });
});
