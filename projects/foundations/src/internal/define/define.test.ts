// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { define, defineElement } from '@nvidia-elements/foundations/internal/define';
import { GlobalStateService } from '@nvidia-elements/foundations/internal/state';
import { GlobalState } from '../state/state.js';

let sequence = 0;

function createElement(version = '1.0.0') {
  return class extends HTMLElement {
    static readonly metadata = { tag: `foundations-define-${sequence++}`, version };
  };
}

describe('define', () => {
  beforeEach(() => {
    vi.stubGlobal('NVE_ELEMENTS', undefined);
    new GlobalState();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize registration state without importing core', () => {
    const element = createElement();
    define(element);
    expect(customElements.get(element.metadata.tag)).toBe(element);
    expect(globalThis.NVE_ELEMENTS.state.elementRegistry).toEqual({ [element.metadata.tag]: '1.0.0' });
    expect(globalThis.NVE_ELEMENTS.state.versions).toEqual(['0.0.0']);
    expect(globalThis.NVE_ELEMENTS.state.scopedRegistry['0.0.0']).toBeDefined();
  });

  it('should preserve registrations and unrelated state', () => {
    const state = GlobalStateService.state;
    state.elementRegistry = { existing: '2.0.0' };
    state.i18nRegistry = { en: '1.0.0' };
    const element = createElement();
    define(element);
    expect(globalThis.NVE_ELEMENTS.state).toBe(state);
    expect(state.elementRegistry).toEqual({ existing: '2.0.0', [element.metadata.tag]: '1.0.0' });
    expect(state.i18nRegistry).toEqual({ en: '1.0.0' });
  });

  it('should emit registration events with the complete shared state', () => {
    const listener = vi.fn();
    document.addEventListener('NVE_ELEMENT_DEFINE', listener, { once: true });
    const element = createElement();
    define(element);
    expect(listener).toHaveBeenCalledTimes(1);
    const event: CustomEvent = listener.mock.calls[0]![0];
    expect(event.detail).toBe(globalThis.NVE_ELEMENTS.state);
    expect(event.detail.elementRegistry[element.metadata.tag]).toBe('1.0.0');
  });

  it('should preserve an existing registration and its version', () => {
    const element = createElement();
    class DuplicateElement extends HTMLElement {
      static readonly metadata = element.metadata;
    }
    define(element);
    const listener = vi.fn();
    document.addEventListener('NVE_ELEMENT_DEFINE', listener);
    try {
      expect(() => define(element)).not.toThrow();
      expect(() => define(DuplicateElement)).not.toThrow();
      expect(customElements.get(element.metadata.tag)).toBe(element);
      expect(globalThis.NVE_ELEMENTS.state.elementRegistry[element.metadata.tag]).toBe('1.0.0');
      expect(listener).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('NVE_ELEMENT_DEFINE', listener);
    }
  });

  it('should register only the root globally when scoped registries are supported', () => {
    const child = createElement();
    class Parent extends createElement() {
      static readonly elementDefinitions = { [child.metadata.tag]: child };
    }
    define(Parent);
    define(Parent);
    expect(customElements.get(Parent.metadata.tag)).toBe(Parent);
    expect(customElements.get(child.metadata.tag)).toBeUndefined();
    expect(globalThis.NVE_ELEMENTS.state.elementRegistry).toEqual({ [Parent.metadata.tag]: '1.0.0' });
  });

  it('should register descendants before their parent in the global registry', () => {
    const child = createElement();
    class Parent extends createElement() {
      static readonly elementDefinitions = { [child.metadata.tag]: child };
    }
    const registered: string[] = [];
    const listener = () => registered.push(...Object.keys(globalThis.NVE_ELEMENTS.state.elementRegistry));
    document.addEventListener('NVE_ELEMENT_DEFINE', listener);
    try {
      defineElement(Parent, customElements);
      expect(customElements.get(child.metadata.tag)).toBe(child);
      expect(customElements.get(Parent.metadata.tag)).toBe(Parent);
      expect(registered).toEqual([child.metadata.tag, child.metadata.tag, Parent.metadata.tag]);
    } finally {
      document.removeEventListener('NVE_ELEMENT_DEFINE', listener);
    }
  });

  it('should keep scoped registrations out of global registration state', () => {
    const registry = new CustomElementRegistry();
    const element = createElement();
    const state = GlobalStateService.state;
    const listener = vi.fn();
    document.addEventListener('NVE_ELEMENT_DEFINE', listener);
    try {
      defineElement(element, registry);
      expect(registry.get(element.metadata.tag)).toBe(element);
      expect(customElements.get(element.metadata.tag)).toBeUndefined();
      expect(state.elementRegistry).toEqual({});
      expect(listener).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('NVE_ELEMENT_DEFINE', listener);
    }
  });

  it('should warn about conflicting versions on localhost without replacing the original', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const element = createElement();
    class DuplicateElement extends HTMLElement {
      static readonly metadata = { tag: element.metadata.tag, version: '2.0.0' };
    }
    define(element);
    define(DuplicateElement);
    await vi.waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('version 2.0.0 already defined')));
    expect(customElements.get(element.metadata.tag)).toBe(element);
    expect(globalThis.NVE_ELEMENTS.state.elementRegistry[element.metadata.tag]).toBe('1.0.0');
  });

  it('should not warn about matching versions on localhost', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const element = createElement();
    define(element);
    define(element);
    expect(warn).not.toHaveBeenCalled();
  });

  it('should leave an existing registry entry unchanged', () => {
    const registry = new CustomElementRegistry();
    const element = createElement();
    defineElement(element, registry);
    const defineSpy = vi.spyOn(registry, 'define');
    defineElement(element, registry);
    expect(registry.get(element.metadata.tag)).toBe(element);
    expect(defineSpy).not.toHaveBeenCalled();
  });

  it('should register descendants globally when scoped registries are unavailable', async () => {
    const prototype = CustomElementRegistry.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'initialize');
    const listener = vi.fn();
    expect(descriptor).toBeDefined();
    expect(Reflect.deleteProperty(prototype, 'initialize')).toBe(true);
    document.addEventListener('NVE_ELEMENT_DEFINE', listener);

    try {
      // The support flag is fixed when the module first loads, so import a fresh copy.
      const defineModule = await import('./define.js?legacy-registry=1');
      expect(defineModule.supportsScopedRegistry).toBe(false);

      const child = createElement();
      class Parent extends createElement() {
        static readonly elementDefinitions = { [child.metadata.tag]: child };
      }
      defineModule.define(Parent);
      expect(customElements.get(child.metadata.tag)).toBe(child);
      expect(customElements.get(Parent.metadata.tag)).toBe(Parent);
      expect(globalThis.NVE_ELEMENTS.state.elementRegistry).toEqual({
        [child.metadata.tag]: '1.0.0',
        [Parent.metadata.tag]: '1.0.0'
      });
      expect(listener).toHaveBeenCalledTimes(2);

      listener.mockClear();
      defineModule.define(Parent);
      expect(customElements.get(Parent.metadata.tag)).toBe(Parent);
      expect(listener).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('NVE_ELEMENT_DEFINE', listener);
      if (descriptor) {
        Object.defineProperty(prototype, 'initialize', descriptor);
      }
    }
  });

  it('should not warn about conflicting versions on other hosts', () => {
    vi.stubGlobal(
      'globalThis',
      new Proxy(globalThis, {
        get(target, key) {
          return key === 'location' ? { hostname: 'example.com' } : Reflect.get(target, key);
        }
      })
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const element = createElement();
    class DuplicateElement extends HTMLElement {
      static readonly metadata = { tag: element.metadata.tag, version: '2.0.0' };
    }
    define(element);
    define(DuplicateElement);
    expect(warn).not.toHaveBeenCalled();
  });
});
