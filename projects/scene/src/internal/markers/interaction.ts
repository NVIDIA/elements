// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface SceneMarkerInteractionController {
  activateMarker(marker: HTMLElement, event: KeyboardEvent): void;
}

const controllers = new WeakMap<HTMLElement, SceneMarkerInteractionController>();

export function registerSceneMarkerInteractionController(
  scene: HTMLElement,
  controller: SceneMarkerInteractionController
): () => void {
  controllers.set(scene, controller);
  return () => controllers.delete(scene);
}

/** Routes keyboard activation through the owning scene's synthetic-click path. */
export function activateSceneMarker(marker: HTMLElement, event: KeyboardEvent): void {
  const scene = marker.closest<HTMLElement>('nve-scene');
  if (scene) {
    controllers.get(scene)?.activateMarker(marker, event);
  }
}
