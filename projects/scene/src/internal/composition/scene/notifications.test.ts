// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { notifyOwningScene, registerSceneRenderNotifications } from './notifications.js';

describe('scene render notifications', () => {
  it('routes identity and render changes to the closest owning scene and supports disposal', () => {
    const outer = document.createElement('nve-scene');
    const inner = document.createElement('nve-scene');
    const layer = document.createElement('div');
    outer.append(inner);
    inner.append(layer);
    const outerCallback = vi.fn();
    const innerCallback = vi.fn();
    const removeOuter = registerSceneRenderNotifications(outer, outerCallback);
    const removeInner = registerSceneRenderNotifications(inner, innerCallback);
    notifyOwningScene(layer);
    notifyOwningScene(layer, 'identity');
    expect(innerCallback.mock.calls).toEqual([
      [layer, 'render'],
      [layer, 'identity']
    ]);
    expect(outerCallback).not.toHaveBeenCalled();
    removeInner();
    notifyOwningScene(layer);
    expect(innerCallback).toHaveBeenCalledTimes(2);
    removeOuter();
  });

  it('accepts detached elements and server shims without DOM traversal', () => {
    expect(() => notifyOwningScene(document.createElement('div'))).not.toThrow();
    const shim = document.createElement('div');
    Object.defineProperty(shim, 'closest', { value: undefined });
    expect(() => notifyOwningScene(shim)).not.toThrow();
  });
});
