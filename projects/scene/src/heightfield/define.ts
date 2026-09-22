// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneHeightfield } from '@nvidia-elements/scene/heightfield';

define(SceneHeightfield);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-heightfield': SceneHeightfield;
  }
}
