// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/scene/body/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { SceneJoint } from '@nvidia-elements/scene/joint';

define(SceneJoint);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scene-joint': SceneJoint;
  }
}
