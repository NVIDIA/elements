// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Public capability shared by scene layers that can receive automatic pointer interaction. */
export interface SceneInteractionTarget {
  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  interactive: boolean;
}

export function isInteractiveLayer(layer: HTMLElement): layer is HTMLElement & SceneInteractionTarget {
  return Reflect.get(layer, 'interactive') === true;
}
