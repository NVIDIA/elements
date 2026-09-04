// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Quaternion, Vec3 } from '../types.js';

/** A coordinate-frame transform for the current scene snapshot. */
export interface FrameTransform {
  position: Vec3;
  orientation: Quaternion;
}
