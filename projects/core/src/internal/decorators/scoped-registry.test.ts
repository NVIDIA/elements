// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { GlobalStateService } from '../services/global.service.js';
import type { ElementDefinition } from '../types/index.js';
import { supportsScopedRegistry } from '../utils/dom.js';
import { scopedRegistry } from './scoped-registry.js';

const uid = Math.random().toString(36).slice(2, 8);
let counter = 0;

function createMockElement(overrides?: Pick<Partial<ElementDefinition>, 'shadowRootOptions'>): ElementDefinition {
  const tag = `nve-test-scoped-${uid}-${counter++}`;
  const el = class extends HTMLElement {
    static metadata = { version: '0.0.0', tag };
  };
  if (overrides?.shadowRootOptions) {
    Object.defineProperty(el, 'shadowRootOptions', {
      configurable: true,
      value: overrides.shadowRootOptions
    });
  }
  return el as unknown as ElementDefinition;
}

describe('scopedRegistry', () => {
  let savedScopedRegistry: { [key: string]: CustomElementRegistry };

  beforeEach(() => {
    savedScopedRegistry = GlobalStateService.state.scopedRegistry;
  });

  afterEach(() => {
    GlobalStateService.state.scopedRegistry = savedScopedRegistry;
  });

  it('should initialize scopedRegistry to an empty object if undefined', () => {
    GlobalStateService.state.scopedRegistry = undefined!;

    const element = createMockElement();
    scopedRegistry()(element as unknown as Function);

    expect(GlobalStateService.state.scopedRegistry).toBeDefined();
    expect(typeof GlobalStateService.state.scopedRegistry).toBe('object');
  });

  it('should not overwrite an existing scopedRegistry', () => {
    const element = createMockElement();
    scopedRegistry()(element as unknown as Function);

    expect(GlobalStateService.state.scopedRegistry).toBe(savedScopedRegistry);
  });

  it('should register element in its version registry', () => {
    const element = createMockElement();
    const registry = GlobalStateService.state.scopedRegistry['0.0.0'];

    scopedRegistry()(element as unknown as Function);

    expect(registry.get(element.metadata.tag)).toBe(element);
  });

  it.skipIf(!supportsScopedRegistry)('should set shadowRootOptions with customElementRegistry', () => {
    const element = createMockElement();

    scopedRegistry()(element as unknown as Function);

    expect(element.shadowRootOptions).toBeDefined();
    expect(element.shadowRootOptions!.customElementRegistry).toBe(GlobalStateService.state.scopedRegistry['0.0.0']);
  });

  it.skipIf(!supportsScopedRegistry)('should default to mode open when no existing shadowRootOptions', () => {
    const element = createMockElement();

    scopedRegistry()(element as unknown as Function);

    expect((element.shadowRootOptions as ShadowRootInit).mode).toBe('open');
  });

  it.skipIf(!supportsScopedRegistry)('should preserve existing shadowRootOptions', () => {
    const existing = { mode: 'closed' as const, customElementRegistry: null };
    const element = createMockElement({ shadowRootOptions: existing });

    scopedRegistry()(element as unknown as Function);

    expect((element.shadowRootOptions as ShadowRootInit).mode).toBe('closed');
  });
});
