import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@elements/elements/test';
import { onChildListMutation, stopEvent } from './events.js';

describe('stopEvent', () => {
  it('should cause event to prevent default behavior (preventDefault)', async () => {
    const event = new KeyboardEvent('keydown', { code: 'Enter' });
    const div = document.createElement('div');
    div.dispatchEvent(event);
    div.addEventListener('keydown', e => {
      stopEvent(e);
      expect(e.defaultPrevented).toBe(true);
    });
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
    const mutation = new Promise(r => onChildListMutation(list, m => r(m)));
    const li = document.createElement('li');
    list.appendChild(li);
    expect(list.querySelectorAll('li').length).toBe(2);
    expect(((await mutation) as any).type).toBe('childList');
  });

  it('should notify of removal in child list', async () => {
    const mutation = new Promise(r => onChildListMutation(list, m => r(m)));
    list.querySelector('li').remove();
    expect(list.querySelectorAll('li').length).toBe(0);
    expect(((await mutation) as any).type).toBe('childList');
  });
});
