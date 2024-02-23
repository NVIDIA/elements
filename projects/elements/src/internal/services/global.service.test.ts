import { beforeEach, describe, expect, it, vi } from 'vitest';
import { untilEvent } from '@nvidia-elements/testing';
import { GlobalStateService } from './global.service.js';

describe('GlobalStateService', () => {
  beforeEach(() => {
    window.MLV_ELEMENTS.state.versions = ['0.0.0'];
    window.MLV_ELEMENTS.state.elementRegistry = {};
  });

  it('should provide an intial state object', () => {
    expect(GlobalStateService.state.versions[0]).toBe('0.0.0');
  });

  it('should merge state updates', async () => {
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '1.0.0' } });
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { two: '2.0.0' } });

    expect(GlobalStateService.state.elementRegistry).toStrictEqual({
      one: '1.0.0',
      two: '2.0.0'
    });
  });

  it('should dispatch an event when the state is updated', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect((await event).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });
  });

  it('should log out state when debug() is called with provided log', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect((await event).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });

    const watch = {
      fn: () => null
    };

    vi.spyOn(watch, 'fn');
    window.MLV_ELEMENTS.debug(watch.fn);
    expect(watch.fn).toHaveBeenCalled();
  });

  it('should log out state when debug() is called', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect((await event).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });

    const original = console.log;
    console.log = () => null;

    vi.spyOn(console, 'log');
    window.MLV_ELEMENTS.debug();
    expect(console.log).toHaveBeenCalled();

    console.log = original;
  });
});
