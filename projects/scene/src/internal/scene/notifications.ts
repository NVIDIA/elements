// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type SceneNotificationKind = 'identity' | 'render';

const renderCallbacks = new WeakMap<HTMLElement, (source: HTMLElement, kind: SceneNotificationKind) => void>();

/** Registers a private wake callback for state owned by a Scene descendant. */
export function registerSceneRenderNotifications(
  scene: HTMLElement,
  callback: (source: HTMLElement, kind: SceneNotificationKind) => void
): () => void {
  renderCallbacks.set(scene, callback);
  return () => renderCallbacks.delete(scene);
}

/** Wakes the closest owning Scene after an internal state version changes. */
export function notifyOwningScene(element: HTMLElement, kind: SceneNotificationKind = 'render'): void {
  const scene = closestOwningScene(element);
  if (scene) renderCallbacks.get(scene)?.(element, kind);
}

function closestOwningScene(element: HTMLElement): HTMLElement | null {
  // Lit SSR element shims omit DOM traversal APIs during construction.
  return typeof element.closest === 'function' ? element.closest<HTMLElement>('nve-scene') : null;
}
