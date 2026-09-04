// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import {
  getLayerFeatureIds,
  getLayerInteractive,
  registerFeatureIdentifiedLayer,
  registerInteractiveLayer,
  setLayerFeatureIds,
  setLayerInteractive
} from './interactive-layer-state.js';
import { registerSceneRenderNotifications } from './scene/notifications.js';

describe('interactive layer state', () => {
  it('rejects unregistered layers', () => {
    const layer = createLayer();

    expect(() => getLayerInteractive(layer)).toThrow(TypeError);
    expect(() => setLayerInteractive(layer, true)).toThrow(TypeError);
  });

  it('updates pointer interaction once per changed value', () => {
    const layer = createLayer();
    registerInteractiveLayer(layer);
    const { notify, remove } = attachToScene(layer);

    try {
      expect(getLayerInteractive(layer)).toBe(false);

      setLayerInteractive(layer, true);
      expect(getLayerInteractive(layer)).toBe(true);
      expect(layer.requestUpdate).toHaveBeenCalledWith('interactive', false);
      expect(notify).toHaveBeenCalledOnce();

      setLayerInteractive(layer, true);
      expect(layer.requestUpdate).toHaveBeenCalledOnce();
      expect(notify).toHaveBeenCalledOnce();
    } finally {
      remove();
    }
  });

  it('registers and updates feature identities with the shared interaction state', () => {
    const layer = createLayer();
    registerFeatureIdentifiedLayer(layer);
    const { notify, remove } = attachToScene(layer);

    try {
      expect(getLayerInteractive(layer)).toBe(false);
      expect(getLayerFeatureIds(layer)).toBeNull();

      setLayerFeatureIds(layer, 42);
      expect(getLayerFeatureIds(layer)).toBe(42);
      expect(layer.requestUpdate).toHaveBeenCalledWith('featureIds', null);
      expect(notify).toHaveBeenCalledOnce();
    } finally {
      remove();
    }
  });
});

class TestLayer extends HTMLElement {
  readonly requestUpdate = vi.fn();
}

const TEST_LAYER_TAG = 'test-interactive-layer-state';
if (!customElements.get(TEST_LAYER_TAG)) customElements.define(TEST_LAYER_TAG, TestLayer);

function createLayer(): TestLayer {
  const layer = document.createElement(TEST_LAYER_TAG);
  if (!(layer instanceof TestLayer)) throw new TypeError('Test layer registration failed.');
  return layer;
}

function attachToScene(layer: TestLayer): { notify: ReturnType<typeof vi.fn>; remove: () => void } {
  const scene = document.createElement('nve-scene');
  const notify = vi.fn();
  const unregister = registerSceneRenderNotifications(scene, notify);
  scene.append(layer);
  document.body.append(scene);
  return {
    notify,
    remove(): void {
      unregister();
      scene.remove();
    }
  };
}
