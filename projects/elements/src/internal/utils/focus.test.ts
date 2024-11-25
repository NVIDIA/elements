import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, emulateClick, removeFixture } from '@nvidia-elements/testing';
import { focusElement, isFocusable, onListboxActivate } from '@nvidia-elements/core/internal';

describe('isFocusable', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    // disable anchor validation
    /* eslint-disable */
    fixture = await createFixture(html`
      <a>false</a>
      <a href="">true</a>
      <area href="">true</area>
      <area>false</area>
      <button>true</button>
      <button disabled>false</button>
      <div contenteditable="true">true</div>
      <div role="button">true</div>
      <div role="button" disabled>false</div>
      <div tabindex="0">true</div>
      <div tabindex="-1">true</div>
      <embed true />
      <input value="true" />
      <input disabled value="false" />
      <object>true</object>
      <select true></select>
      <select disabled false></select>
      <textarea>true</textarea>
      <textarea disabled>false</textarea>
      <button inert>false</button>
      <div inert><button>false</button></div>
      <div popover><button>false</button></div>
    `);
    /* eslint-enable */
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should mark focusable elements as true', () => {
    const elements = Array.from(fixture.querySelectorAll('*')).map(e => isFocusable(e));
    expect(elements.filter(i => i === true).length).toBe(12);
    expect(elements.filter(i => i === false).length).toBe(12);
  });
});

describe('focusElement', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button>one</button>
      <button>two</button>
      <span>three</span>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should focus', () => {
    const [one, two] = Array.from(fixture.querySelectorAll('button'));
    focusElement(two);
    expect(document.activeElement === one).toBe(false);
    expect(document.activeElement === two).toBe(true);
  });

  it('should focus non-interactive elements', () => {
    const [one, two, three] = Array.from(fixture.querySelectorAll<HTMLElement>('*'));
    focusElement(two);
    expect(document.activeElement === one).toBe(false);
    expect(document.activeElement === two).toBe(true);
    expect(document.activeElement === three).toBe(false);
    expect(three.getAttribute('tabindex')).toBe(null);

    focusElement(three);
    expect(document.activeElement === one).toBe(false);
    expect(document.activeElement === two).toBe(false);
    expect(document.activeElement === three).toBe(true);
    expect(three.getAttribute('tabindex')).toBe('-1');

    three.dispatchEvent(new Event('blur'));
    expect(three.getAttribute('tabindex')).toBe(null);
    expect(three && !isFocusable(three)).toBe(true);
  });
});

describe('onListboxActivate', () => {
  let select: HTMLSelectElement;

  beforeEach(() => {
    select = document.createElement('select');
  });

  afterEach(() => {
    select.remove();
  });

  it('should execute callback when a valid user interaction click', async () => {
    let active = false;
    onListboxActivate(select, () => (active = true));
    emulateClick(select);
    expect(active).toBe(true);
  });

  it('should NOT execute callback when a valid user interaction click and disabled', async () => {
    let active = false;
    select.disabled = true;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new Event('pointerup'));
    expect(active).toBe(false);
  });

  it('should execute callback when a valid user interaction keyevent Space', async () => {
    let active = false;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(active).toBe(true);
  });

  it('should execute callback when a valid user interaction keyevent ArrowUp', async () => {
    let active = false;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' }));
    expect(active).toBe(true);
  });

  it('should execute callback when a valid user interaction keyevent ArrowDown', async () => {
    let active = false;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowDown' }));
    expect(active).toBe(true);
  });

  it('should NOT execute callback when a valid user interaction keyevent Space if disabled', async () => {
    let active = false;
    select.disabled = true;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(active).toBe(false);
  });

  it('should NOT execute callback when a valid user interaction keyevent ArrowUp if disabled', async () => {
    let active = false;
    select.disabled = true;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' }));
    expect(active).toBe(false);
  });

  it('should NOT execute callback when a valid user interaction keyevent ArrowDown if disabled', async () => {
    let active = false;
    select.disabled = true;
    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowDown' }));
    expect(active).toBe(false);
  });

  it('should prevent default on keyevent Space preventing native UI activation', async () => {
    let active = false;
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    vi.spyOn(event, 'preventDefault');

    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(active).toBe(false);
  });

  it('should NOT prevent default on keyevent Space preventing native UI activation if disabled', async () => {
    let active = false;
    select.disabled = true;
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    vi.spyOn(event, 'preventDefault');

    onListboxActivate(select, () => (active = true));
    select.dispatchEvent(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(active).toBe(false);
  });
});
