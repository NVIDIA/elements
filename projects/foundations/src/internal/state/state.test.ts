// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { untilEvent } from '@internals/testing';
import { define, supportsScopedRegistry } from '@nvidia-elements/foundations/internal/define';
import { GlobalStateService } from '@nvidia-elements/foundations/internal/state';
import { GlobalState } from './state.js';

describe('GlobalStateService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.versions = ['0.0.0'];
    window.NVE_ELEMENTS.state.elementRegistry = {};
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should preserve registrations when another state service initializes', () => {
    vi.stubGlobal('NVE_ELEMENTS', undefined);
    new GlobalState();
    class FoundationElement extends HTMLElement {
      static readonly metadata = { tag: 'foundations-before-core-test', version: '1.0.0' };
    }
    define(FoundationElement);
    const state = globalThis.NVE_ELEMENTS.state;

    const core = new GlobalState();

    expect(core.state).toBe(state);
    expect(core.state.elementRegistry[FoundationElement.metadata.tag]).toBe('1.0.0');
    expect(core.state.versions).toContain('0.0.0');
    expect(core.state.scopedRegistry['0.0.0']).toBeDefined();
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

  it('should initialize elementRegistry when prior state did not define it', () => {
    Reflect.deleteProperty(globalThis.NVE_ELEMENTS.state, 'elementRegistry');

    const service = new GlobalState();

    expect(service.state.elementRegistry).toEqual({});
  });

  it('should initialize i18nRegistry when prior state did not define it', () => {
    vi.stubGlobal('NVE_ELEMENTS', {
      ...globalThis.NVE_ELEMENTS,
      state: { ...globalThis.NVE_ELEMENTS.state }
    });
    Reflect.deleteProperty(globalThis.NVE_ELEMENTS.state, 'i18nRegistry');

    const service = new GlobalState();

    expect(service.state.i18nRegistry).toEqual({});
  });

  it('should preserve existing translations when another state service initializes', () => {
    const registry = { close: 'fermer' };
    vi.stubGlobal('NVE_ELEMENTS', {
      ...globalThis.NVE_ELEMENTS,
      state: { ...globalThis.NVE_ELEMENTS.state, i18nRegistry: registry }
    });

    const service = new GlobalState();

    expect(service.state.i18nRegistry).toBe(registry);
    expect(service.state.i18nRegistry.close).toBe('fermer');
  });

  it('should initialize scopedRegistry when prior version did not define it', () => {
    delete (window.NVE_ELEMENTS.state as any).scopedRegistry; // eslint-disable-line @typescript-eslint/no-explicit-any
    const instance = new GlobalState();
    expect(instance.state.scopedRegistry).toBeDefined();
    expect(instance.state.scopedRegistry['0.0.0']).toBeDefined();
  });

  it('should create scoped registries when the platform supports them', () => {
    class ScopedCustomElementRegistry {
      initialize() {
        return undefined;
      }
    }

    vi.stubGlobal('CustomElementRegistry', ScopedCustomElementRegistry);
    window.NVE_ELEMENTS.state.scopedRegistry = {};

    const instance = new GlobalState();

    expect(instance.state.scopedRegistry['0.0.0']).toBeInstanceOf(ScopedCustomElementRegistry);
  });

  it('should fall back to customElements when scoped registries are unsupported', () => {
    class UnsupportedCustomElementRegistry {}

    vi.stubGlobal('CustomElementRegistry', UnsupportedCustomElementRegistry);
    window.NVE_ELEMENTS.state.scopedRegistry = {};

    const instance = new GlobalState();

    expect(instance.state.scopedRegistry['0.0.0']).toBe(customElements);
  });

  it('should preserve existing scoped registries when another state service initializes', () => {
    const registry = GlobalStateService.getScopedRegistry('0.0.0');

    const service = new GlobalState();

    expect(service.getScopedRegistry('0.0.0')).toBe(registry);
  });

  it.skipIf(!supportsScopedRegistry)(
    'should reuse separate scoped registries for independently versioned packages',
    () => {
      const first = GlobalStateService.getScopedRegistry('1.2.3');
      const second = GlobalStateService.getScopedRegistry('4.5.6');

      expect(GlobalStateService.getScopedRegistry('1.2.3')).toBe(first);
      expect(first).not.toBe(second);
      expect(GlobalStateService.state.scopedRegistry['4.5.6']).toBe(second);
    }
  );

  it('should warn when multiple development versions are loaded', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.NVE_ELEMENTS.state.versions = ['0.0.0', '1.0.0'];
    window.NVE_ELEMENTS.state.env = 'development';

    new GlobalState();

    expect(console.warn).toHaveBeenCalledTimes(1);
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
