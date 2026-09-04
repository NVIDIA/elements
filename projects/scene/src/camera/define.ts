// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import '@nvidia-elements/scene/frame/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneCamera } from '@nvidia-elements/scene/camera';

define(SceneCamera);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-camera': SceneCamera;
  }
}
