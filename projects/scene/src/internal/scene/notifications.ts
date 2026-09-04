// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const renderCallbacks = new WeakMap<HTMLElement, () => void>();

/** Registers a private wake callback for state owned by a Scene descendant. */
export function registerSceneRenderNotifications(scene: HTMLElement, callback: () => void): () => void {
  renderCallbacks.set(scene, callback);
  return () => renderCallbacks.delete(scene);
}

/** Wakes the closest owning Scene after an internal state version changes. */
export function notifyOwningScene(element: HTMLElement): void {
  const scene = closestOwningScene(element);
  if (scene) renderCallbacks.get(scene)?.();
}

function closestOwningScene(element: HTMLElement): HTMLElement | null {
  // Lit SSR element shims omit DOM traversal APIs during construction.
  return typeof element.closest === 'function' ? element.closest<HTMLElement>('nve-scene') : null;
}
