// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import '@nvidia-elements/scene/scene/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneTriangles } from '@nvidia-elements/scene/triangles';
define(SceneTriangles);
declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-triangles': SceneTriangles;
  }
}
