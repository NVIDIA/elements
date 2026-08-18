// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneLabelAnchor } from '../../label/label.js';
import type { Vec3 } from '../types.js';

/** Parsed declarative values that the owning Scene uses to project a label. */
export interface SceneLabelConfiguration {
  readonly anchor: SceneLabelAnchor;
  readonly frame: string | null;
  readonly offset: readonly [number, number];
  readonly position: Readonly<Vec3>;
}

interface LabelState {
  dirty: boolean;
  version: number;
}

interface LabelStateSnapshot {
  readonly dirty: boolean;
  readonly version: number;
}

const labelStates = new WeakMap<HTMLElement, LabelState>();

/** Creates the internal state record for a scene label. */
export function registerLabelState(label: HTMLElement): void {
  labelStates.set(label, { dirty: true, version: 0 });
}

/** Marks externally visible label configuration as changed. */
export function touchLabelState(label: HTMLElement): void {
  getLabelState(label).version += 1;
}

/** Marks the label capture source dirty and increments its invalidation version. */
export function invalidateLabel(label: HTMLElement): void {
  const state = getLabelState(label);
  state.dirty = true;
  state.version += 1;
}

/** Returns and clears the pending capture-dirty flag. */
export function consumeLabelDirty(label: HTMLElement): boolean {
  const state = getLabelState(label);
  const dirty = state.dirty;
  state.dirty = false;
  return dirty;
}

/** Reads the nonpublic state used by the owning Scene and focused tests. */
export function getLabelStateSnapshot(label: HTMLElement): LabelStateSnapshot {
  const { dirty, version } = getLabelState(label);
  return { dirty, version };
}

/** Reads label configuration with deterministic defaults for malformed declarative values. */
export function getLabelConfiguration(label: HTMLElement): SceneLabelConfiguration {
  const frame = readNullableString(label, 'frame');
  const anchor = readAnchor(label);
  return {
    anchor,
    frame,
    offset: readFiniteVector(label, 'offset', 2) ?? [0, 0],
    position: readFiniteVector(label, 'position', 3) ?? [0, 0, 0]
  };
}

/** Applies Scene-managed reflected rendering state without exposing a public strategy setting. */
export function setLabelSceneState(label: HTMLElement, state: { stale: boolean; occluded: boolean }): void {
  label.toggleAttribute('stale', state.stale);
  label.toggleAttribute('occluded', state.occluded);
}

function getLabelState(label: HTMLElement): LabelState {
  const state = labelStates.get(label);
  if (!state) {
    throw new TypeError('Element is not a registered scene label.');
  }
  return state;
}

function readAnchor(label: HTMLElement): SceneLabelAnchor {
  const value = readString(label, 'anchor', 'center');
  return isSceneLabelAnchor(value) ? value : 'center';
}

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : (element.getAttribute(name) ?? fallback);
}

function readNullableString(element: HTMLElement, name: string): string | null {
  const value = Reflect.get(element, name);
  const source = typeof value === 'string' ? value : (element.getAttribute(name) ?? '');
  return source.trim() || null;
}

function readFiniteVector(label: HTMLElement, name: string, length: 2): [number, number] | null;
function readFiniteVector(label: HTMLElement, name: string, length: 3): Vec3 | null;
function readFiniteVector(label: HTMLElement, name: string, length: number): number[] | null {
  const value = Reflect.get(label, name);
  if (
    !Array.isArray(value) ||
    value.length !== length ||
    value.some(component => typeof component !== 'number' || !Number.isFinite(component))
  ) {
    return null;
  }
  return [...value];
}

function isSceneLabelAnchor(value: string): value is SceneLabelAnchor {
  return anchors.has(value);
}

const anchors = new Set<string>([
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right'
]);
