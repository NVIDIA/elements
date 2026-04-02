// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { untilEvent } from '@internals/testing';
import { GlobalState, GlobalStateService } from './global.service.js';

describe('GlobalStateService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.versions = ['0.0.0'];
    window.NVE_ELEMENTS.state.elementRegistry = {};
  });

  it('should provide an initial state object', () => {
    expect(GlobalStateService.state.versions[0]).toBe('0.0.0');
  });

  it('should provide host details', () => {
    expect(GlobalStateService.state.moduleHost).toBeDefined();
    expect(GlobalStateService.state.pageHost).toBeDefined();
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

    expect(((await event) as CustomEvent).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });
  });

  it('should log out state when debug() is called with provided log', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect(((await event) as CustomEvent).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });

    const watch = {
      fn: () => null
    };

    vi.spyOn(watch, 'fn');
    window.NVE_ELEMENTS.debug(watch.fn);
    expect(watch.fn).toHaveBeenCalled();
  });

  it('should log out state when debug() is called', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect(((await event) as CustomEvent).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });

    const original = console.log;
    console.log = () => null;

    vi.spyOn(console, 'log');
    window.NVE_ELEMENTS.debug();
    expect(console.log).toHaveBeenCalled();

    console.log = original;
  });

  it('should initialize scopedRegistry when prior version did not define it', () => {
    delete (window.NVE_ELEMENTS.state as any).scopedRegistry; // eslint-disable-line @typescript-eslint/no-explicit-any
    const instance = new GlobalState();
    expect(instance.state.scopedRegistry).toBeDefined();
    expect(instance.state.scopedRegistry['0.0.0']).toBeDefined();
  });

  it('should log out state when debug() is called on NVE_ELEMENTS', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect(((await event) as CustomEvent).detail.elementRegistry).toStrictEqual({
      one: '0.0.0'
    });

    const original = console.log;
    console.log = () => null;

    vi.spyOn(console, 'log');
    (window as any).NVE_ELEMENTS.debug(); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(console.log).toHaveBeenCalled();

    console.log = original;
  });
});
