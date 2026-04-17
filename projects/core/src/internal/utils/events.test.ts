// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { debounce, onChildListMutation, stopEvent, throttle } from '@nvidia-elements/core/internal';

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
    fixture = await createFixture(html`<ul nve-text="list"><li></li></ul>`);
    list = fixture.querySelector('ul');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should notify of additions in child list', async () => {
    const mutation = new Promise<MutationRecord>(r => onChildListMutation(list, m => r(m)));
    const li = document.createElement('li');
    list.appendChild(li);
    expect(list.querySelectorAll('li').length).toBe(2);
    expect((await mutation).type).toBe('childList');
  });

  it('should notify of removal in child list', async () => {
    const mutation = new Promise<MutationRecord>(r => onChildListMutation(list, m => r(m)));
    list.querySelector('li').remove();
    expect(list.querySelectorAll('li').length).toBe(0);
    expect((await mutation).type).toBe('childList');
  });

  it('should notify of child attribute change', async () => {
    const mutation = new Promise<MutationRecord>(r =>
      onChildListMutation(list, m => r(m), { attributes: true, subtree: true })
    );
    list.querySelector('li').setAttribute('title', 'test');
    expect((await mutation).type).toBe('attributes');
  });
});

describe('throttle', () => {
  it('should throttle functions calls within given time', async () => {
    const argFn = vi.fn();
    const fn = throttle(argFn, 10);
    fn();
    fn();
    fn();
    await new Promise(r => setTimeout(() => r(null), 10));
    expect(argFn).toBeCalledTimes(1);
  });

  it('should allow function to be called again after timeout expires', async () => {
    const argFn = vi.fn();
    const fn = throttle(argFn, 10);
    fn();
    await new Promise(r => setTimeout(() => r(null), 20));
    fn();
    expect(argFn).toBeCalledTimes(2);
  });

  it('should forward arguments to the throttled function', () => {
    const argFn = vi.fn();
    const fn = throttle(argFn, 10);
    fn('a', 'b');
    expect(argFn).toHaveBeenCalledWith('a', 'b');
  });
});

describe('debounce', () => {
  it('should debounce functions calls within given time', async () => {
    const argFn = vi.fn();
    const fn = debounce(argFn);
    fn();
    await new Promise(r => setTimeout(() => r(null), 10));
    expect(argFn).toBeCalledTimes(1);
  });

  it('should only invoke once for rapid successive calls then allow subsequent calls', async () => {
    const argFn = vi.fn();
    const fn = debounce(argFn, 10);
    fn();
    fn();
    fn();
    fn();
    fn();
    await new Promise(r => setTimeout(() => r(null), 20));
    expect(argFn).toBeCalledTimes(1);

    fn();
    await new Promise(r => setTimeout(() => r(null), 20));
    expect(argFn).toBeCalledTimes(2);
  });
});
