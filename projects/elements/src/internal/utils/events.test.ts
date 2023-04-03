import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onChildListMutation, stopEvent } from '@elements/elements/internal';
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

describe('onChildListMutation', () => {
  let fixture: HTMLElement;
  let list: HTMLUListElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<ul><li></li></ul>`
    );
    list = fixture.querySelector('ul');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should notify of additions in child list', async () => {
    const mutation = new Promise(r => onChildListMutation(list, () => r(list.querySelectorAll('li').length)));
    const li = document.createElement('li');
    list.appendChild(li);
    expect(await mutation).toBe(2);
  });

  it('should notify of removal in child list', async () => {
    const mutanten = new Promise(r =>onChildListMutation(list, () => r(list.querySelectorAll('li').length)));
    list.querySelector('li').remove();
    expect(await mutanten).toBe(0);
  });
});
