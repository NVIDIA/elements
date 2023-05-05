import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@elements/elements/test';
import { focusElement, isFocusable } from '@elements/elements/internal';

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
    `);
    /* eslint-enable */
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should mark focusable elements as true', () => {
    const elements = Array.from(fixture.querySelectorAll('*')).map(e => isFocusable(e));
    expect(elements.filter(i => i === true).length).toBe(11);
    expect(elements.filter(i => i === false).length).toBe(8);
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
