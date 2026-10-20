// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/frame/define.js';
import { define } from '@nvidia-elements/core/internal';
import { SceneModel } from '@nvidia-elements/scene/model';

define(SceneModel);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-model': SceneModel;
  }
}
