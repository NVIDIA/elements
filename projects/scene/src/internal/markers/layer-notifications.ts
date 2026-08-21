// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const callbacks = new WeakMap<HTMLElement, (marker: HTMLElement) => void>();

export function registerMarkerLayerNotifications(
  layer: HTMLElement,
  callback: (marker: HTMLElement) => void
): () => void {
  callbacks.set(layer, callback);
  return () => callbacks.delete(layer);
}

export function notifyOwningMarkerLayer(marker: HTMLElement): void {
  const parent = marker.parentElement;
  if (parent) {
    callbacks.get(parent)?.(marker);
  }
}
