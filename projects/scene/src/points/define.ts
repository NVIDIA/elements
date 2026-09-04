// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/core/internal';
import { ScenePoints } from '@nvidia-elements/scene/points';

define(ScenePoints);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-points': ScenePoints;
  }
}
