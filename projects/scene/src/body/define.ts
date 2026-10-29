// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { SceneBody, SceneShape } from '@nvidia-elements/scene/body';

define(SceneShape);
define(SceneBody);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-body': SceneBody;
    'nve-scene-shape': SceneShape;
  }
}
