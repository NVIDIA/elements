import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getElementUpdates, listenForAttributeChange, stopEvent } from '@elements/elements/internal';
import { createFixture, removeFixture } from '@elements/elements/test';
import { html } from 'lit';

describe('stopEvent', () => {
  it('should cause event to prevent default behavior (preventDefault)', async () => {
    const event = new KeyboardEvent('keydown', { code: 'Enter' });
    stopEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should prevent event from bubbling (stopPropagation)', async () => {
    const fn = vi.fn();
    document.addEventListener('keydown', fn);
    document.body.addEventListener('keydown', e => stopEvent(e));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }));
    expect(fn).toBeCalledTimes(0);
  });
});

describe('getElementUpdates', () => {
  let fixture: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<input type="checkbox" />`);
    input = fixture.querySelector<HTMLInputElement>('input');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('get notified of property change', () => {
    let checked = false;
    getElementUpdates(input, 'checked', value => (checked = value));
    input.checked = true;

    expect(checked).toEqual(''); // in browers this is the boolean value of true, however happ-dom/vitest returns a string
  });

  it('get notified of initial attr value', async () => {
    input.setAttribute('indeterminate', '');
    const event = new Promise(resolve => getElementUpdates(input, 'indeterminate', v => resolve(v)));
    expect(await event).toBe('');
  });

  it('get notified of attr changes', async () => {
    const event = new Promise(resolve => getElementUpdates(input, 'checked', v => resolve(v)));
    input.setAttribute('checked', '');
    expect(await event).toBe(false);
  });
});

describe('listenForAttributeChange', () => {
  it('executes callback when observed attribute changes', async () => {
    const fixture = await createFixture();
    expect(fixture.getAttribute('id')).toBe(null);
    const event = new Promise(resolve => listenForAttributeChange(fixture, 'id', id => resolve(id)));

    fixture.setAttribute('id', 'hello there');
    removeFixture(fixture);

    expect(await event).toBe('hello there');
  });
});
