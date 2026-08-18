// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const callbacks = new WeakMap<HTMLElement, (label: HTMLElement) => void>();

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
  const scene = label.closest<HTMLElement>('nve-scene');
  if (scene) {
    callbacks.get(scene)?.(label);
  }
}
