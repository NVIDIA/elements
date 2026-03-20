import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GlobalStateService } from '../services/global.service.js';
import type { ElementDefinition } from '../types/index.js';

const mockDefineElement = vi.hoisted(() => vi.fn());

vi.mock('../utils/dom.js', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, supportsScopedRegistry: true, defineElement: mockDefineElement };
});

import { scopedRegistry } from './scoped-registry.js';

function createMockElement(overrides?: Partial<ElementDefinition>): ElementDefinition {
  return {
    metadata: { version: '0.0.0', tag: 'nve-test-scoped' },
    ...overrides
  } as ElementDefinition;
}

describe('scopedRegistry', () => {
  let savedScopedRegistry: { [key: string]: CustomElementRegistry };

  beforeEach(() => {
    mockDefineElement.mockClear();
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

  it('should call defineElement with element and its version registry', () => {
    const element = createMockElement();
    const registry = GlobalStateService.state.scopedRegistry['0.0.0'];

    scopedRegistry()(element as unknown as Function);

    expect(mockDefineElement).toHaveBeenCalledWith(element, registry);
  });

  it('should set shadowRootOptions with customElementRegistry', () => {
    const element = createMockElement();

    scopedRegistry()(element as unknown as Function);

    expect(element.shadowRootOptions).toBeDefined();
    expect(element.shadowRootOptions!.customElementRegistry).toBe(GlobalStateService.state.scopedRegistry['0.0.0']);
  });

  it('should default to mode open when no existing shadowRootOptions', () => {
    const element = createMockElement();

    scopedRegistry()(element as unknown as Function);

    expect((element.shadowRootOptions as ShadowRootInit).mode).toBe('open');
  });

  it('should preserve existing shadowRootOptions', () => {
    const existing = { mode: 'closed' as const, customElementRegistry: null };
    const element = createMockElement({ shadowRootOptions: existing });

    scopedRegistry()(element as unknown as Function);

    expect((element.shadowRootOptions as ShadowRootInit).mode).toBe('closed');
  });
});
