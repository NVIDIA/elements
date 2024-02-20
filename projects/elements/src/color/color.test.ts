import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Color } from '@elements/elements/color';
import '@elements/elements/color/define.js';

describe('mlv-color', () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-color>
        <label>label</label>
        <input type="color" />
      </mlv-color>
    `);
    element = fixture.querySelector('mlv-color');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-color')).toBeDefined();
  });

  it('should have a color picker button defined', () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBeDefined();
  });

  it('should default the color to the input background if not set', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dfe3e6');
  });

  it('should apply default if custom default is provided', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dfe3e6');
  });

  it('should not apply default if custom default is provided', async () => {
    const element = document.createElement('mlv-color');
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
    };

    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dfe3e6');

    const input = untilEvent(fixture.querySelector('input'), 'input');
    const change = untilEvent(fixture.querySelector('input'), 'change');
    element.shadowRoot.querySelector('mlv-icon-button').click();

    expect(await input).toBeDefined();
    expect(await change).toBeDefined();
    expect(fixture.querySelector('input').value).toBe('#2d2d2d');

    (window as any).EyeDropper = original;
  });
});
