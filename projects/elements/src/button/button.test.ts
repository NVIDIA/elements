import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Button } from '@elements/elements/button';
import '@elements/elements/button/define.js';

describe('nve-button', () => {
  let fixture: HTMLElement;
  let element: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-button>hello there</nve-button>`);
    element = fixture.querySelector('nve-button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-button')).toBeDefined();
  });

  it('should initialize tabindex 0 for focus behavior', async () => {
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it('should initialize role button', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should remove tabindex if disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
  });
});
