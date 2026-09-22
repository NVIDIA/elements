// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneLines } from '@nvidia-elements/scene/lines';
define(SceneLines);
declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-lines': SceneLines;
  }
}
