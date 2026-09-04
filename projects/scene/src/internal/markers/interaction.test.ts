// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { activateSceneMarker, registerSceneMarkerInteractionController } from './interaction.js';

describe('scene marker interaction', () => {
  it('routes activation only while the owning scene controller is registered', () => {
    const scene = document.createElement('nve-scene');
    const marker = document.createElement('button');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const activateMarker = vi.fn();
    scene.append(marker);

    activateSceneMarker(document.createElement('button'), event);
    const unregister = registerSceneMarkerInteractionController(scene, { activateMarker });
    activateSceneMarker(marker, event);
    expect(activateMarker).toHaveBeenCalledWith(marker, event);

    unregister();
    activateSceneMarker(marker, event);
    expect(activateMarker).toHaveBeenCalledOnce();
  });
});
