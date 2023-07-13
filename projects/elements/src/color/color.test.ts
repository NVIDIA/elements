import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Color } from '@elements/elements/color';
import '@elements/elements/color/define.js';

describe('nve-color', () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-color>
        <label>label</label>
        <input type="color" />
      </nve-color>
    `);
    element = fixture.querySelector('nve-color');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-color')).toBeDefined();
  });

  it('should have a color picker button defined', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
  });

  it('should default the color to the input background if not set', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#000000');
  });

  it('should apply default if custom default is provided', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#000000');
  });

  it('should not apply default if custom default is provided', async () => {
    const element = document.createElement('nve-color');
    const input = document.createElement('input');
    input.value = '#fff';

    element.appendChild(input);
    document.body.appendChild(element);
    await element.updateComplete;
    expect(input.value).toBe('#fff');
    element.remove();
  });

  it('should update the color value if EyeDropper is used', async () => {
    const original = (window as any).EyeDropper;
    (window as any).EyeDropper = class {
      open() {
        return Promise.resolve({ sRGBHex: '#2d2d2d' });
      }
    }
  
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#000000');

    element.shadowRoot.querySelector('nve-icon-button').click();
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#2d2d2d');

    (window as any).EyeDropper = original;
  });
});
