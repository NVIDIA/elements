import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Input } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe(Input.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Input;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
    `);
    element = fixture.querySelector(Input.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Input.metadata.tag)).toBeDefined();
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });
});
