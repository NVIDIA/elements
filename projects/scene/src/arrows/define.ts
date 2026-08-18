// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import '@nvidia-elements/scene/marker/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneArrows } from '@nvidia-elements/scene/arrows';

define(SceneArrows);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-arrows': SceneArrows;
  }
}
