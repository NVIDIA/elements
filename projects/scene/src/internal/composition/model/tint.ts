// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveSceneColor } from '../../color/color.js';
import { PreparedRGBAModulation } from '../../color/modulation.js';
import type { RGBA } from '../../color/types.js';

const tints = new WeakMap<HTMLElement, PreparedRGBAModulation>();

export function setModelTint(model: HTMLElement, tint: string): void {
  tints.set(model, new PreparedRGBAModulation(resolveSceneColor(tint)));
}

/** Uses the existing linear-light tint pipeline; body geometry remains unchanged. */
export function composeModelTint(body: HTMLElement, ownTint: RGBA): RGBA {
  const color: RGBA = [...ownTint];
  const scene = body.closest('nve-scene');
  let model = body.parentElement?.closest<HTMLElement>('nve-scene-model');
  while (model && model.closest('nve-scene') === scene) {
    tints.get(model)?.writeColor(color, 0, color, 0);
    model = model.parentElement?.closest<HTMLElement>('nve-scene-model');
  }
  return color;
}
