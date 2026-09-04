// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getSceneFeatureIds,
  registerSceneFeatureIdLayer,
  setSceneFeatureIds,
  type SceneFeatureIds
} from './feature-ids.js';
import { notifyOwningScene } from './scene/notifications.js';

interface InteractiveLayerHost extends HTMLElement {
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
}

const states = new WeakMap<InteractiveLayerHost, { interactive: boolean }>();

/** Registers shared pointer-interaction state for a Scene layer host. */
export function registerInteractiveLayer(layer: InteractiveLayerHost): void {
  states.set(layer, { interactive: false });
}

/** Registers shared pointer-interaction and feature-identity state for a Scene layer host. */
export function registerFeatureIdentifiedLayer(layer: InteractiveLayerHost): void {
  registerInteractiveLayer(layer);
  registerSceneFeatureIdLayer(layer);
}

/** Returns whether a registered layer enables automatic pointer interaction. */
export function getLayerInteractive(layer: InteractiveLayerHost): boolean {
  return getState(layer).interactive;
}

/** Updates automatic pointer interaction for a registered layer. */
export function setLayerInteractive(layer: InteractiveLayerHost, value: boolean): void {
  const state = getState(layer);
  const previous = state.interactive;
  if (value === previous) return;
  state.interactive = value;
  notifyOwningScene(layer);
  layer.requestUpdate('interactive', previous);
}

/** Returns the application-owned feature identities for a registered layer. */
export function getLayerFeatureIds(layer: InteractiveLayerHost): SceneFeatureIds | null {
  return getSceneFeatureIds(layer);
}

/** Updates the application-owned feature identities for a registered layer. */
export function setLayerFeatureIds(layer: InteractiveLayerHost, value: SceneFeatureIds | null): void {
  const previous = getSceneFeatureIds(layer);
  setSceneFeatureIds(layer, value);
  layer.requestUpdate('featureIds', previous);
}

function getState(layer: InteractiveLayerHost): { interactive: boolean } {
  const state = states.get(layer);
  if (!state) throw new TypeError('Interactive layer is not registered.');
  return state;
}
