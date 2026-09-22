// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneErrorDetail } from '../internal/diagnostics/errors.js';
import type { SceneCameraChangeDetail } from '../internal/composition/camera/math.js';
import type { SceneClick, ScenePointerEnter, ScenePointerLeave } from '../internal/interaction/picking/types.js';

/** Strongly typed events dispatched by Scene components. */
export interface SceneEventMap {
  'nve-scene-camera-change': CustomEvent<SceneCameraChangeDetail>;
  'nve-scene-click': CustomEvent<SceneClick>;
  'nve-scene-error': CustomEvent<SceneErrorDetail>;
  'nve-scene-pointerenter': CustomEvent<ScenePointerEnter>;
  'nve-scene-pointerleave': CustomEvent<ScenePointerLeave>;
  'nve-scene-ready': CustomEvent<void>;
}

declare global {
  interface HTMLElementEventMap {
    'nve-scene-camera-change': CustomEvent<SceneCameraChangeDetail>;
    'nve-scene-click': CustomEvent<SceneClick>;
    'nve-scene-error': CustomEvent<SceneErrorDetail>;
    'nve-scene-pointerenter': CustomEvent<ScenePointerEnter>;
    'nve-scene-pointerleave': CustomEvent<ScenePointerLeave>;
    'nve-scene-ready': CustomEvent<void>;
  }
}
