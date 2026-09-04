// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const callbacks = new WeakMap<HTMLElement, (label: HTMLElement) => void>();
const renderCallbacks = new WeakMap<HTMLElement, () => void>();

/** Registers the owning Scene callback for label state changes. */
export function registerSceneLabelNotifications(
  scene: HTMLElement,
  callback: (label: HTMLElement) => void
): () => void {
  callbacks.set(scene, callback);
  return () => callbacks.delete(scene);
}

/** Notifies the closest owning Scene that a label needs reconciliation. */
export function notifyOwningSceneLabel(label: HTMLElement): void {
  const scene = closestOwningScene(label);
  if (scene) {
    callbacks.get(scene)?.(label);
  }
}

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
