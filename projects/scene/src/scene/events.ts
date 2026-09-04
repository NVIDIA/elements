// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneErrorDetail } from '../errors.js';
import type { SceneCameraChangeDetail } from '../internal/math/camera.js';
import type { ScenePickHit } from '../internal/pick/types.js';

/** Strongly typed events dispatched by Scene components. */
export interface SceneEventMap {
  'nve-scene-camera-change': CustomEvent<SceneCameraChangeDetail>;
  'nve-scene-click': CustomEvent<ScenePickHit>;
  'nve-scene-error': CustomEvent<SceneErrorDetail>;
  'nve-scene-pointerenter': CustomEvent<ScenePickHit>;
  'nve-scene-pointerleave': CustomEvent<ScenePickHit>;
  'nve-scene-ready': CustomEvent<void>;
}

declare global {
  interface HTMLElementEventMap {
    'nve-scene-camera-change': CustomEvent<SceneCameraChangeDetail>;
    'nve-scene-click': CustomEvent<ScenePickHit>;
    'nve-scene-error': CustomEvent<SceneErrorDetail>;
    'nve-scene-pointerenter': CustomEvent<ScenePickHit>;
    'nve-scene-pointerleave': CustomEvent<ScenePickHit>;
    'nve-scene-ready': CustomEvent<void>;
  }
}
