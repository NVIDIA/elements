// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneFrame } from '@nvidia-elements/scene/frame';

define(SceneFrame);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-frame': SceneFrame;
  }
}
